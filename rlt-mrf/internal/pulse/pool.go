package pulse

import (
	"errors"
	"math/rand/v2"
	"sync"
	"sync/atomic"
	"time"
)

// idlePollInterval is the safety-net wakeup for parked workers so a lost
// best-effort wake notification can never strand queued work.
const idlePollInterval = 25 * time.Millisecond

// deque is a mutex-guarded double-ended task queue. The owning worker pushes
// and pops at the back (LIFO, cache-friendly for recursive spawns); thieves
// steal from the front (FIFO, oldest work first).
type deque struct {
	mu    sync.Mutex
	items []*task
}

func (d *deque) pushBack(t *task) {
	d.mu.Lock()
	d.items = append(d.items, t)
	d.mu.Unlock()
}

func (d *deque) popBack() *task {
	d.mu.Lock()
	defer d.mu.Unlock()
	n := len(d.items)
	if n == 0 {
		return nil
	}
	t := d.items[n-1]
	d.items[n-1] = nil
	d.items = d.items[:n-1]
	return t
}

func (d *deque) stealFront() *task {
	d.mu.Lock()
	defer d.mu.Unlock()
	if len(d.items) == 0 {
		return nil
	}
	t := d.items[0]
	d.items[0] = nil
	d.items = d.items[1:]
	return t
}

func (d *deque) len() int {
	d.mu.Lock()
	defer d.mu.Unlock()
	return len(d.items)
}

// pool is the elastic work-stealing worker pool driven by the PulseLoop.
type pool struct {
	loop *Loop

	global chan *task    // bounded submission queue (backpressure boundary)
	wake   chan struct{} // best-effort doorbell for parked workers
	stop   chan struct{} // closed on shutdown

	mu      sync.Mutex
	workers map[int]*worker
	nextID  int

	current  atomic.Int64 // live worker count
	target   atomic.Int64 // desired worker count, set by the tuner
	inflight atomic.Int64 // tasks currently executing

	wg sync.WaitGroup
}

func newPool(loop *Loop) *pool {
	p := &pool{
		loop:    loop,
		global:  make(chan *task, loop.cfg.QueueSize),
		wake:    make(chan struct{}, loop.cfg.MaxWorkers),
		stop:    make(chan struct{}),
		workers: make(map[int]*worker),
	}
	p.target.Store(int64(loop.cfg.MinWorkers))
	return p
}

func (p *pool) enqueueGlobal(t *task) error {
	select {
	case p.global <- t:
		p.wakeOne()
		return nil
	default:
		return ErrQueueFull
	}
}

// wakeOne rings the doorbell for at most one parked worker. Non-blocking:
// if every worker is busy or the buffer is full, the token is dropped and the
// idle poll interval acts as the safety net.
func (p *pool) wakeOne() {
	select {
	case p.wake <- struct{}{}:
	default:
	}
}

// ensureWorkers grows the pool up to n workers (capped at MaxWorkers).
func (p *pool) ensureWorkers(n int64) {
	maxW := int64(p.loop.cfg.MaxWorkers)
	for {
		cur := p.current.Load()
		if cur >= n || cur >= maxW {
			return
		}
		if p.current.CompareAndSwap(cur, cur+1) {
			p.startWorker()
		}
	}
}

func (p *pool) startWorker() {
	p.mu.Lock()
	id := p.nextID
	p.nextID++
	w := &worker{id: id, pool: p, local: &deque{}}
	p.workers[id] = w
	p.mu.Unlock()

	p.wg.Add(1)
	go w.run()
}

func (p *pool) removeWorker(id int) {
	p.mu.Lock()
	delete(p.workers, id)
	p.mu.Unlock()
}

// victims returns a snapshot of workers to steal from.
func (p *pool) victims() []*worker {
	p.mu.Lock()
	defer p.mu.Unlock()
	vs := make([]*worker, 0, len(p.workers))
	for _, w := range p.workers {
		vs = append(vs, w)
	}
	return vs
}

// queueDepth is the total number of queued-but-not-running tasks.
func (p *pool) queueDepth() int64 {
	n := int64(len(p.global))
	for _, w := range p.victims() {
		n += int64(w.local.len())
	}
	return n
}

