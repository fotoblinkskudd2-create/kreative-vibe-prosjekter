// Package pulseloop implements the Concurrency & Threading Layer of the
// Recursive Loop-Threaded Multi-Layered Resilience Fabric (RLT-MRF).
//
// The PulseLoop is a high-priority event loop that manages task submission
// queues, worker dispatch, result collection and metric emission. All
// recursion is bounded: every task carries an explicit depth budget, a
// deadline and a cancellation token, and structured concurrency guarantees
// that no child task outlives the loop unobserved.
package pulseloop

import (
	"context"
	"errors"
	"fmt"
	"sync/atomic"
	"time"
)

// Sentinel errors returned by Submit and Spawn. Callers use these to apply
// backpressure (ErrQueueFull), stop recursion (ErrDepthExceeded) or abort
// cleanly on shutdown (ErrStopped).
var (
	ErrQueueFull     = errors.New("pulseloop: submission queue full (backpressure)")
	ErrDepthExceeded = errors.New("pulseloop: recursion depth budget exceeded")
	ErrStopped       = errors.New("pulseloop: loop stopped")
)

// TaskFunc is the unit of work executed by the PulseLoop. Implementations
// must honour tc.Done() for cooperative cancellation and use tc.Spawn to
// create bounded recursive children.
type TaskFunc func(tc *TaskContext) error

type task struct {
	fn       TaskFunc
	depth    int
	corrID   string
	ctx      context.Context
	handle   *Handle
	enqueued time.Time
}

// Handle tracks a submitted task through completion. It is the structured
// concurrency anchor: whoever spawns a task owns its Handle and is expected
// to Wait on it (or cancel the shared context).
type Handle struct {
	loop *Loop
	done chan struct{}
	err  atomic.Pointer[error]
}

func newHandle(l *Loop) *Handle {
	return &Handle{loop: l, done: make(chan struct{})}
}

func (h *Handle) complete(err error) {
	if err != nil {
		h.err.Store(&err)
	}
	close(h.done)
}

// Done returns a channel closed when the task has finished.
func (h *Handle) Done() <-chan struct{} { return h.done }

// Err returns the task's error after Done is closed, and nil before.
func (h *Handle) Err() error {
	if p := h.err.Load(); p != nil {
		return *p
	}
	return nil
}

// Wait blocks until the task completes or ctx is cancelled. While waiting
// from inside a worker it "helps": it executes other pending tasks instead
// of idling, which keeps deep parent-child recursion deadlock-free even
// when every worker is a blocked parent.
func (h *Handle) Wait(ctx context.Context) error {
	for {
		select {
		case <-h.done:
			return h.Err()
		case <-ctx.Done():
			return ctx.Err()
		default:
		}
		// Help-first scheduling: run someone else's task while we wait.
		if !h.loop.runOne() {
			select {
			case <-h.done:
				return h.Err()
			case <-ctx.Done():
				return ctx.Err()
			case <-time.After(200 * time.Microsecond):
			}
		}
	}
}

// TaskContext is passed to every TaskFunc. It embeds a context.Context
// carrying the task's deadline and cancellation token, and exposes the
// depth budget and correlation ID used for tracing recursive call graphs.
type TaskContext struct {
	context.Context
	loop   *Loop
	w      *worker // worker executing this task; nil when run by a helper
	depth  int
	corrID string
}

// Depth returns the recursion depth of this task (0 for root submissions).
func (tc *TaskContext) Depth() int { return tc.depth }

// CorrelationID returns the ID shared by an entire recursive call graph.
func (tc *TaskContext) CorrelationID() string { return tc.corrID }

// Spawn submits a child task one level deeper in the recursion. It fails
// with ErrDepthExceeded when the loop's depth budget is exhausted. Under
// backpressure Spawn does not fail: it helps drain pending tasks until
// queue space frees or the task's context is canceled. The child inherits
// this task's cancellation token and correlation ID.
func (tc *TaskContext) Spawn(fn TaskFunc) (*Handle, error) {
	if tc.depth+1 > tc.loop.cfg.MaxDepth {
		tc.loop.metrics.depthExceeded.Add(1)
		return nil, fmt.Errorf("%w (depth %d, budget %d)", ErrDepthExceeded, tc.depth+1, tc.loop.cfg.MaxDepth)
	}
	return tc.loop.submit(tc.Context, tc.w, fn, tc.depth+1, tc.corrID)
}

// SpawnWait spawns a child task and blocks (helping the pool) until it
// completes, propagating the child's error.
func (tc *TaskContext) SpawnWait(fn TaskFunc) error {
	h, err := tc.Spawn(fn)
	if err != nil {
		return err
	}
	return h.Wait(tc.Context)
}
