package pulseloop

import (
	"fmt"
	"io"
	"sync/atomic"
	"time"
)

// histogram is a fixed-bucket latency histogram, safe for concurrent use.
// Buckets are cumulative (Prometheus convention).
type histogram struct {
	bounds []time.Duration
	counts []atomic.Int64
	sum    atomic.Int64 // nanoseconds
	count  atomic.Int64
}

func newHistogram(bounds ...time.Duration) *histogram {
	return &histogram{bounds: bounds, counts: make([]atomic.Int64, len(bounds))}
}

func (h *histogram) observe(d time.Duration) {
	h.sum.Add(int64(d))
	h.count.Add(1)
	for i, b := range h.bounds {
		if d <= b {
			h.counts[i].Add(1)
		}
	}
}

func (h *histogram) write(w io.Writer, name string) {
	fmt.Fprintf(w, "# TYPE %s histogram\n", name)
	for i, b := range h.bounds {
		fmt.Fprintf(w, "%s_bucket{le=\"%g\"} %d\n", name, b.Seconds(), h.counts[i].Load())
	}
	fmt.Fprintf(w, "%s_bucket{le=\"+Inf\"} %d\n", name, h.count.Load())
	fmt.Fprintf(w, "%s_sum %g\n", name, time.Duration(h.sum.Load()).Seconds())
	fmt.Fprintf(w, "%s_count %d\n", name, h.count.Load())
}

// Metrics holds the PulseLoop's live counters. The feedback controller
// reads them every tick and the /metrics endpoint exposes them in
// Prometheus text format, so the same numbers drive adaptation and
// dashboards — one source of truth for the closed loop.
type Metrics struct {
	submitted     atomic.Int64
	completed     atomic.Int64
	failed        atomic.Int64
	canceled      atomic.Int64
	rejected      atomic.Int64
	depthExceeded atomic.Int64
	panics        atomic.Int64
	stolen        atomic.Int64
	workers       atomic.Int64
	deepest       atomic.Int64
	latency       *histogram
	queueWait     *histogram
}

func newMetrics() *Metrics {
	bounds := []time.Duration{
		100 * time.Microsecond, time.Millisecond, 5 * time.Millisecond,
		25 * time.Millisecond, 100 * time.Millisecond, 500 * time.Millisecond,
		2 * time.Second, 10 * time.Second,
	}
	return &Metrics{latency: newHistogram(bounds...), queueWait: newHistogram(bounds...)}
}

func (m *Metrics) maxDepthSeen(d int) {
	for {
		cur := m.deepest.Load()
		if int64(d) <= cur || m.deepest.CompareAndSwap(cur, int64(d)) {
			return
		}
	}
}

// Snapshot returns a point-in-time copy of the counters.
type Snapshot struct {
	Submitted, Completed, Failed, Canceled int64
	Rejected, DepthExceeded, Panics        int64
	Stolen, Workers, DeepestDepth          int64
}

func (m *Metrics) Snapshot() Snapshot {
	return Snapshot{
		Submitted:     m.submitted.Load(),
		Completed:     m.completed.Load(),
		Failed:        m.failed.Load(),
		Canceled:      m.canceled.Load(),
		Rejected:      m.rejected.Load(),
		DepthExceeded: m.depthExceeded.Load(),
		Panics:        m.panics.Load(),
		Stolen:        m.stolen.Load(),
		Workers:       m.workers.Load(),
		DeepestDepth:  m.deepest.Load(),
	}
}

// WritePrometheus emits all metrics in Prometheus text exposition format.
func (m *Metrics) WritePrometheus(w io.Writer, queueDepth, busy int) {
	counter := func(name, help string, v int64) {
		fmt.Fprintf(w, "# HELP %s %s\n# TYPE %s counter\n%s %d\n", name, help, name, name, v)
	}
	gauge := func(name, help string, v int64) {
		fmt.Fprintf(w, "# HELP %s %s\n# TYPE %s gauge\n%s %d\n", name, help, name, name, v)
	}
	counter("pulseloop_tasks_submitted_total", "Tasks accepted into the loop.", m.submitted.Load())
	counter("pulseloop_tasks_completed_total", "Tasks finished without error.", m.completed.Load())
	counter("pulseloop_tasks_failed_total", "Tasks finished with an error.", m.failed.Load())
	counter("pulseloop_tasks_canceled_total", "Tasks canceled before execution.", m.canceled.Load())
	counter("pulseloop_tasks_rejected_total", "Submissions rejected by backpressure.", m.rejected.Load())
	counter("pulseloop_depth_exceeded_total", "Spawns rejected by the depth budget.", m.depthExceeded.Load())
	counter("pulseloop_task_panics_total", "Tasks that panicked (recovered).", m.panics.Load())
	counter("pulseloop_tasks_stolen_total", "Tasks executed via work stealing.", m.stolen.Load())
	gauge("pulseloop_workers", "Current worker pool size.", m.workers.Load())
	gauge("pulseloop_workers_busy", "Workers currently executing a task.", int64(busy))
	gauge("pulseloop_queue_depth", "Tasks waiting in the global queue.", int64(queueDepth))
	gauge("pulseloop_deepest_recursion", "Deepest recursion depth observed.", m.deepest.Load())
	m.latency.write(w, "pulseloop_task_duration_seconds")
	m.queueWait.write(w, "pulseloop_queue_wait_seconds")
}
