package pulse

import (
	"context"
	"fmt"
	"runtime"
	"sync/atomic"
	"time"
)

// Config controls the PulseLoop. Zero values are replaced with production
// defaults by New.
type Config struct {
	// MinWorkers is the floor of the elastic pool. Default: 2.
	MinWorkers int
	// MaxWorkers is the ceiling of the elastic pool. Default: 4×GOMAXPROCS.
	MaxWorkers int
	// MaxDepth is the recursion depth budget: a root submission runs at depth
	// 0 and Spawn fails once a child would exceed this depth. Default: 8.
	MaxDepth int
	// QueueSize bounds the global submission queue; Submit returns
	// ErrQueueFull beyond it (backpressure). Default: 1024.
	QueueSize int
	// DefaultTimeout is the deadline applied to each root submission and
	// inherited by its whole subtree. Zero disables the deadline.
	// Default: 30s.
	DefaultTimeout time.Duration
	// TuneInterval is how often the feedback tuner samples metrics and
	// adjusts the pool. Default: 250ms.
	TuneInterval time.Duration
}

func (c *Config) applyDefaults() error {
	if c.MinWorkers == 0 {
		c.MinWorkers = 2
	}
	if c.MaxWorkers == 0 {
		c.MaxWorkers = 4 * runtime.GOMAXPROCS(0)
	}
	if c.MaxDepth == 0 {
		c.MaxDepth = 8
	}
	if c.QueueSize == 0 {
		c.QueueSize = 1024
	}
	if c.DefaultTimeout == 0 {
		c.DefaultTimeout = 30 * time.Second
	}
	if c.TuneInterval == 0 {
		c.TuneInterval = 250 * time.Millisecond
	}
	if c.MinWorkers < 1 || c.MaxWorkers < c.MinWorkers || c.MaxDepth < 1 || c.QueueSize < 1 {
		return fmt.Errorf("pulse: invalid config %+v", *c)
	}
	return nil
}

// Loop is the PulseLoop: submission intake, work-stealing execution, and a
// closed feedback loop that tunes the pool from live metrics.
type Loop struct {
	cfg     Config
	pool    *pool
	metrics *Metrics
	tuner   *tuner

	rootCtx    context.Context
	rootCancel context.CancelFunc
	closed     atomic.Bool
	started    atomic.Bool
}

// New validates cfg (applying defaults) and creates a stopped Loop.
func New(cfg Config) (*Loop, error) {
	if err := cfg.applyDefaults(); err != nil {
		return nil, err
	}
	ctx, cancel := context.WithCancel(context.Background())
	l := &Loop{
		cfg:        cfg,
		metrics:    newMetrics(),
		rootCtx:    ctx,
		rootCancel: cancel,
	}
	l.pool = newPool(l)
	l.tuner = newTuner(l)
	return l, nil
}

// Start launches the minimum worker set and the feedback tuner.
func (l *Loop) Start() {
	if !l.started.CompareAndSwap(false, true) {
		return
	}
	l.pool.ensureWorkers(int64(l.cfg.MinWorkers))
	l.tuner.start()
}

// Submit schedules fn as a root task (depth 0) with a fresh correlation ID
// and the configured default timeout. It applies backpressure by returning
// ErrQueueFull when the intake queue is at capacity.
func (l *Loop) Submit(name string, fn TaskFunc) (*Handle, error) {
	if l.closed.Load() {
		return nil, ErrClosed
	}
	var (
		ctx    context.Context
		cancel context.CancelFunc
	)
	if l.cfg.DefaultTimeout > 0 {
		ctx, cancel = context.WithTimeout(l.rootCtx, l.cfg.DefaultTimeout)
	} else {
		ctx, cancel = context.WithCancel(l.rootCtx)
	}
	t := newTask(l, nil, name, 0, newCorrelationID(), ctx, cancel, fn)
	if err := l.pool.enqueueGlobal(t); err != nil {
		cancel()
		l.metrics.Rejected.Add(1)
		return nil, err
	}
	l.metrics.Submitted.Add(1)
	return &Handle{t: t}, nil
}

// Shutdown stops the loop gracefully: new submissions are rejected, then it
// waits for in-flight work to drain until ctx expires, at which point the
// remaining subtree contexts are cancelled and completion is awaited briefly.
// It returns ctx.Err() if the forced path was taken.
func (l *Loop) Shutdown(ctx context.Context) error {
	if !l.closed.CompareAndSwap(false, true) {
		return nil
	}
	l.tuner.stopTuner()

	var err error
drain:
	for !l.pool.drained() {
		select {
		case <-ctx.Done():
			err = ctx.Err()
			// Force: cancel every outstanding subtree, then let workers
			// resolve the (now fast-failing) queued tasks.
			l.rootCancel()
			for !l.pool.drained() {
				time.Sleep(2 * time.Millisecond)
			}
			break drain
		case <-time.After(2 * time.Millisecond):
		}
	}

	l.rootCancel()
	close(l.pool.stop)
	l.pool.wg.Wait()
	return err
}

// Metrics returns the loop's live metric set.
func (l *Loop) Metrics() *Metrics { return l.metrics }

// Stats is a point-in-time snapshot of pool state for dashboards and tests.
type Stats struct {
	Workers       int64
	TargetWorkers int64
	Inflight      int64
	QueueDepth    int64
}

// Stats snapshots the pool.
func (l *Loop) Stats() Stats {
	return Stats{
		Workers:       l.pool.current.Load(),
		TargetWorkers: l.pool.target.Load(),
		Inflight:      l.pool.inflight.Load(),
		QueueDepth:    l.pool.queueDepth(),
	}
}
