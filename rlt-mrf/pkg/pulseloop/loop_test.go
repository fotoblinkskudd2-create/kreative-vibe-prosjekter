package pulseloop

import (
	"context"
	"errors"
	"sync/atomic"
	"testing"
	"time"
)

func newTestLoop(t *testing.T, cfg Config) *Loop {
	t.Helper()
	l := New(cfg)
	t.Cleanup(func() {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		_ = l.Shutdown(ctx)
	})
	return l
}

// countNodes recursively spawns two children per level down to maxLevel and
// counts every visited node — a synthetic recursive task graph.
func countNodes(counter *atomic.Int64, level, maxLevel int) TaskFunc {
	return func(tc *TaskContext) error {
		counter.Add(1)
		if level >= maxLevel {
			return nil
		}
		left, err := tc.Spawn(countNodes(counter, level+1, maxLevel))
		if err != nil {
			return err
		}
		if err := tc.SpawnWait(countNodes(counter, level+1, maxLevel)); err != nil {
			return err
		}
		return left.Wait(tc)
	}
}

// TestRecursiveLoadDepth6 is the Phase 2 milestone test: 100 concurrent
// root tasks, each a binary recursion tree of depth 6, all completing
// correctly within the depth budget.
func TestRecursiveLoadDepth6(t *testing.T) {
	l := newTestLoop(t, Config{MinWorkers: 4, MaxWorkers: 16, MaxDepth: 6})
	const roots, depth = 100, 6

	var counter atomic.Int64
	handles := make([]*Handle, 0, roots)
	for range roots {
		h, err := l.Submit(context.Background(), "", countNodes(&counter, 0, depth))
		if err != nil {
			t.Fatalf("Submit: %v", err)
		}
		handles = append(handles, h)
	}
	for _, h := range handles {
		if err := h.Wait(context.Background()); err != nil {
			t.Fatalf("task failed: %v", err)
		}
	}
	want := int64(roots * (1<<(depth+1) - 1)) // full binary tree node count
	if got := counter.Load(); got != want {
		t.Fatalf("visited %d nodes, want %d", got, want)
	}
	if deepest := l.Metrics().Snapshot().DeepestDepth; deepest != depth {
		t.Fatalf("deepest depth %d, want %d", deepest, depth)
	}
}

func TestDepthBudgetEnforced(t *testing.T) {
	l := newTestLoop(t, Config{MaxDepth: 3})

	var recurse func(tc *TaskContext) error
	recurse = func(tc *TaskContext) error {
		return tc.SpawnWait(recurse)
	}
	h, err := l.Submit(context.Background(), "depth-test", recurse)
	if err != nil {
		t.Fatalf("Submit: %v", err)
	}
	if err := h.Wait(context.Background()); !errors.Is(err, ErrDepthExceeded) {
		t.Fatalf("want ErrDepthExceeded, got %v", err)
	}
	if n := l.Metrics().Snapshot().DepthExceeded; n != 1 {
		t.Fatalf("depthExceeded counter = %d, want 1", n)
	}
}

func TestCancellationPropagates(t *testing.T) {
	l := newTestLoop(t, Config{MinWorkers: 2, MaxWorkers: 2})

	ctx, cancel := context.WithCancel(context.Background())
	started := make(chan struct{})
	h, err := l.Submit(ctx, "cancel-test", func(tc *TaskContext) error {
		close(started)
		// The child inherits the canceled token: it must not run.
		<-tc.Done()
		return tc.SpawnWait(func(*TaskContext) error {
			t.Error("child of canceled parent must not execute")
			return nil
		})
	})
	if err != nil {
		t.Fatalf("Submit: %v", err)
	}
	<-started
	cancel()
	if err := h.Wait(context.Background()); !errors.Is(err, context.Canceled) {
		t.Fatalf("want context.Canceled, got %v", err)
	}
	if n := l.Metrics().Snapshot().Canceled; n != 1 {
		t.Fatalf("canceled counter = %d, want 1", n)
	}
}

