package server

import (
	"testing"
	"time"

	usxd "github.com/fredporter/uDosConnect/modules/usxd-go"
)

func TestStateHubSubscribeReceivesSet(t *testing.T) {
	hub := NewStateHub(usxd.NewBaselineState())
	ch := hub.Subscribe()
	defer hub.Unsubscribe(ch)

	next := usxd.NewBaselineState()
	next.OpenBox.ID = "updated"
	hub.Set(next)

	select {
	case got := <-ch:
		if got.OpenBox.ID != "updated" {
			t.Fatalf("expected updated state")
		}
	case <-time.After(500 * time.Millisecond):
		t.Fatalf("timed out waiting for state update")
	}
}
