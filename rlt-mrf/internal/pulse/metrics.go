package pulse

import (
	"fmt"
	"io"
	"sync/atomic"
	"time"
)

// latencyBuckets are the histogram upper bounds in seconds (Prometheus
// convention, cumulative, +Inf implied by the final count).
var latencyBuckets = []float64{0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5}

const numLatencyBuckets = 11

func init() {
	if len(latencyBuckets) != numLatencyBuckets {
		panic("pulse: numLatencyBuckets out of sync with latencyBuckets")
	}
}

// Metrics is the loop's lock-free metric set. All fields are safe for
// concurrent use; WritePrometheus renders them in Prometheus text format so
// no external dependency is needed for scraping.
type Metrics struct {
	Submitted     atomic.Int64 // root tasks accepted
	Rejected      atomic.Int64 // root tasks rejected by backpressure
	Spawned       atomic.Int64 // child tasks spawned
	Completed     atomic.Int64 // tasks resolved (any outcome)
	Failed        atomic.Int64 // tasks resolved with error
	Cancelled     atomic.Int64 // tasks resolved with context.Canceled
	Panics        atomic.Int64 // panics recovered from task functions
	DepthExceeded atomic.Int64 // Spawn calls denied by the depth budget
	Stolen        atomic.Int64 // tasks moved between workers by stealing
	ScaleUps      atomic.Int64 // tuner scale-up decisions
	ScaleDowns    atomic.Int64 // tuner scale-down decisions

	latencyBuckets [numLatencyBuckets]atomic.Int64
	latencySumNs   atomic.Int64
	latencyCount   atomic.Int64
}

func newMetrics() *Metrics { return &Metrics{} }

func (m *Metrics) observeLatency(d time.Duration) {
	s := d.Seconds()
	for i, ub := range latencyBuckets {
		if s <= ub {
			m.latencyBuckets[i].Add(1)
		}
	}
	m.latencySumNs.Add(int64(d))
	m.latencyCount.Add(1)
}

// WritePrometheus renders every metric plus the given pool stats in
// Prometheus text exposition format.
func (m *Metrics) WritePrometheus(w io.Writer, s Stats) {
	counter := func(name, help string, v int64) {
		fmt.Fprintf(w, "# HELP %s %s\n# TYPE %s counter\n%s %d\n", name, help, name, name, v)
	}
	gauge := func(name, help string, v int64) {
		fmt.Fprintf(w, "# HELP %s %s\n# TYPE %s gauge\n%s %d\n", name, help, name, name, v)
	}

	counter("pulseloop_tasks_submitted_total", "Root tasks accepted.", m.Submitted.Load())
	counter("pulseloop_tasks_rejected_total", "Root tasks rejected by backpressure.", m.Rejected.Load())
	counter("pulseloop_tasks_spawned_total", "Child tasks spawned recursively.", m.Spawned.Load())
	counter("pulseloop_tasks_completed_total", "Tasks resolved.", m.Completed.Load())
	counter("pulseloop_tasks_failed_total", "Tasks resolved with error.", m.Failed.Load())
	counter("pulseloop_tasks_cancelled_total", "Tasks resolved by cancellation.", m.Cancelled.Load())
	counter("pulseloop_task_panics_total", "Panics recovered from task functions.", m.Panics.Load())
	counter("pulseloop_depth_exceeded_total", "Spawns denied by the depth budget.", m.DepthExceeded.Load())
	counter("pulseloop_tasks_stolen_total", "Tasks moved between workers by work stealing.", m.Stolen.Load())
	counter("pulseloop_scale_ups_total", "Feedback tuner scale-up decisions.", m.ScaleUps.Load())
	counter("pulseloop_scale_downs_total", "Feedback tuner scale-down decisions.", m.ScaleDowns.Load())

	gauge("pulseloop_workers", "Live workers in the pool.", s.Workers)
	gauge("pulseloop_workers_target", "Tuner's desired worker count.", s.TargetWorkers)
	gauge("pulseloop_tasks_inflight", "Tasks currently executing.", s.Inflight)
	gauge("pulseloop_queue_depth", "Tasks queued but not yet executing.", s.QueueDepth)

	fmt.Fprintf(w, "# HELP pulseloop_task_duration_seconds Task subtree execution latency.\n")
	fmt.Fprintf(w, "# TYPE pulseloop_task_duration_seconds histogram\n")
	for i, ub := range latencyBuckets {
		fmt.Fprintf(w, "pulseloop_task_duration_seconds_bucket{le=\"%g\"} %d\n", ub, m.latencyBuckets[i].Load())
	}
	count := m.latencyCount.Load()
	fmt.Fprintf(w, "pulseloop_task_duration_seconds_bucket{le=\"+Inf\"} %d\n", count)
	fmt.Fprintf(w, "pulseloop_task_duration_seconds_sum %g\n", float64(m.latencySumNs.Load())/1e9)
	fmt.Fprintf(w, "pulseloop_task_duration_seconds_count %d\n", count)
}