func TestDefaultTimeoutBoundsRootTasks(t *testing.T) {
	l := newTestLoop(t, Config{DefaultTimeout: 50 * time.Millisecond})

	h, err := l.Submit(context.Background(), "timeout-test", func(tc *TaskContext) error {
		<-tc.Done()
		return tc.Err()
	})
	if err != nil {
		t.Fatalf("Submit: %v", err)
	}
	if err := h.Wait(context.Background()); !errors.Is(err, context.DeadlineExceeded) {
		t.Fatalf("want DeadlineExceeded, got %v", err)
	}
}

func TestBackpressureRejects(t *testing.T) {
	l := newTestLoop(t, Config{MinWorkers: 1, MaxWorkers: 1, QueueSize: 2, LocalQueueSize: 1})

	release := make(chan struct{})
	blocker := func(tc *TaskContext) error {
		select {
		case <-release:
			return nil
		case <-tc.Done():
			return tc.Err()
		}
	}
	sawFull := false
	handles := []*Handle{}
	for range 32 {
		h, err := l.Submit(context.Background(), "", blocker)
		if errors.Is(err, ErrQueueFull) {
			sawFull = true
			break
		}
		if err != nil {
			t.Fatalf("Submit: %v", err)
		}
		handles = append(handles, h)
	}
	close(release)
	if !sawFull {
		t.Fatal("expected ErrQueueFull under flood")
	}
	if n := l.Metrics().Snapshot().Rejected; n == 0 {
		t.Fatal("rejected counter not incremented")
	}
	for _, h := range handles {
		_ = h.Wait(context.Background())
	}
}

func TestPanicIsIsolated(t *testing.T) {
	l := newTestLoop(t, Config{})

	h, err := l.Submit(context.Background(), "panic-test", func(*TaskContext) error {
		panic("boom")
	})
	if err != nil {
		t.Fatalf("Submit: %v", err)
	}
	if err := h.Wait(context.Background()); err == nil {
		t.Fatal("panicking task must surface an error")
	}
	// Loop must still work afterwards.
	h2, err := l.Submit(context.Background(), "", func(*TaskContext) error { return nil })
	if err != nil {
		t.Fatalf("Submit after panic: %v", err)
	}
	if err := h2.Wait(context.Background()); err != nil {
		t.Fatalf("task after panic: %v", err)
	}
	if n := l.Metrics().Snapshot().Panics; n != 1 {
		t.Fatalf("panics counter = %d, want 1", n)
	}
}

