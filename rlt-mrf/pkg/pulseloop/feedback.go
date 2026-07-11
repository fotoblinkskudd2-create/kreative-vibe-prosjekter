package pulseloop

import (
	"context"
	"time"
)

// FeedbackConfig tunes the closed feedback loop that resizes the worker
// pool. The controller is deliberately a simple proportional controller
// with hysteresis: it grows fast under pressure and shrinks slowly when
// idle, which avoids the oscillation that plagues aggressive optimizers.
type FeedbackConfig struct {
	// Interval between control ticks.
	Interval time.Duration
	// ScaleUpQueueFactor: grow when queueDepth > workers * factor.
	ScaleUpQueueFactor float64
	// ScaleUpUtilization: grow when busy/workers exceeds this.
	ScaleUpUtilization float64
	// ScaleDownUtilization: shrink when the queue is empty and
	// busy/workers stays below this for IdleTicks consecutive ticks.
	ScaleDownUtilization float64
	IdleTicks            int
	// OnAdjust, if set, is called after every resize (observability hook).
	OnAdjust func(from, to int, reason string)
}

func (c FeedbackConfig) withDefaults() FeedbackConfig {
	if c.Interval <= 0 {
		c.Interval = 250 * time.Millisecond
	}
	if c.ScaleUpQueueFactor <= 0 {
		c.ScaleUpQueueFactor = 2
	}
	if c.ScaleUpUtilization <= 0 {
		c.ScaleUpUtilization = 0.85
	}
	if c.ScaleDownUtilization <= 0 {
		c.ScaleDownUtilization = 0.25
	}
	if c.IdleTicks <= 0 {
		c.IdleTicks = 8
	}
	return c
}

// FeedbackController closes the loop metrics -> decision -> pool resize.
type FeedbackController struct {
	loop *Loop
	cfg  FeedbackConfig
}

func NewFeedbackController(l *Loop, cfg FeedbackConfig) *FeedbackController {
	return &FeedbackController{loop: l, cfg: cfg.withDefaults()}
}

// Run drives the control loop until ctx is cancelled. Call it in its own
// goroutine.
func (fc *FeedbackController) Run(ctx context.Context) {
	ticker := time.NewTicker(fc.cfg.Interval)
	defer ticker.Stop()
	idle := 0
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
		}
		workers := fc.loop.Workers()
		if workers == 0 { // loop shut down
			return
		}
		busy := fc.loop.Busy()
		queue := fc.loop.QueueDepth()
		util := float64(busy) / float64(workers)

		switch {
		case float64(queue) > float64(workers)*fc.cfg.ScaleUpQueueFactor || util > fc.cfg.ScaleUpUtilization:
			idle = 0
			target := workers + max(1, workers/2)
			fc.resize(workers, target, "pressure")
		case queue == 0 && util < fc.cfg.ScaleDownUtilization:
			idle++
			if idle >= fc.cfg.IdleTicks {
				idle = 0
				fc.resize(workers, workers-1, "idle")
			}
		default:
			idle = 0
		}
	}
}

func (fc *FeedbackController) resize(from, to int, reason string) {
	fc.loop.SetWorkers(to)
	actual := fc.loop.Workers()
	if actual != from && fc.cfg.OnAdjust != nil {
		fc.cfg.OnAdjust(from, actual, reason)
	}
}
