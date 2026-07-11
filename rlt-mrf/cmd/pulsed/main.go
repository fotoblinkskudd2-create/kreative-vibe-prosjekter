// Command pulsed runs the RLT-MRF PulseLoop core as a service: it hosts
// the bounded work-stealing executor, closes the feedback loop that sizes
// the worker pool, and exposes health, readiness, metrics and a sample
// recursive compute endpoint.
package main

import (
	"context"
	"crypto/sha256"
	"encoding/binary"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"sync/atomic"
	"syscall"
	"time"

	"github.com/fotoblinkskudd2-create/kreative-vibe-prosjekter/rlt-mrf/pkg/pulseloop"
)

func envInt(key string, def int) int {
	if v := os.Getenv(key); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			return n
		}
	}
	return def
}

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	addr := os.Getenv("PULSE_ADDR")
	if addr == "" {
		addr = ":8080"
	}

	loop := pulseloop.New(pulseloop.Config{
		MinWorkers:     envInt("PULSE_MIN_WORKERS", 4),
		MaxWorkers:     envInt("PULSE_MAX_WORKERS", 64),
		QueueSize:      envInt("PULSE_QUEUE_SIZE", 4096),
		MaxDepth:       envInt("PULSE_MAX_DEPTH", 8),
		DefaultTimeout: time.Duration(envInt("PULSE_DEFAULT_TIMEOUT_MS", 30000)) * time.Millisecond,
	})

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	feedback := pulseloop.NewFeedbackController(loop, pulseloop.FeedbackConfig{
		OnAdjust: func(from, to int, reason string) {
			logger.Info("pool resized", "from", from, "to", to, "reason", reason)
		},
	})
	go feedback.Run(ctx)

	var ready atomic.Bool
	ready.Store(true)

	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, _ *http.Request) {
		fmt.Fprintln(w, "ok")
	})
	mux.HandleFunc("GET /readyz", func(w http.ResponseWriter, _ *http.Request) {
		if !ready.Load() {
			http.Error(w, "draining", http.StatusServiceUnavailable)
			return
		}
		fmt.Fprintln(w, "ready")
	})
	mux.HandleFunc("GET /metrics", func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "text/plain; version=0.0.4")
		loop.Metrics().WritePrometheus(w, loop.QueueDepth(), loop.Busy())
	})
	mux.HandleFunc("GET /v1/status", func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]any{
			"workers":     loop.Workers(),
			"busy":        loop.Busy(),
			"queue_depth": loop.QueueDepth(),
			"metrics":     loop.Metrics().Snapshot(),
		})
	})
	mux.HandleFunc("POST /v1/compute", handleCompute(loop, logger))

	server := &http.Server{Addr: addr, Handler: mux}
	go func() {
		logger.Info("pulsed listening", "addr", addr, "workers", loop.Workers())
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Error("http server failed", "err", err)
			stop()
		}
	}()

	<-ctx.Done()
	logger.Info("shutting down: draining loop and server")
	ready.Store(false)
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 25*time.Second)
	defer cancel()
	_ = server.Shutdown(shutdownCtx)
	if err := loop.Shutdown(shutdownCtx); err != nil {
		logger.Error("loop drain incomplete", "err", err)
		os.Exit(1)
	}
	logger.Info("shutdown complete")
}

// handleCompute runs a synthetic recursive workload: a tree of tasks with
// the requested depth and fan-out, each node doing work_us microseconds of
// CPU-bound hashing. It demonstrates bounded recursion, correlation IDs
// and structured concurrency end to end.
func handleCompute(loop *pulseloop.Loop, logger *slog.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		q := r.URL.Query()
		depth := clamp(atoiDefault(q.Get("depth"), 4), 0, loop.Config().MaxDepth)
		fanout := clamp(atoiDefault(q.Get("fanout"), 2), 1, 8)
		workUS := clamp(atoiDefault(q.Get("work_us"), 100), 0, 100000)

		var nodes atomic.Int64
		start := time.Now()
		h, err := loop.Submit(r.Context(), r.Header.Get("X-Correlation-Id"),
			computeNode(&nodes, 0, depth, fanout, workUS))
		if err != nil {
			http.Error(w, err.Error(), http.StatusTooManyRequests)
			return
		}
		if err := h.Wait(r.Context()); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		elapsed := time.Since(start)
		logger.Info("compute done", "depth", depth, "fanout", fanout,
			"nodes", nodes.Load(), "elapsed_ms", elapsed.Milliseconds())
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]any{
			"nodes":      nodes.Load(),
			"depth":      depth,
			"fanout":     fanout,
			"elapsed_ms": elapsed.Milliseconds(),
		})
	}
}

func computeNode(nodes *atomic.Int64, level, maxLevel, fanout, workUS int) pulseloop.TaskFunc {
	return func(tc *pulseloop.TaskContext) error {
		nodes.Add(1)
		burnCPU(workUS)
		if level >= maxLevel {
			return nil
		}
		children := make([]*pulseloop.Handle, 0, fanout)
		for range fanout {
			c, err := tc.Spawn(computeNode(nodes, level+1, maxLevel, fanout, workUS))
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
	}
}

// burnCPU does deterministic hashing work for roughly the requested number
// of microseconds' worth of iterations (calibration-free, best effort).
func burnCPU(us int) {
	var buf [32]byte
	binary.LittleEndian.PutUint64(buf[:8], uint64(us))
	for i := 0; i < us*3; i++ {
		buf = sha256.Sum256(buf[:])
	}
}

func atoiDefault(s string, def int) int {
	if s == "" {
		return def
	}
	n, err := strconv.Atoi(s)
	if err != nil {
		return def
	}
	return n
}

func clamp(v, lo, hi int) int {
	if v < lo {
		return lo
	}
	if v > hi {
		return hi
	}
	return v
}