// drained reports whether no work is queued or executing.
func (p *pool) drained() bool {
	return p.inflight.Load() == 0 && p.queueDepth() == 0
}

// worker executes tasks from its local deque, the global queue, or by
// stealing from siblings, in that order.
type worker struct {
	id    int
	pool  *pool
	local *deque
}

func (w *worker) run() {
	defer w.pool.wg.Done()
	for {
		// Elastic scale-down: retire when over target and out of local work.
		cur := w.pool.current.Load()
		if cur > w.pool.target.Load() && w.local.len() == 0 {
			if w.pool.current.CompareAndSwap(cur, cur-1) {
				w.pool.removeWorker(w.id)
				return
			}
			continue
		}

		if t := w.next(); t != nil {
			w.exec(t)
			continue
		}

		select {
		case t := <-w.pool.global:
			w.exec(t)
		case <-w.pool.wake:
			// Propagate the doorbell so bursts wake more than one worker.
			if w.local.len() > 0 || len(w.pool.global) > 0 {
				w.pool.wakeOne()
			}
		case <-w.pool.stop:
			return
		case <-time.After(idlePollInterval):
		}
	}
}

// next returns the next runnable task without blocking: local LIFO first,
// then the global queue, then stealing.
func (w *worker) next() *task {
	if t := w.local.popBack(); t != nil {
		return t
	}
	select {
	case t := <-w.pool.global:
		return t
	default:
	}
	return w.steal()
}

func (w *worker) steal() *task {
	victims := w.pool.victims()
	if len(victims) == 0 {
		return nil
	}
	off := rand.IntN(len(victims))
	for i := range victims {
		v := victims[(i+off)%len(victims)]
		if v.id == w.id {
			continue
		}
		if t := v.local.stealFront(); t != nil {
			w.pool.loop.metrics.Stolen.Add(1)
			return t
		}
	}
	return nil
}

// exec runs a task to full subtree completion: the function itself, then any
// children it spawned (helping with other queued work while it waits).
func (w *worker) exec(t *task) {
	// Fast-path for tasks whose subtree was cancelled while queued.
	if err := t.ctx.Err(); err != nil {
		t.complete(err)
		return
	}

	m := w.pool.loop.metrics
	w.pool.inflight.Add(1)
	start := time.Now()

	err := w.runSafe(t)
	w.waitChildren(t)
	err = errors.Join(err, t.joinChildErrs())

	w.pool.inflight.Add(-1)
	m.observeLatency(time.Since(start))
	t.complete(err)
}

// runSafe invokes the task function with panic isolation so one bad task
// cannot take down a worker.
func (w *worker) runSafe(t *task) (err error) {
	defer func() {
		if r := recover(); r != nil {
			w.pool.loop.metrics.Panics.Add(1)
			err = errors.Join(ErrPanic, &panicError{task: t.name, value: r})
		}
	}()
	return t.fn(&TaskCtx{t: t, w: w})
}

// waitChildren blocks until every child of t has completed, executing other
// queued tasks in the meantime. This "help-first" strategy is what allows a
// bounded pool to run deep parent-waits-for-child recursion without deadlock.
func (w *worker) waitChildren(t *task) {
	for t.pending.Load() > 0 {
		if nt := w.next(); nt != nil {
			w.exec(nt)
			continue
		}
		select {
		case <-t.childNotify:
		case <-time.After(time.Millisecond):
		}
	}
}

// helpUntil executes queued tasks until done is closed.
func (w *worker) helpUntil(done <-chan struct{}) {
	for {
		select {
		case <-done:
			return
		default:
		}
		if nt := w.next(); nt != nil {
			w.exec(nt)
			continue
		}
		select {
		case <-done:
			return
		case <-time.After(200 * time.Microsecond):
		}
	}
}

type panicError struct {
	task  string
	value any
}

func (e *panicError) Error() string {
	return "task " + e.task + " panicked: " + formatPanic(e.value)
}

func formatPanic(v any) string {
	switch x := v.(type) {
	case error:
		return x.Error()
	case string:
		return x
	default:
		return "unexpected panic value"
	}
}
