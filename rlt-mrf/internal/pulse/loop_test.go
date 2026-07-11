package pulse

import (
	"context"
	"errors"
	"strings"
	"sync/atomic"
	"testing"
	"time"
)

func newTestLoop(t *testing.T, cfg Config) *Loop {
	t.Helper()
	l, err := New(cfg)
	if err != nil {
		t.Fatalf("New: %v", err)
	}
	l.Start()
	t.Cleanup(func() {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		_ = l.Shutdown(ctx)
	})
	return l
}

// TestDepthBudgetEnforced verifies that recursion stops exactly at MaxDepth
// with ErrDepthExceeded and that the denial is counted.
func TestDepthBudgetEnforced(t *testing.T) {
	l := newTestLoop(t, Config{MaxDepth: 3})

	var maxSeen atomic.Int64
	var spawnErr atomic.Value

	var descend TaskFunc
	descend = func(tc *TaskCtx) error {
		if d := int64(tc.Depth()); d > maxSeen.Load() {
			maxSeen.Store(d)
		}
		_, err := tc.Spawn("descend", descend)
		if err != nil {
			spawnErr.Store(err)
		}
		return nil
	}

	h, err := l.Submit("root", descend)
	if err != nil {
		t.Fatalf("Submit: %v", err)
	}
	if err := h.Wait(); err != nil {
		t.Fatalf("Wait: %v", err)
	}
	if got := maxSeen.Load(); got != 3 {
		t.Errorf("deepest task ran at depth %d, want 3", got)
	}
	if err, _ := spawnErr.Load().(error); !errors.Is(err, ErrDepthExceeded) {
		t.Errorf("spawn beyond budget returned %v, want ErrDepthExceeded", err)
	}
	if n := l.Metrics().DepthExceeded.Load(); n == 0 {
		t.Error("DepthExceeded metric not incremented")
	}
}

// TestCancellationPropagates verifies that cancelling a root handle cancels
// running and queued descendants and that Wait still returns.
func TestCancellationPropagates(t *testing.T) {
	l := newTestLoop(t, Config{MinWorkers: 2, MaxWorkers: 4, MaxDepth: 4})

	childStarted := make(chan struct{})
	h, err := l.Submit("root", func(tc *TaskCtx) error {
		_, err := tc.Spawn("blocker", func(c *TaskCtx) error {
			close(childStarted)
			<-c.Context().Done()
			return c.Context().Err()
		})
		return err
	})
	if err != nil {
		t.Fatalf("Submit: %v", err)
	}

	<-childStarted
	h.Cancel()

	done := make(chan error, 1)
	go func() { done <- h.Wait() }()
	select {
	case err := <-done:
		if !errors.Is(err, context.Canceled) {
			t.Errorf("Wait returned %v, want context.Canceled", err)
		}
	case <-time.After(5 * time.Second):
		t.Fatal("subtree did not resolve after Cancel")
	}
}

// TestDeadlineEnforced verifies the root deadline is inherited by children.
func TestDeadlineEnforced(t *testing.T) {
	l := newTestLoop(t, Config{DefaultTimeout: 50 * time.Millisecond, MaxDepth: 4})

	h, err := l.Submit("slow", func(tc *TaskCtx) error {
		_, err := tc.Spawn("slow-child", func(c *TaskCtx) error {
			<-c.Context().Done()
			return c.Context().Err()
		})
		return err
	})
	if err != nil {
		t.Fatalf("Submit: %v", err)
	}
	if err := h.Wait(); !errors.Is(err, context.DeadlineExceeded) {
		t.Errorf("Wait returned %v, want context.DeadlineExceeded", err)
	}
}

// TestLoadHundredConcurrentDepthSix is the Phase 2 milestone from the
// implementation plan: 100 concurrent root tasks, each a recursive fan-out of
// width 2 to depth 6, all completing without error.
func TestLoadHundredConcurrentDepthSix(t *testing.T) {
	l := newTestLoop(t, Config{MaxDepth: 6, QueueSize: 256, DefaultTimeout: time.Minute})

	var executed atomic.Int64
	var fanout TaskFunc
	fanout = func(tc *TaskCtx) error {
		executed.Add(1)
		if tc.Depth() >= 6 {
			return nil
		}
		for i := 0; i < 2; i++ {
			if _, err := tc.Spawn("fan", fanout); err != nil {
				return err
			}
		}
		return nil
	}

	handles := make([]*Handle, 0, 100)
	for i := 0; i < 100; i++ {
		h, err := l.Submit("load", fanout)
		if err != nil {
			t.Fatalf("Submit %d: %v", i, err)
		}
		handles = append(handles, h)
	}
	for i, h := range handles {
		if err := h.Wait(); err != nil {
			t.Fatalf("task %d failed: %v", i, err)
		}
	}

	// Each root task is a complete binary tree of depth 6: 2^7-1 = 127 nodes.
	if got, want := executed.Load(), int64(100*127); got != want {
		t.Errorf("executed %d tasks, want %d", got, want)
	}
}

