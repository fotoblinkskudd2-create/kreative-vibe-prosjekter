package pulse

import (
	"sync"
	"time"
)

// tuner closes the feedback loop: it periodically samples queue depth and
// worker utilisation and adjusts the pool's target size. The policy is
// asymmetric by design — scale up proportionally to backlog, scale down one
// worker at a time after sustained idleness — which gives hysteresis and
// avoids the oscillation failure mode called out in the architecture review.
type tuner struct {
	loop *Loop

	// scaleDownAfter is how many consecutive idle samples are required
	// before removing one worker.
	scaleDownAfter int
	idleSamples    int

	stopCh   chan struct{}
	stopOnce sync.Once
	done     chan struct{}
}

func newTuner(l *Loop) *tuner {
	return &tuner{
		loop:           l,
		scaleDownAfter: 4,
		stopCh:         make(chan struct{}),
		done:           make(chan struct{}),
	}
}

func (tu *tuner) start() {
	go tu.run()
}

func (tu *tuner) stopTuner() {
	tu.stopOnce.Do(func() { close(tu.stopCh) })
	<-tu.done
}

func (tu *tuner) run() {
	defer close(tu.done)
	ticker := time.NewTicker(tu.loop.cfg.TuneInterval)
	defer ticker.Stop()
	for {
		select {
		case <-ticker.C:
			tu.tick()
		case <-tu.stopCh:
			return
		}
	}
}

func (tu *tuner) tick() {
	p := tu.loop.pool
	cfg := tu.loop.cfg

	queued := p.queueDepth()
	inflight := p.inflight.Load()
	cur := p.current.Load()

	target := cur
	switch {
	case queued > 0:
		// Backlog: add roughly one worker per two queued tasks, capped.
		tu.idleSamples = 0
		target = min(cur+(queued+1)/2, int64(cfg.MaxWorkers))
	case inflight*2 < cur:
		// Sustained under-utilisation (< 50%): shrink slowly.
		tu.idleSamples++
		if tu.idleSamples >= tu.scaleDownAfter {
			tu.idleSamples = 0
			target = max(cur-1, int64(cfg.MinWorkers))
		}
	default:
		tu.idleSamples = 0
	}

	p.target.Store(max(target, int64(cfg.MinWorkers)))
	if target > cur {
		p.ensureWorkers(target)
		tu.loop.metrics.ScaleUps.Add(1)
	} else if target < cur {
		tu.loop.metrics.ScaleDowns.Add(1)
		// Workers observe the lowered target and retire themselves; nudge
		// parked ones so retirement is prompt.
		p.wakeOne()
	}
}
