package pulse

import (
	"errors"
	"sync"
	"time"
)

// ErrBreakerOpen is returned by Breaker.Do while the circuit is open.
var ErrBreakerOpen = errors.New("pulse: circuit breaker open")

// BreakerState is the circuit breaker's current state.
type BreakerState int32

const (
	BreakerClosed BreakerState = iota
	BreakerOpen
	BreakerHalfOpen
)

func (s BreakerState) String() string {
	switch s {
	case BreakerClosed:
		return "closed"
	case BreakerOpen:
		return "open"
	case BreakerHalfOpen:
		return "half-open"
	default:
		return "unknown"
	}
}

// BreakerConfig tunes a Breaker. Zero values get sane defaults.
type BreakerConfig struct {
	// FailureThreshold is the number of consecutive failures that opens the
	// circuit. Default: 5.
	FailureThreshold int
	// Cooldown is how long the circuit stays open before probing again.
	// Default: 5s.
	Cooldown time.Duration
	// HalfOpenSuccesses is how many consecutive probe successes close the
	// circuit again. Default: 2.
	HalfOpenSuccesses int
}

// Breaker is a three-state (closed → open → half-open) circuit breaker used
// by the self-healing layer to stop hammering failing dependencies.
type Breaker struct {
	cfg BreakerConfig

	mu        sync.Mutex
	state     BreakerState
	failures  int
	successes int
	openedAt  time.Time
	now       func() time.Time // injectable clock for tests
}

// NewBreaker creates a closed Breaker with defaults applied.
func NewBreaker(cfg BreakerConfig) *Breaker {
	if cfg.FailureThreshold <= 0 {
		cfg.FailureThreshold = 5
	}
	if cfg.Cooldown <= 0 {
		cfg.Cooldown = 5 * time.Second
	}
	if cfg.HalfOpenSuccesses <= 0 {
		cfg.HalfOpenSuccesses = 2
	}
	return &Breaker{cfg: cfg, state: BreakerClosed, now: time.Now}
}

// State returns the current state, transitioning open → half-open when the
// cooldown has elapsed.
func (b *Breaker) State() BreakerState {
	b.mu.Lock()
	defer b.mu.Unlock()
	return b.stateLocked()
}

func (b *Breaker) stateLocked() BreakerState {
	if b.state == BreakerOpen && b.now().Sub(b.openedAt) >= b.cfg.Cooldown {
		b.state = BreakerHalfOpen
		b.successes = 0
	}
	return b.state
}

// Do runs fn if the circuit allows it and records the outcome. While open it
// fails fast with ErrBreakerOpen without invoking fn.
func (b *Breaker) Do(fn func() error) error {
	b.mu.Lock()
	if b.stateLocked() == BreakerOpen {
		b.mu.Unlock()
		return ErrBreakerOpen
	}
	b.mu.Unlock()

	err := fn()
	b.record(err)
	return err
}

func (b *Breaker) record(err error) {
	b.mu.Lock()
	defer b.mu.Unlock()
	state := b.stateLocked()

	if err != nil {
		b.failures++
		b.successes = 0
		if state == BreakerHalfOpen || b.failures >= b.cfg.FailureThreshold {
			b.state = BreakerOpen
			b.openedAt = b.now()
			b.failures = 0
		}
		return
	}

	b.failures = 0
	if state == BreakerHalfOpen {
		b.successes++
		if b.successes >= b.cfg.HalfOpenSuccesses {
			b.state = BreakerClosed
			b.successes = 0
		}
	}
}
