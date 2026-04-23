package server

import (
	"sync"

	usxd "github.com/fredporter/uDosConnect/modules/usxd-go"
)

type StateHub struct {
	mu       sync.RWMutex
	state    usxd.State
	watchers map[chan usxd.State]struct{}
}

func NewStateHub(initial usxd.State) *StateHub {
	return &StateHub{
		state:    initial,
		watchers: map[chan usxd.State]struct{}{},
	}
}

func (h *StateHub) Get() usxd.State {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return h.state
}

func (h *StateHub) Set(s usxd.State) {
	h.mu.Lock()
	h.state = s
	watchers := make([]chan usxd.State, 0, len(h.watchers))
	for ch := range h.watchers {
		watchers = append(watchers, ch)
	}
	h.mu.Unlock()

	for _, ch := range watchers {
		select {
		case ch <- s:
		default:
		}
	}
}

func (h *StateHub) Subscribe() chan usxd.State {
	h.mu.Lock()
	defer h.mu.Unlock()
	ch := make(chan usxd.State, 4)
	h.watchers[ch] = struct{}{}
	return ch
}

func (h *StateHub) Unsubscribe(ch chan usxd.State) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if _, ok := h.watchers[ch]; ok {
		delete(h.watchers, ch)
		close(ch)
	}
}