func TestWorkStealingMovesLocalTasks(t *testing.T) {
	l := newTestLoop(t, Config{MinWorkers: 4, MaxWorkers: 4, LocalQueueSize: 64, MaxDepth: 2})

	// One root fans out 40 slow children; they land on the root's worker
	// local queue, so idle siblings must steal to finish quickly.
	h, err := l.Submit(context.Background(), "steal-test", func(tc *TaskContext) error {
		children := make([]*Handle, 0, 40)
		for range 40 {
			c, err := tc.Spawn(func(*TaskContext) error {
				time.Sleep(2 * time.Millisecond)
				return nil
			})
			if err != nil {
				return err
			}
			children = append(children, c)
		}
		for _, c := range children {
			if err := c.Wait(tc); err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
		t.Fatalf("Submit: %v", err)
	}
	// Wait via Done, not Wait: helping from the test goroutine would
	// execute the root inline and bypass the worker-local queue.
	<-h.Done()
	if err := h.Err(); err != nil {
		t.Fatalf("root: %v", err)
	}
	if n := l.Metrics().Snapshot().Stolen; n == 0 {
		t.Fatal("expected at least one stolen task")
	}
}

func TestFeedbackControllerScalesUpAndDown(t *testing.T) {
	l := newTestLoop(t, Config{MinWorkers: 2, MaxWorkers: 16, QueueSize: 4096})
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	var adjustments atomic.Int64
	fc := NewFeedbackController(l, FeedbackConfig{
		Interval:  10 * time.Millisecond,
		IdleTicks: 3,
		OnAdjust:  func(int, int, string) { adjustments.Add(1) },
	})
	go fc.Run(ctx)

	// Load spike: saturate the pool with slow tasks.
	handles := []*Handle{}
	for range 200 {
		h, err := l.Submit(context.Background(), "", func(*TaskContext) error {
			time.Sleep(5 * time.Millisecond)
			return nil
		})
		if err != nil {
			t.Fatalf("Submit: %v", err)
		}
		handles = append(handles, h)
	}
	deadline := time.Now().Add(5 * time.Second)
	for l.Workers() <= 2 && time.Now().Before(deadline) {
		time.Sleep(5 * time.Millisecond)
	}
	if got := l.Workers(); got <= 2 {
		t.Fatalf("pool did not scale up under load (workers=%d)", got)
	}
	for _, h := range handles {
		_ = h.Wait(context.Background())
	}
	// Idle: pool must shrink back toward MinWorkers.
	peak := l.Workers()
	deadline = time.Now().Add(5 * time.Second)
	for l.Workers() >= peak && time.Now().Before(deadline) {
		time.Sleep(10 * time.Millisecond)
	}
	if got := l.Workers(); got >= peak {
		t.Fatalf("pool did not scale down when idle (workers=%d, peak=%d)", got, peak)
	}
	if adjustments.Load() == 0 {
		t.Fatal("OnAdjust never fired")
	}
}

func TestShutdownDrainsInflight(t *testing.T) {
	l := New(Config{MinWorkers: 2, MaxWorkers: 4})
	var done atomic.Int64
	for range 20 {
		_, err := l.Submit(context.Background(), "", func(*TaskContext) error {
			time.Sleep(5 * time.Millisecond)
			done.Add(1)
			return nil
		})
		if err != nil {
			t.Fatalf("Submit: %v", err)
		}
	}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := l.Shutdown(ctx); err != nil {
		t.Fatalf("Shutdown: %v", err)
	}
	if got := done.Load(); got != 20 {
		t.Fatalf("drained %d tasks, want 20", got)
	}
	if _, err := l.Submit(context.Background(), "", func(*TaskContext) error { return nil }); !errors.Is(err, ErrStopped) {
		t.Fatalf("want ErrStopped after shutdown, got %v", err)
	}
}

func TestCircuitBreaker(t *testing.T) {
	cb := &CircuitBreaker{Threshold: 3, Cooldown: 30 * time.Millisecond}
	failing := errors.New("downstream down")

	for range 3 {
		if err := cb.Do(func() error { return failing }); !errors.Is(err, failing) {
			t.Fatalf("want downstream error, got %v", err)
		}
	}
	if cb.State() != CircuitOpen {
		t.Fatalf("state = %v, want open", cb.State())
	}
	if err := cb.Do(func() error { t.Error("must not be called while open"); return nil }); !errors.Is(err, ErrCircuitOpen) {
		t.Fatalf("want ErrCircuitOpen, got %v", err)
	}
	time.Sleep(40 * time.Millisecond)
	if err := cb.Do(func() error { return nil }); err != nil {
		t.Fatalf("half-open probe: %v", err)
	}
	if cb.State() != CircuitClosed {
		t.Fatalf("state = %v, want closed after recovery", cb.State())
	}
}

// BenchmarkRecursiveTree measures sustained recursive ops/s (Phase 5
// target: >5k recursive ops/s). Each iteration is one full binary tree of
// depth 6 (127 tasks).
func BenchmarkRecursiveTree(b *testing.B) {
	l := New(Config{MinWorkers: 8, MaxWorkers: 8, QueueSize: 8192, MaxDepth: 6})
	defer func() {
		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()
		_ = l.Shutdown(ctx)
	}()
	var counter atomic.Int64
	b.ResetTimer()
	for range b.N {
		h, err := l.Submit(context.Background(), "", countNodes(&counter, 0, 6))
		if err != nil {
			b.Fatalf("Submit: %v", err)
		}
		if err := h.Wait(context.Background()); err != nil {
			b.Fatalf("tree: %v", err)
		}
	}
	b.ReportMetric(float64(counter.Load())/b.Elapsed().Seconds(), "tasks/s")
}
