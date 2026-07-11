// Package pulse implements the PulseLoop concurrency core of the
// Recursive Loop-Threaded Multi-Layered Resilience Fabric (RLT-MRF).
//
// The core primitives are:
//
//   - Loop: the event loop that accepts task submissions, dispatches them to
//     a work-stealing worker pool, and closes the feedback loop by resizing
//     the pool from live execution metrics.
//   - Task functions: units of work that may recursively spawn bounded child
//     tasks. Every task carries a depth budget, a deadline inherited from its
//     parent, a cancellation context, and a correlation ID for tracing.
//   - Structured concurrency: a task is not complete until all tasks it
//     spawned are complete. Errors from children are joined into the parent's
//     result, and cancelling a parent cancels its whole subtree.
package pulse

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"sync"
	"sync/atomic"
)

// Sentinel errors returned by the loop and task API.
var (
	// ErrDepthExceeded is returned by Spawn when the child would exceed the
	// loop's configured MaxDepth. Callers should degrade gracefully, e.g. by
	// computing the remaining work inline instead of recursing.
	ErrDepthExceeded = errors.New("pulse: recursion depth budget exceeded")
	// ErrQueueFull is returned by Submit when the global submission queue is
	// at capacity. This is deliberate backpressure: callers should retry with
	// backoff or shed load.
	ErrQueueFull = errors.New("pulse: submission queue full")
	// ErrClosed is returned by Submit after Shutdown has been called.
	ErrClosed = errors.New("pulse: loop is shut down")
	// ErrPanic wraps a recovered panic from a task function.
	ErrPanic = errors.New("pulse: task panicked")
)

// TaskFunc is the unit of work executed by the pool. Implementations must
// honour tc.Context() cancellation to keep shutdown and deadlines effective.
type TaskFunc func(tc *TaskCtx) error

// task is the internal representation of a scheduled unit of work.
type task struct {
	name   string
	fn     TaskFunc
	ctx    context.Context
	cancel context.CancelFunc
	depth  int
	corrID string
	loop   *Loop
	parent *task

	// Structured-concurrency bookkeeping: number of outstanding children and
	// a best-effort notification channel pulsed each time one completes.
	pending     atomic.Int64
	childNotify chan struct{}
	childMu     sync.Mutex
	childErrs   []error

	completed atomic.Bool
	done      chan struct{}
	err       error
}

func newTask(loop *Loop, parent *task, name string, depth int, corrID string, ctx context.Context, cancel context.CancelFunc, fn TaskFunc) *task {
	return &task{
		name:        name,
		fn:          fn,
		ctx:         ctx,
		cancel:      cancel,
		depth:       depth,
		corrID:      corrID,
		loop:        loop,
		parent:      parent,
		childNotify: make(chan struct{}, 1),
		done:        make(chan struct{}),
	}
}

// complete resolves the task exactly once: records the error, releases the
// context, notifies the parent (structured concurrency), and updates metrics.
func (t *task) complete(err error) {
	if !t.completed.CompareAndSwap(false, true) {
		return
	}
	t.err = err
	t.cancel()
	close(t.done)

	m := t.loop.metrics
	m.Completed.Add(1)
	if err != nil {
		m.Failed.Add(1)
		if errors.Is(err, context.Canceled) {
			m.Cancelled.Add(1)
		}
	}

	if p := t.parent; p != nil {
		if err != nil {
			p.childMu.Lock()
			p.childErrs = append(p.childErrs, err)
			p.childMu.Unlock()
		}
		p.pending.Add(-1)
		select {
		case p.childNotify <- struct{}{}:
		default:
		}
	}
}

// joinChildErrs returns the accumulated child errors joined into one error.
// Only safe to call once pending has reached zero.
func (t *task) joinChildErrs() error {
	t.childMu.Lock()
	defer t.childMu.Unlock()
	return errors.Join(t.childErrs...)
}

