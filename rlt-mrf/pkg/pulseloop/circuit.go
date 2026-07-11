package pulseloop

import (
	"errors"
	"sync"
	"time"
)

// ErrCircuitOpen is returned by CircuitBreaker.Do while the breaker is
// open and the cool-down has not elapsed.
var ErrCircuitOpen = errors.New("pulseloop: circuit open")

// CircuitState is the classic three-state breaker state.
type CircuitState int

const (
	CircuitClosed CircuitState = iota
	CircuitOpen
	CircuitHalfOpen
)

func (s CircuitState) String() string {
	switch s {
	case CircuitOpen:
		return "open"
	case CircuitHalfOpen:
		return "half-open"
	default:
		return "closed"
	}
}

// CircuitBreaker protects a downstream dependency used from inside tasks.
// After Threshold consecutive failures it opens for Cooldown; the first
// call after the cool-down probes in half-open state, and a success
// closes the breaker again.
type CircuitBreaker struct {
	Threshold int           // consecutive failures to open (default 5)
	Cooldown  time.Duration // open duration before half-open (default 5s)

	mu       sync.Mutex
	state    CircuitState
	failures int
	openedAt time.Time
}

func (cb *CircuitBreaker) threshold() int {
	if cb.Threshold <= 0 {
		return 5
	}
	return cb.Threshold
}

func (cb *CircuitBreaker) cooldown() time.Duration {
	if cb.Cooldown <= 0 {
		return 5 * time.Second
	}
	return cb.Cooldown
}

// State returns the breaker's current state.
func (cb *CircuitBreaker) State() CircuitState {
	cb.mu.Lock()
	defer cb.mu.Unlock()
	return cb.state
}

// Do runs fn under the breaker. While open it fails fast with
// ErrCircuitOpen without invoking fn.
func (cb *CircuitBreaker) Do(fn func() error) error {
	cb.mu.Lock()
	switch cb.state {
	case CircuitOpen:
		if time.Since(cb.openedAt) < cb.cooldown() {
			cb.mu.Unlock()
			return ErrCircuitOpen
		}
		cb.state = CircuitHalfOpen
	}
	cb.mu.Unlock()

	err := fn()

	cb.mu.Lock()
	defer cb.mu.Unlock()
	if err != nil {
		cb.failures++
		if cb.state == CircuitHalfOpen || cb.failures >= cb.threshold() {
			cb.state = CircuitOpen
			cb.openedAt = time.Now()
		}
		return err
	}
	cb.failures = 0
	cb.state = CircuitClosed
	return nil
}
