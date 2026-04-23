package schema

import (
	"encoding/json"
	"testing"

	"github.com/fredporter/uDosConnect/modules/usxd-go/story"
)

func TestValidateStoryJSON_PassesForSerializedStory(t *testing.T) {
	s := story.New("Onboarding").
		AddStep(story.NewPresentationStep("Welcome")).
		AddStep(story.NewInputStep("Workspace name", "text", "my-space", true)).
		AddStep(story.NewStarsStep("Rate", 5, 4))
	raw, err := s.Serialize()
	if err != nil {
		t.Fatalf("serialize story: %v", err)
	}
	if err := ValidateStoryJSON(raw); err != nil {
		t.Fatalf("expected valid story envelope: %v", err)
	}
}

func TestValidateStoryJSON_RejectsUnsupportedStepType(t *testing.T) {
	s := story.New("Bad").
		AddStep(story.NewPresentationStep("Welcome"))
	raw, err := s.Serialize()
	if err != nil {
		t.Fatalf("serialize story: %v", err)
	}

	var doc map[string]any
	if err := json.Unmarshal(raw, &doc); err != nil {
		t.Fatalf("unmarshal story: %v", err)
	}
	storyObj := doc["story"].(map[string]any)
	steps := storyObj["steps"].([]any)
	steps[0].(map[string]any)["type"] = "unsupported-step"
	modified, err := json.Marshal(doc)
	if err != nil {
		t.Fatalf("marshal modified story: %v", err)
	}

	if err := ValidateStoryJSON(modified); err == nil {
		t.Fatalf("expected error for unsupported step type")
	}
}

func TestValidateStoryJSON_RequiresEnterToContinue(t *testing.T) {
	s := story.New("Bad Enter").
		AddStep(story.NewPresentationStep("Welcome"))
	raw, err := s.Serialize()
	if err != nil {
		t.Fatalf("serialize story: %v", err)
	}

	var doc map[string]any
	if err := json.Unmarshal(raw, &doc); err != nil {
		t.Fatalf("unmarshal story: %v", err)
	}
	storyObj := doc["story"].(map[string]any)
	nav := storyObj["navigation"].(map[string]any)
	nav["enter_to_continue"] = false
	modified, err := json.Marshal(doc)
	if err != nil {
		t.Fatalf("marshal modified story: %v", err)
	}
	if err := ValidateStoryJSON(modified); err == nil {
		t.Fatalf("expected error for enter_to_continue=false")
	}
}

