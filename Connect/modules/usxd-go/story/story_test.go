package story

import (
	"strings"
	"testing"
)

func TestNavigationEnterAndBack(t *testing.T) {
	s := New("Onboarding").
		AddStep(NewPresentationStep("welcome")).
		AddStep(NewInputStep("Workspace", "text", "my-space", true)).
		AddStep(NewStarsStep("Rate", 5, 3))

	submitted, err := s.Enter()
	if err != nil || submitted {
		t.Fatalf("first enter should advance only, err=%v submitted=%v", err, submitted)
	}
	if s.Cursor() != 1 {
		t.Fatalf("expected cursor=1, got %d", s.Cursor())
	}

	if err := s.Back(); err != nil {
		t.Fatalf("back should work: %v", err)
	}
	if s.Cursor() != 0 {
		t.Fatalf("expected cursor=0 after back, got %d", s.Cursor())
	}
}

func TestStepInteractions(t *testing.T) {
	s := New("Flow").
		AddStep(NewInputStep("Name", "text", "x", true)).
		AddStep(NewSingleChoiceStep("Path", []Option{
			{Value: "guided", Label: "Guided"},
			{Value: "fast", Label: "Fast"},
		})).
		AddStep(NewMultiChoiceStep("Modules", []Option{
			{Value: "usxd", Label: "USXD"},
			{Value: "thinui", Label: "ThinUI"},
		})).
		AddStep(NewScaleStep("Comfort", 1, 5, nil, 3))

	if err := s.SetInput("wizard"); err != nil {
		t.Fatalf("set input failed: %v", err)
	}
	_, _ = s.Enter()

	if err := s.SelectSingle(1); err != nil {
		t.Fatalf("select single failed: %v", err)
	}
	_, _ = s.Enter()

	if err := s.ToggleMulti(0); err != nil {
		t.Fatalf("toggle multi failed: %v", err)
	}
	if err := s.ToggleMulti(1); err != nil {
		t.Fatalf("toggle multi second failed: %v", err)
	}
	_, _ = s.Enter()

	if err := s.SetScale(4); err != nil {
		t.Fatalf("set scale failed: %v", err)
	}

	ans := s.Answers()
	if ans[0] != "wizard" {
		t.Fatalf("expected input answer stored")
	}
	if ans[1] != "fast" {
		t.Fatalf("expected single choice value stored")
	}
}

func TestSerializeAndRender(t *testing.T) {
	s := New("Welcome").
		AddStep(NewPresentationStep("# Welcome")).
		AddStep(NewStarsStep("Rate", 5, 4))

	raw, err := s.Serialize()
	if err != nil {
		t.Fatalf("serialize failed: %v", err)
	}
	txt := string(raw)
	if !strings.Contains(txt, "application/vnd.usxd.story") {
		t.Fatalf("expected story mime type")
	}
	if !strings.Contains(txt, "v0.2.0-alpha.1") {
		t.Fatalf("expected alpha story version")
	}

	rendered, err := s.RenderCurrent(ThemeTypeform)
	if err != nil {
		t.Fatalf("render failed: %v", err)
	}
	if !strings.Contains(rendered, "Story 1/2") {
		t.Fatalf("expected progress in render")
	}
}

func TestPanelKindTaxonomyMapping(t *testing.T) {
	cases := []struct {
		step Step
		want PanelKind
	}{
		{step: NewPresentationStep("x"), want: PanelStorySlide},
		{step: NewInputStep("Name", "text", "", true), want: PanelStoryInput},
		{step: NewSingleChoiceStep("Path", []Option{{Value: "a", Label: "A"}}), want: PanelStoryChoice},
		{step: NewMultiChoiceStep("Modules", []Option{{Value: "a", Label: "A"}}), want: PanelStoryChoice},
		{step: NewScaleStep("Rate", 1, 5, nil, 3), want: PanelStoryScale},
		{step: NewStarsStep("Stars", 5, 3), want: PanelStoryRatingStars},
	}
	for _, tc := range cases {
		got := tc.step.PanelKind()
		if got != tc.want {
			t.Fatalf("panel kind mismatch for %q: got %q want %q", tc.step.Type, got, tc.want)
		}
	}
}

func TestRenderHintsAlignWithControlType(t *testing.T) {
	s := New("Hints").
		AddStep(NewScaleStep("Scale", 1, 5, nil, 3)).
		AddStep(NewMultiChoiceStep("Multi", []Option{{Value: "a", Label: "A"}}))

	rendered, err := s.RenderCurrent(ThemeTypeform)
	if err != nil {
		t.Fatalf("render scale: %v", err)
	}
	if !strings.Contains(rendered, "Use ← → then Enter") {
		t.Fatalf("expected scale keyboard hint, got: %q", rendered)
	}

	_, _ = s.Enter()
	rendered, err = s.RenderCurrent(ThemeTypeform)
	if err != nil {
		t.Fatalf("render multi-choice: %v", err)
	}
	if !strings.Contains(rendered, "Space to toggle, Enter to continue") {
		t.Fatalf("expected multi-choice keyboard hint, got: %q", rendered)
	}
}
