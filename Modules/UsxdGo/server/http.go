package server

import (
	"net/http"

	"github.com/fredporter/uDosConnect/modules/usxd-go/serializer"
)

func APIStateHandler(hub *StateHub) http.HandlerFunc {
	return func(w http.ResponseWriter, _ *http.Request) {
		payload, err := serializer.ToJSON(hub.Get())
		if err != nil {
			http.Error(w, "failed to serialize state", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		_, _ = w.Write(payload)
	}
}
