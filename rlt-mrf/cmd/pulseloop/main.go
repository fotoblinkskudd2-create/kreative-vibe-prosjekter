// Command pulseloop runs the RLT-MRF PulseLoop core as an HTTP service:
// health and readiness probes for Kubernetes, Prometheus metrics, and demo
// endpoints exercising bounded recursive workloads.
package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"sync/atomic"
	"syscall"
	"time"

	"github.com/fotoblinkskudd2-create/kreative-vibe-prosjekter/rlt-mrf/internal/pulse"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	cfg := pulse.Config{
		MinWorkers:     envInt("PULSE_MIN_WORKERS", 0),
		MaxWorkers:     envInt("PULSE_MAX_WORKERS", 0),
		MaxDepth:       envInt("PULSE_MAX_DEPTH", 0),
		QueueSize:      envInt("PULSE_QUEUE_SIZE", 0),
		DefaultTimeout: envDuration("PULSE_DEFAULT_TIMEOUT", 0),
		TuneInterval:   envDuration("PULSE_TUNE_INTERVAL", 0),
	}
	loop, err := pulse.New(cfg)
	if err != nil {
		logger.Error("invalid configuration", "err", err)
		os.Exit(1)
	}
	loop.Start()

	var ready atomic.Bool
	ready.Store(true)

	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "ok")
	})
	mux.HandleFunc("GET /readyz", func(w http.ResponseWriter, r *http.Request) {
		if !ready.Load() {
			http.Error(w, "draining", http.StatusServiceUnavailable)
			return
		}
		fmt.Fprintln(w, "ready")
	})
	mux.HandleFunc("GET /metrics", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/plain; version=0.0.4")
		loop.Metrics().WritePrometheus(w, loop.Stats())
	})
	mux.HandleFunc("GET /demo/fib", handleFib(loop, logger))
	mux.HandleFunc("GET /demo/fanout", handleFanout(loop, logger))

	addr := ":" + envStr("PULSE_HTTP_PORT", "8080")
	srv := &http.Server{
		Addr:              addr,
		Handler:           mux,
		ReadHeaderTimeout: 5 * time.Second,
	}

	go func() {
		logger.Info("pulseloop listening", "addr", addr)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			logger.Error("http server failed", "err", err)
			os.Exit(1)
		}
	}()

	// Graceful shutdown: flip readiness first so the load balancer drains us,
	// then stop HTTP intake, then drain the loop.
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	sig := <-stop
	logger.Info("shutting down", "signal", sig.String())
	ready.Store(false)

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 25*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		logger.Warn("http shutdown", "err", err)
	}
	if err := loop.Shutdown(shutdownCtx); err != nil {
		logger.Warn("loop shutdown forced cancellation", "err", err)
	}
	logger.Info("shutdown complete")
}

// handleFib computes fib(n) by recursive task spawning. When the depth budget
// runs out, the remaining subtree is computed inline — demonstrating graceful
// degradation instead of failure when recursion is bounded.
func handleFib(loop *pulse.Loop, logger *slog.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		n := queryInt(r, "n", 20)
		if n < 0 || n > 40 {
			http.Error(w, "n must be in [0,40]", http.StatusBadRequest)
			return
		}
		var result int
		start := time.Now()
		h, err := loop.Submit("fib", func(tc *pulse.TaskCtx) error {
			var err error
			result, err = fib(tc, n)
			return err
		})
		if submitError(w, err) {
			return
		}
		if err := h.Wait(); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		logger.Info("fib computed", "n", n, "correlation_id", h.CorrelationID(),
			"elapsed", time.Since(start).String())
		fmt.Fprintf(w, "{\"n\":%d,\"fib\":%d,\"correlation_id\":%q}\n", n, result, h.CorrelationID())
	}
}

func fib(tc *pulse.TaskCtx, n int) (int, error) {
	if n < 2 {
		return n, nil
	}
	var left int
	h, err := tc.Spawn("fib-left", func(c *pulse.TaskCtx) error {
		var e error
		left, e = fib(c, n-1)
		return e
	})
	if errors.Is(err, pulse.ErrDepthExceeded) {
		// Depth budget exhausted: degrade to sequential computation.
		return fibSeq(n), nil
	}
	if err != nil {
		return 0, err
	}
	right, err := fib(tc, n-2) // work-first: compute one branch on this worker
	if err != nil {
		return 0, err
	}
	if err := tc.Await(h); err != nil {
		return 0, err
	}
	return left + right, nil
}

func fibSeq(n int) int {
	a, b := 0, 1
	for i := 0; i < n; i++ {
		a, b = b, a+b
	}
	return a
}

// handleFanout spawns width children per level down to the requested depth,
// each sleeping for the given duration — a synthetic load generator for
// exercising the tuner and dashboards.
func handleFanout(loop *pulse.Loop, logger *slog.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		width := queryInt(r, "width", 3)
		depth := queryInt(r, "depth", 3)
		sleep := time.Duration(queryInt(r, "sleep_ms", 10)) * time.Millisecond
		if width < 1 || width > 10 || depth < 1 || depth > 10 {
			http.Error(w, "width and depth must be in [1,10]", http.StatusBadRequest)
			return
		}

		var executed atomic.Int64
		var fan pulse.TaskFunc
		fan = func(tc *pulse.TaskCtx) error {
			executed.Add(1)
			select {
			case <-time.After(sleep):
			case <-tc.Context().Done():
				return tc.Context().Err()
			}
			if tc.Depth() >= depth {
				return nil
			}
			for i := 0; i < width; i++ {
				if _, err := tc.Spawn("fanout", fan); err != nil {
					return err
				}
			}
			return nil
		}

		start := time.Now()
		h, err := loop.Submit("fanout-root", fan)
		if submitError(w, err) {
			return
		}
		if err := h.Wait(); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		elapsed := time.Since(start)
		logger.Info("fanout completed", "tasks", executed.Load(),
			"correlation_id", h.CorrelationID(), "elapsed", elapsed.String())
		fmt.Fprintf(w, "{\"tasks\":%d,\"elapsed_ms\":%d,\"correlation_id\":%q}\n",
			executed.Load(), elapsed.Milliseconds(), h.CorrelationID())
	}
}

func submitError(w http.ResponseWriter, err error) bool {
	switch {
	case err == nil:
		return false
	case errors.Is(err, pulse.ErrQueueFull):
		http.Error(w, err.Error(), http.StatusTooManyRequests)
	case errors.Is(err, pulse.ErrClosed):
		http.Error(w, err.Error(), http.StatusServiceUnavailable)
	default:
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
	return true
}

func envStr(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func envInt(key string, def int) int {
	if v := os.Getenv(key); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			return n
		}
		slog.Warn("ignoring invalid integer env var", "key", key, "value", v)
	}
	return def
}

func envDuration(key string, def time.Duration) time.Duration {
	if v := os.Getenv(key); v != "" {
		if d, err := time.ParseDuration(v); err == nil {
			return d
		}
		slog.Warn("ignoring invalid duration env var", "key", key, "value", v)
	}
	return def
}

func queryInt(r *http.Request, key string, def int) int {
	if v := r.URL.Query().Get(key); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			return n
		}
	}
	return def
}
