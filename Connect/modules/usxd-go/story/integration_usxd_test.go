package story

import "testing"

func TestToUSXDStateBuildsStoryWidgetPayload(t *testing.T) {
	s := New("Welcome").
		AddStep(NewPresentationStep("hello")).
		AddStep(NewStarsStep("rate", 5, 3))

	state := s.ToUSXDState()
	if state.OpenBox.Type != "application/vnd.usxd.story" {
		t.Fatalf("expected story open_box type")
	}
	if len(state.Widgets.Instances) != 1 {
		t.Fatalf("expected one story widget instance")
	}
	if state.Widgets.Instances[0].Type != "story" {
		t.Fatalf("expected story widget type")
	}
}