// TestWorkStealing verifies that recursive children spawned onto one worker's
// local deque get executed by sibling workers.
func TestWorkStealing(t *testing.T) {
	l := newTestLoop(t, Config{MinWorkers: 4, MaxWorkers: 4, MaxDepth: 2})

	h, err := l.Submit("spawner", func(tc *TaskCtx) error {
		for i := 0; i < 32; i++ {
			if _, err := tc.Spawn("sleepy", func(c *TaskCtx) error {
				time.Sleep(5 * time.Millisecond)
				return nil
			}); err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
		t.Fatalf("Submit: %v", err)
	}
	if err := h.Wait(); err != nil {
		t.Fatalf("Wait: %v", err)
	}
	if n := l.Metrics().Stolen.Load(); n == 0 {
		t.Error("expected work stealing under skewed load, Stolen metric is 0")
	}
}

// TestFeedbackResize verifies the closed feedback loop: the pool grows under
// backlog and shrinks back toward MinWorkers when idle.
func TestFeedbackResize(t *testing.T) {
	l := newTestLoop(t, Config{
		MinWorkers:     1,
		MaxWorkers:     8,
		TuneInterval:   10 * time.Millisecond,
		DefaultTimeout: time.Minute,
	})

	release := make(chan struct{})
	for i := 0; i < 24; i++ {
		if _, err := l.Submit("hold", func(tc *TaskCtx) error {
			select {
			case <-release:
			case <-tc.Context().Done():
			}
			return nil
		}); err != nil {
			t.Fatalf("Submit: %v", err)
		}
	}

	grewTo := waitFor(t, 3*time.Second, func() (int64, bool) {
		w := l.Stats().Workers
		return w, w >= 4
	})
	t.Logf("pool grew to %d workers under load", grewTo)

	close(release)

	shrankTo := waitFor(t, 5*time.Second, func() (int64, bool) {
		w := l.Stats().Workers
		return w, w <= 2
	})
	t.Logf("pool shrank to %d workers when idle", shrankTo)

	m := l.Metrics()
	if m.ScaleUps.Load() == 0 || m.ScaleDowns.Load() == 0 {
		t.Errorf("expected both scale-ups (%d) and scale-downs (%d)",
			m.ScaleUps.Load(), m.ScaleDowns.Load())
	}
}

func waitFor(t *testing.T, timeout time.Duration, probe func() (int64, bool)) int64 {
	t.Helper()
	deadline := time.Now().Add(timeout)
	var last int64
	for time.Now().Before(deadline) {
		var ok bool
		if last, ok = probe(); ok {
			return last
		}
		time.Sleep(5 * time.Millisecond)
	}
	t.Fatalf("condition not reached within %v (last value %d)", timeout, last)
	return last
}

// TestBackpressure verifies Submit rejects with ErrQueueFull when the intake
// queue is saturated.
func TestBackpressure(t *testing.T) {
	l := newTestLoop(t, Config{MinWorkers: 1, MaxWorkers: 1, QueueSize: 1, TuneInterval: time.Hour})

	running := make(chan struct{})
	release := make(chan struct{})
	defer close(release)

	if _, err := l.Submit("blocker", func(tc *TaskCtx) error {
		close(running)
		<-release
		return nil
	}); err != nil {
		t.Fatalf("Submit blocker: %v", err)
	}
	<-running

	// The single worker is occupied; QueueSize=1 admits exactly one more.
	sawFull := false
	for i := 0; i < 3; i++ {
		if _, err := l.Submit("filler", func(tc *TaskCtx) error { return nil }); errors.Is(err, ErrQueueFull) {
			sawFull = true
			break
		}
	}
	if !sawFull {
		t.Error("expected ErrQueueFull once queue capacity was exceeded")
	}
	if l.Metrics().Rejected.Load() == 0 {
		t.Error("Rejected metric not incremented")
	}
}

// TestPanicIsolation verifies a panicking task fails its own handle without
// harming the pool.
func TestPanicIsolation(t *testing.T) {
	l := newTestLoop(t, Config{})

	h, err := l.Submit("bomb", func(tc *TaskCtx) error { panic("boom") })
	if err != nil {
		t.Fatalf("Submit: %v", err)
	}
	werr := h.Wait()
	if !errors.Is(werr, ErrPanic) || !strings.Contains(werr.Error(), "boom") {
		t.Errorf("Wait returned %v, want ErrPanic wrapping the panic value", werr)
	}
	if l.Metrics().Panics.Load() != 1 {
		t.Errorf("Panics metric = %d, want 1", l.Metrics().Panics.Load())
	}

	h2, err := l.Submit("healthy", func(tc *TaskCtx) error { return nil })
	if err != nil {
		t.Fatalf("Submit after panic: %v", err)
	}
	if err := h2.Wait(); err != nil {
		t.Errorf("pool unhealthy after panic: %v", err)
	}
}

// TestStructuredConcurrency verifies a parent handle does not resolve before
// children the parent never explicitly awaited, and that child errors join
// into the parent result.
func TestStructuredConcurrency(t *testing.T) {
	l := newTestLoop(t, Config{})

	var childDone atomic.Bool
	sentinel := errors.New("child failed")

	h, err := l.Submit("parent", func(tc *TaskCtx) error {
		_, err := tc.Spawn("straggler", func(c *TaskCtx) error {
			time.Sleep(30 * time.Millisecond)
			childDone.Store(true)
			return sentinel
		})
		return err // parent returns immediately, without awaiting the child
	})
	if err != nil {
		t.Fatalf("Submit: %v", err)
	}
	werr := h.Wait()
	if !childDone.Load() {
		t.Error("parent handle resolved before its child completed")
	}
	if !errors.Is(werr, sentinel) {
		t.Errorf("Wait returned %v, want joined child error", werr)
	}
}

// TestAwaitInsideTask verifies TaskCtx.Await returns the child's result and
// does not deadlock a fully-loaded pool of waiting parents.
func TestAwaitInsideTask(t *testing.T) {
	l := newTestLoop(t, Config{MinWorkers: 1, MaxWorkers: 1, MaxDepth: 4, TuneInterval: time.Hour})

	h, err := l.Submit("parent", func(tc *TaskCtx) error {
		ch, err := tc.Spawn("child", func(c *TaskCtx) error { return nil })
		if err != nil {
			return err
		}
		// With a single worker, this only completes if Await helps execute
		// the queued child instead of blocking the worker.
		return tc.Await(ch)
	})
	if err != nil {
		t.Fatalf("Submit: %v", err)
	}
	select {
	case <-h.Done():
		if err := h.Err(); err != nil {
			t.Errorf("Await task failed: %v", err)
		}
	case <-time.After(5 * time.Second):
		t.Fatal("Await deadlocked on a single-worker pool")
	}
}

// TestShutdown verifies graceful drain, forced cancellation on deadline, and
// post-shutdown rejection.
func TestShutdown(t *testing.T) {
	l, err := New(Config{MinWorkers: 2, DefaultTimeout: time.Minute})
	if err != nil {
		t.Fatalf("New: %v", err)
	}
	l.Start()

	started := make(chan struct{})
	h, err := l.Submit("stuck", func(tc *TaskCtx) error {
		close(started)
		<-tc.Context().Done() // only ends when shutdown forces cancellation
		return tc.Context().Err()
	})
	if err != nil {
		t.Fatalf("Submit: %v", err)
	}
	<-started

	ctx, cancel := context.WithTimeout(context.Background(), 50*time.Millisecond)
	defer cancel()
	if err := l.Shutdown(ctx); !errors.Is(err, context.DeadlineExceeded) {
		t.Errorf("Shutdown returned %v, want DeadlineExceeded from forced path", err)
	}
	if err := h.Wait(); !errors.Is(err, context.Canceled) {
		t.Errorf("stuck task resolved with %v, want context.Canceled", err)
	}
	if _, err := l.Submit("late", func(tc *TaskCtx) error { return nil }); !errors.Is(err, ErrClosed) {
		t.Errorf("Submit after shutdown returned %v, want ErrClosed", err)
	}
}

// TestCorrelationIDInheritance verifies the whole subtree shares the root's
// correlation ID.
func TestCorrelationIDInheritance(t *testing.T) {
	l := newTestLoop(t, Config{MaxDepth: 3})

	ids := make(chan string, 4)
	h, err := l.Submit("root", func(tc *TaskCtx) error {
		ids <- tc.CorrelationID()
		_, err := tc.Spawn("child", func(c *TaskCtx) error {
			ids <- c.CorrelationID()
			return nil
		})
		return err
	})
	if err != nil {
		t.Fatalf("Submit: %v", err)
	}
	if err := h.Wait(); err != nil {
		t.Fatalf("Wait: %v", err)
	}
	close(ids)
	root := h.CorrelationID()
	if root == "" {
		t.Fatal("empty correlation ID")
	}
	for id := range ids {
		if id != root {
			t.Errorf("task saw correlation ID %q, want %q", id, root)
		}
	}
}
