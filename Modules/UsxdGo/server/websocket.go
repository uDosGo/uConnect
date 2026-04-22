package server

import (
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/fredporter/uDosConnect/modules/usxd-go/serializer"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(_ *http.Request) bool { return true },
}

func WSHandler(hub *StateHub) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Printf("ws upgrade failed: %v", err)
			return
		}
		defer conn.Close()
		stateCh := hub.Subscribe()
		defer hub.Unsubscribe(stateCh)

		ticker := time.NewTicker(1500 * time.Millisecond)
		defer ticker.Stop()

		// Emit initial snapshot and periodic refresh ticks for Alpha 1.
		writeState := func() error {
			payload, err := serializer.ToJSON(hub.Get())
			if err != nil {
				return err
			}
			return conn.WriteMessage(websocket.TextMessage, payload)
		}
		if err := writeState(); err != nil {
			return
		}

		var closeOnce sync.Once
		closeRead := make(chan struct{})
		go func() {
			defer closeOnce.Do(func() { close(closeRead) })
			for {
				if _, _, err := conn.ReadMessage(); err != nil {
					return
				}
			}
		}()

		for {
			select {
			case s := <-stateCh:
				payload, err := serializer.ToJSON(s)
				if err != nil {
					return
				}
				if err := conn.WriteMessage(websocket.TextMessage, payload); err != nil {
					return
				}
			case <-ticker.C:
				if err := writeState(); err != nil {
					return
				}
			case <-closeRead:
				return
			}
		}
	}
}