// Handle is the caller-facing view of a submitted or spawned task.
type Handle struct {
	t *task
}

// Done returns a channel closed when the task (and its whole subtree) has
// completed.
func (h *Handle) Done() <-chan struct{} { return h.t.done }

// Wait blocks until the task subtree completes and returns its joined error.
// From inside another task, prefer TaskCtx.Await, which lets the calling
// worker execute queued work while it waits instead of idling.
func (h *Handle) Wait() error {
	<-h.t.done
	return h.t.err
}

// Err returns the task's error, or nil. Only meaningful after Done is closed.
func (h *Handle) Err() error {
	select {
	case <-h.t.done:
		return h.t.err
	default:
		return nil
	}
}

// Cancel cancels the task's context, which propagates to its entire subtree.
// The task still completes normally (with a context error) so Wait always
// returns.
func (h *Handle) Cancel() { h.t.cancel() }

// CorrelationID returns the ID shared by the task and all its descendants.
func (h *Handle) CorrelationID() string { return h.t.corrID }

// TaskCtx is passed to every TaskFunc and is the only way to spawn recursive
// child work, keeping all recursion bounded and instrumented.
type TaskCtx struct {
	t *task
	w *worker
}

// Context returns the task's cancellation context. Task functions must
// respect it.
func (tc *TaskCtx) Context() context.Context { return tc.t.ctx }

// Depth returns the task's recursion depth (0 for root submissions).
func (tc *TaskCtx) Depth() int { return tc.t.depth }

// CorrelationID returns the trace ID inherited from the root submission.
func (tc *TaskCtx) CorrelationID() string { return tc.t.corrID }

// Name returns the task's name as given at Submit/Spawn time.
func (tc *TaskCtx) Name() string { return tc.t.name }

// Spawn schedules fn as a child task. The child inherits the parent's
// correlation ID, deadline, and cancellation, and consumes one unit of the
// depth budget. It returns ErrDepthExceeded when the budget is exhausted and
// the parent's context error if the subtree is already cancelled.
//
// The parent task does not complete until every spawned child completes, and
// child errors are joined into the parent's result (structured concurrency).
func (tc *TaskCtx) Spawn(name string, fn TaskFunc) (*Handle, error) {
	parent := tc.t
	loop := parent.loop
	if parent.depth+1 > loop.cfg.MaxDepth {
		loop.metrics.DepthExceeded.Add(1)
		return nil, ErrDepthExceeded
	}
	if err := parent.ctx.Err(); err != nil {
		return nil, err
	}

	ctx, cancel := context.WithCancel(parent.ctx)
	child := newTask(loop, parent, name, parent.depth+1, parent.corrID, ctx, cancel, fn)
	parent.pending.Add(1)

	// Spawned work goes to the current worker's local deque (LIFO for cache
	// locality); idle workers pick it up by stealing.
	if tc.w != nil {
		tc.w.local.pushBack(child)
		loop.pool.wakeOne()
	} else if err := loop.pool.enqueueGlobal(child); err != nil {
		parent.pending.Add(-1)
		cancel()
		loop.metrics.Rejected.Add(1)
		return nil, err
	}
	loop.metrics.Spawned.Add(1)
	return &Handle{t: child}, nil
}

// Await blocks until h completes, but keeps the calling worker productive by
// executing queued tasks while it waits. This is what makes parent-waits-for-
// child recursion deadlock-free even when every worker is a waiting parent.
func (tc *TaskCtx) Await(h *Handle) error {
	if tc.w == nil {
		return h.Wait()
	}
	tc.w.helpUntil(h.t.done)
	return h.t.err
}

// newCorrelationID returns a 16-hex-char random ID for tracing task trees.
func newCorrelationID() string {
	var b [8]byte
	if _, err := rand.Read(b[:]); err != nil {
		return "0000000000000000"
	}
	return hex.EncodeToString(b[:])
}
