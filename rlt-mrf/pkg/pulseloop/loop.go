package pulseloop

import (
	"context"
	"fmt"
	"math/rand"
	"sync"
	"sync/atomic"
	"time"
)

// Config bounds every dimension of the PulseLoop: worker pool size, queue
// capacity and recursion depth. Zero values fall back to safe defaults.
type Config struct {
	// MinWorkers and MaxWorkers bound the dynamically sized pool.
	MinWorkers int
	MaxWorkers int
	// QueueSize caps the global submission queue; a full queue rejects
	// with ErrQueueFull so backpressure surfaces at the edge.
	QueueSize int
	// LocalQueueSize caps each worker's local queue used for spawn
	// locality and work stealing.
	LocalQueueSize int
	// MaxDepth is the recursion depth budget for the whole loop.
	MaxDepth int
	// DefaultTimeout applies to root submissions whose context carries
	// no deadline, so no task can run unbounded.
	DefaultTimeout time.Duration
}

func (c Config) withDefaults() Config {
	if c.MinWorkers <= 0 {
		c.MinWorkers = 2
	}
	if c.MaxWorkers < c.MinWorkers {
		c.MaxWorkers = c.MinWorkers * 4
	}
	if c.QueueSize <= 0 {
		c.QueueSize = 1024
	}
	if c.LocalQueueSize <= 0 {
		c.LocalQueueSize = 64
	}
	if c.MaxDepth <= 0 {
		c.MaxDepth = 8
	}
	if c.DefaultTimeout <= 0 {
		c.DefaultTimeout = 30 * time.Second
	}
	return c
}

type worker struct {
	id    int
	local chan *task
	quit  chan struct{}
}

// Loop is the PulseLoop: a bounded, observable, work-stealing executor for
// recursive task graphs.
type Loop struct {
	cfg     Config
	global  chan *task
	metrics *Metrics

	mu      sync.Mutex
	workers []*worker
	nextID  int

	stopped  atomic.Bool
	inflight sync.WaitGroup // outstanding tasks
	wg       sync.WaitGroup // worker goroutines
	busy     atomic.Int64
}

// New creates a PulseLoop and starts cfg.MinWorkers workers.
func New(cfg Config) *Loop {
	cfg = cfg.withDefaults()
	l := &Loop{
		cfg:     cfg,
		global:  make(chan *task, cfg.QueueSize),
		metrics: newMetrics(),
	}
	l.SetWorkers(cfg.MinWorkers)
	return l
}

// Config returns the effective (defaulted) configuration.
func (l *Loop) Config() Config { return l.cfg }

// Metrics exposes the loop's counters for the feedback controller and the
// /metrics endpoint.
func (l *Loop) Metrics() *Metrics { return l.metrics }

// Workers returns the current worker pool size.
func (l *Loop) Workers() int {
	l.mu.Lock()
	defer l.mu.Unlock()
	return len(l.workers)
}

// Busy returns how many workers are currently executing a task.
func (l *Loop) Busy() int { return int(l.busy.Load()) }

// QueueDepth returns the number of tasks waiting in the global queue.
func (l *Loop) QueueDepth() int { return len(l.global) }

// SetWorkers resizes the pool to n, clamped to [MinWorkers, MaxWorkers].
// Removed workers finish their current task and drain their local queue
// before exiting, so no task is lost during scale-down.
func (l *Loop) SetWorkers(n int) {
	if n < l.cfg.MinWorkers {
		n = l.cfg.MinWorkers
	}
	if n > l.cfg.MaxWorkers {
		n = l.cfg.MaxWorkers
	}
	l.mu.Lock()
	defer l.mu.Unlock()
	for len(l.workers) < n {
		w := &worker{
			id:    l.nextID,
			local: make(chan *task, l.cfg.LocalQueueSize),
			quit:  make(chan struct{}),
		}
		l.nextID++
		l.workers = append(l.workers, w)
		l.wg.Add(1)
		go l.runWorker(w)
	}
	for len(l.workers) > n {
		w := l.workers[len(l.workers)-1]
		l.workers = l.workers[:len(l.workers)-1]
		close(w.quit)
	}
	l.metrics.workers.Store(int64(len(l.workers)))
}

// Submit enqueues a root task (depth 0). corrID identifies the recursive
// call graph in traces and logs; if empty, one is generated. If ctx has no
// deadline, Config.DefaultTimeout is applied so the task graph is bounded
// in time as well as depth.
func (l *Loop) Submit(ctx context.Context, corrID string, fn TaskFunc) (*Handle, error) {
	if corrID == "" {
		corrID = fmt.Sprintf("pulse-%08x", rand.Uint32())
	}
	var cancel context.CancelFunc
	if _, hasDeadline := ctx.Deadline(); !hasDeadline {
		ctx, cancel = context.WithTimeout(ctx, l.cfg.DefaultTimeout)
	}
	h, err := l.submit(ctx, nil, fn, 0, corrID)
	if cancel != nil {
		if err != nil {
			cancel()
		} else {
			go func() { <-h.done; cancel() }()
		}
	}
	return h, err
}

