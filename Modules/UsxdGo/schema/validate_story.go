package schema

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"
)

var (
	ErrStoryMissingOpenBox     = errors.New("missing open_box")
	ErrStoryMissingStory       = errors.New("missing story")
	ErrStoryInvalidMimeType    = errors.New("open_box.type must be application/vnd.usxd.story")
	ErrStoryInvalidVersion     = errors.New("open_box.usxd_version must start with v0.2.0-alpha.")
	ErrStoryMissingTitle       = errors.New("story.title must be non-empty")
	ErrStoryMissingSteps       = errors.New("story.steps must be a non-empty array")
	ErrStoryInvalidStepType    = errors.New("story step has unsupported type")
	ErrStoryInvalidNavigation  = errors.New("story.navigation is invalid")
	ErrStoryEnterMustBePrimary = errors.New("story.navigation.enter_to_continue must be true")
)

var allowedStoryStepTypes = map[string]struct{}{
	"presentation":  {},
	"input":         {},
	"single_choice": {},
	"multi_choice":  {},
	"stars":         {},
	"scale":         {},
}

func ValidateStoryJSON(payload []byte) error {
	var doc map[string]any
	if err := json.Unmarshal(payload, &doc); err != nil {
		return fmt.Errorf("invalid json: %w", err)
	}
	return ValidateStoryMap(doc)
}

func ValidateStoryMap(doc map[string]any) error {
	openBoxAny, ok := doc["open_box"]
	if !ok {
		return ErrStoryMissingOpenBox
	}
	openBox, ok := openBoxAny.(map[string]any)
	if !ok {
		return ErrStoryMissingOpenBox
	}
	if t, _ := openBox["type"].(string); t != "application/vnd.usxd.story" {
		return ErrStoryInvalidMimeType
	}
	if ver, _ := openBox["usxd_version"].(string); !strings.HasPrefix(ver, "v0.2.0-alpha.") {
		return ErrStoryInvalidVersion
	}

	storyAny, ok := doc["story"]
	if !ok {
		return ErrStoryMissingStory
	}
	story, ok := storyAny.(map[string]any)
	if !ok {
		return ErrStoryMissingStory
	}
	if title, _ := story["title"].(string); strings.TrimSpace(title) == "" {
		return ErrStoryMissingTitle
	}

	stepsAny, ok := story["steps"]
	if !ok {
		return ErrStoryMissingSteps
	}
	steps, ok := stepsAny.([]any)
	if !ok || len(steps) == 0 {
		return ErrStoryMissingSteps
	}
	for _, rawStep := range steps {
		step, ok := rawStep.(map[string]any)
		if !ok {
			return ErrStoryInvalidStepType
		}
		stepType, _ := step["type"].(string)
		if _, ok := allowedStoryStepTypes[stepType]; !ok {
			return fmt.Errorf("%w: %q", ErrStoryInvalidStepType, stepType)
		}
	}

	navAny, ok := story["navigation"]
	if !ok {
		return ErrStoryInvalidNavigation
	}
	nav, ok := navAny.(map[string]any)
	if !ok {
		return ErrStoryInvalidNavigation
	}
	if progress, _ := nav["progress"].(string); progress != "visible" && progress != "hidden" {
		return ErrStoryInvalidNavigation
	}
	if enter, ok := nav["enter_to_continue"].(bool); !ok || !enter {
		return ErrStoryEnterMustBePrimary
	}

	return nil
}

