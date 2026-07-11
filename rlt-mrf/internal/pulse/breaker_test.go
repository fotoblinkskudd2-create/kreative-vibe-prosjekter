package pulse

import (
	"errors"
	"testing"
	"time"
)

func TestBreakerLifecycle(t *testing.T) {
	now := time.Now()
	b := NewBreaker(BreakerConfig{FailureThreshold: 3, Cooldown: time.Second, HalfOpenSuccesses: 2})
	b.now = func() time.Time { return now }

	boom := errors.New("boom")
	fail := func() error { return boom }
	ok := func() error { return nil }

	// Closed: failures below threshold keep the circuit closed.
	for i := 0; i < 2; i++ {
		if err := b.Do(fail); !errors.Is(err, boom) {
			t.Fatalf("Do = %v, want boom", err)
		}
	}
	if s := b.State(); s != BreakerClosed {
		t.Fatalf("state after 2 failures = %v, want closed", s)
	}

	// Third consecutive failure opens the circuit; calls now fail fast.
	if err := b.Do(fail); !errors.Is(err, boom) {
		t.Fatalf("Do = %v, want boom", err)
	}
	if err := b.Do(ok); !errors.Is(err, ErrBreakerOpen) {
		t.Fatalf("Do while open = %v, want ErrBreakerOpen", err)
	}

	// After the cooldown the circuit half-opens and admits probes.
	now = now.Add(time.Second + time.Millisecond)
	if s := b.State(); s != BreakerHalfOpen {
		t.Fatalf("state after cooldown = %v, want half-open", s)
	}
	if err := b.Do(ok); err != nil {
		t.Fatalf("probe 1 = %v", err)
	}
	if err := b.Do(ok); err != nil {
		t.Fatalf("probe 2 = %v", err)
	}
	if s := b.State(); s != BreakerClosed {
		t.Fatalf("state after successful probes = %v, want closed", s)
	}

	// A failure while half-open reopens immediately.
	for i := 0; i < 3; i++ {
		_ = b.Do(fail)
	}
	now = now.Add(time.Second + time.Millisecond)
	if s := b.State(); s != BreakerHalfOpen {
		t.Fatalf("state = %v, want half-open", s)
	}
	_ = b.Do(fail)
	if err := b.Do(ok); !errors.Is(err, ErrBreakerOpen) {
		t.Fatalf("Do after half-open failure = %v, want ErrBreakerOpen", err)
	}
}
