package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	usxd "github.com/fredporter/uDosConnect/modules/usxd-go"
	"github.com/fredporter/uDosConnect/modules/usxd-go/server"
	"github.com/fredporter/uDosConnect/modules/usxd-go/story"
)

func main() {
	addr := ":8099"
	if v := os.Getenv("USXD_GO_PORT"); v != "" {
		addr = ":" + v
	}

	hub := server.NewStateHub(usxd.NewBaselineState())

	mux := http.NewServeMux()
	mux.HandleFunc("/api/usxd/state", server.APIStateHandler(hub))
	mux.HandleFunc("/ws/usxd", server.WSHandler(hub))
	mux.HandleFunc("/demo", server.DemoIndexHandler())
	mux.HandleFunc("/demo/story", server.StoryDemoHandler())
	mux.HandleFunc("/demo/final", server.FinalSurfaceDemoHandler())
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})

	log.Printf("usxd-go %s listening on %s", usxd.Version(), addr)
	log.Printf("state endpoint: http://localhost%s/api/usxd/state", addr)
	log.Printf("websocket: ws://localhost%s/ws/usxd", addr)
	log.Printf("demo index: http://localhost%s/demo", addr)
	log.Printf("story demo: http://localhost%s/demo/story", addr)
	log.Printf("final gui demo: http://localhost%s/demo/final", addr)

	httpServer := &http.Server{
		Addr:    addr,
		Handler: mux,
	}

	go func() {
		if err := httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server error: %v", err)
		}
	}()

	if os.Getenv("USXD_STORY_TUI") == "1" {
		log.Printf("USXD_STORY_TUI=1 enabled; running interactive story bridge")
		if err := runStoryBridge(hub); err != nil {
			log.Printf("story runtime ended with error: %v", err)
		}
	}

	// Wait for interrupt and gracefully stop.
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, os.Interrupt, syscall.SIGTERM)
	<-sigCh
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	if err := httpServer.Shutdown(ctx); err != nil {
		log.Printf("shutdown error: %v", err)
	}
}

func runStoryBridge(hub *server.StateHub) error {
	s := story.New("uDOS onboarding bridge").
		AddStep(story.NewPresentationStep("# Welcome to uDOS\nPress Enter to continue.")).
		AddStep(story.NewSingleChoiceStep("How do you want to start?", []story.Option{
			{Value: "guided", Label: "Guided walkthrough", Default: true},
			{Value: "fast", Label: "Fast track"},
			{Value: "import", Label: "Import existing"},
		})).
		AddStep(story.NewMultiChoiceStep("Select modules", []story.Option{
			{Value: "usxd", Label: "USXD Core", Selected: true},
			{Value: "thinui", Label: "ThinUI Runtime"},
			{Value: "lens", Label: "LENS Engine"},
		})).
		AddStep(story.NewStarsStep("How familiar are you with terminal tools?", 5, 3)).
		AddStep(story.NewScaleStep("Rate CLI comfort", 1, 5, []string{"Never", "Basic", "Daily", "Expert", "Wizard"}, 3))

	return s.RunBubbleTeaWithState(story.ThemeTypeform, func(state usxd.State) {
		hub.Set(state)
	})
}