// submit enqueues a task, preferring the spawning worker's local queue
// (cache locality; siblings steal from it) and overflowing to the global
// queue. Backpressure differs by origin: root submissions (depth 0) fail
// fast with ErrQueueFull so overload surfaces at the edge, while internal
// spawns help drain the pool until space frees or their context is
// canceled — a recursive graph slows down under load instead of tearing
// itself apart mid-expansion.
func (l *Loop) submit(ctx context.Context, from *worker, fn TaskFunc, depth int, corrID string) (*Handle, error) {
	if l.stopped.Load() {
		return nil, ErrStopped
	}
	h := newHandle(l)
	t := &task{fn: fn, depth: depth, corrID: corrID, ctx: ctx, handle: h, enqueued: time.Now()}
	l.inflight.Add(1)
	accepted := func() (*Handle, error) {
		l.metrics.submitted.Add(1)
		l.metrics.maxDepthSeen(depth)
		return h, nil
	}
	if from != nil {
		select {
		case from.local <- t:
			return accepted()
		default:
		}
	}
	for {
		select {
		case l.global <- t:
			return accepted()
		default:
		}
		if depth == 0 {
			l.inflight.Done()
			l.metrics.rejected.Add(1)
			return nil, ErrQueueFull
		}
		if err := ctx.Err(); err != nil {
			l.inflight.Done()
			return nil, err
		}
		if !l.runOne() {
			time.Sleep(50 * time.Microsecond)
		}
	}
}

func (l *Loop) runWorker(w *worker) {
	defer l.wg.Done()
	for {
		// Fast path: local first (spawn locality), then global.
		select {
		case t := <-w.local:
			l.exec(w, t)
			continue
		default:
		}
		select {
		case t := <-w.local:
			l.exec(w, t)
			continue
		case t := <-l.global:
			l.exec(w, t)
			continue
		case <-w.quit:
			l.drain(w)
			return
		default:
		}
		// Nothing queued for us: try stealing from a sibling.
		if t := l.steal(w); t != nil {
			l.metrics.stolen.Add(1)
			l.exec(w, t)
			continue
		}
		// Idle: block until work or shutdown. The timeout re-runs the
		// steal path so tasks parked on a busy sibling's local queue
		// cannot starve while this worker sleeps.
		idle := time.NewTimer(time.Millisecond)
		select {
		case t := <-w.local:
			l.exec(w, t)
		case t := <-l.global:
			l.exec(w, t)
		case <-w.quit:
			idle.Stop()
			l.drain(w)
			return
		case <-idle.C:
		}
		idle.Stop()
	}
}

func (l *Loop) steal(self *worker) *task {
	l.mu.Lock()
	victims := make([]*worker, len(l.workers))
	copy(victims, l.workers)
	l.mu.Unlock()
	offset := rand.Intn(len(victims) + 1)
	for i := range victims {
		v := victims[(i+offset)%len(victims)]
		if v == self {
			continue
		}
		select {
		case t := <-v.local:
			return t
		default:
		}
	}
	return nil
}

// drain moves a departing worker's local tasks to the global queue,
// executing inline when the global queue is full.
func (l *Loop) drain(w *worker) {
	for {
		select {
		case t := <-w.local:
			select {
			case l.global <- t:
			default:
				l.exec(nil, t)
			}
		default:
			return
		}
	}
}

// runOne executes a single pending task if any is available. Used by
// Handle.Wait so blocked parents help instead of starving the pool.
func (l *Loop) runOne() bool {
	select {
	case t := <-l.global:
		l.exec(nil, t)
		return true
	default:
	}
	if t := l.steal(nil); t != nil {
		l.metrics.stolen.Add(1)
		l.exec(nil, t)
		return true
	}
	return false
}

func (l *Loop) exec(w *worker, t *task) {
	defer l.inflight.Done()
	l.busy.Add(1)
	defer l.busy.Add(-1)

	start := time.Now()
	l.metrics.queueWait.observe(start.Sub(t.enqueued))

	if err := t.ctx.Err(); err != nil {
		l.metrics.canceled.Add(1)
		t.handle.complete(err)
		return
	}
	tc := &TaskContext{Context: t.ctx, loop: l, w: w, depth: t.depth, corrID: t.corrID}
	var err error
	func() {
		defer func() {
			if r := recover(); r != nil {
				l.metrics.panics.Add(1)
				err = fmt.Errorf("pulseloop: task panic (corr=%s depth=%d): %v", t.corrID, t.depth, r)
			}
		}()
		err = t.fn(tc)
	}()
	l.metrics.latency.observe(time.Since(start))
	if err != nil {
		l.metrics.failed.Add(1)
	} else {
		l.metrics.completed.Add(1)
	}
	t.handle.complete(err)
}

// Shutdown stops accepting new tasks, waits for in-flight tasks to finish
// (bounded by ctx), then stops all workers. It returns ctx.Err() if the
// drain deadline was exceeded.
func (l *Loop) Shutdown(ctx context.Context) error {
	l.stopped.Store(true)
	drained := make(chan struct{})
	go func() { l.inflight.Wait(); close(drained) }()
	var err error
	select {
	case <-drained:
	case <-ctx.Done():
		err = ctx.Err()
	}
	l.mu.Lock()
	for _, w := range l.workers {
		close(w.quit)
	}
	l.workers = nil
	l.metrics.workers.Store(0)
	l.mu.Unlock()
	l.wg.Wait()
	return err
}
