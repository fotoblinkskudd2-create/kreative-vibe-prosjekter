package pulse

import (
	"sync/atomic"
	"testing"
	"time"
)

func TestParallelWideFanout(t *testing.T) {
	l := newTestLoop(t, Config{MaxDepth: 6, DefaultTimeout: time.Minute, TuneInterval: 50 * time.Millisecond})
	var executed atomic.Int64
	var fan TaskFunc
	fan = func(tc *TaskCtx) error {
		executed.Add(1)
		select {
		case <-time.After(0):
		case <-tc.Context().Done():
			return tc.Context().Err()
		}
		if tc.Depth() >= 5 {
			return nil
		}
		for i := 0; i < 4; i++ {
			if _, err := tc.Spawn("fan", fan); err != nil {
				return err
			}
		}
		return nil
	}
	done := make(chan error, 20)
	for i := 0; i < 20; i++ {
		go func() {
			h, err := l.Submit("root", fan)
			if err != nil {
				done <- err
				return
			}
			done <- h.Wait()
		}()
	}
	for i := 0; i < 20; i++ {
		select {
		case err := <-done:
			if err != nil {
				t.Fatalf("root %d: %v", i, err)
			}
		case <-time.After(20 * time.Second):
			t.Fatalf("hung after %d completions, executed=%d stats=%+v", i, executed.Load(), l.Stats())
		}
	}
	t.Logf("executed=%d", executed.Load())
}
