package story

import (
	usxd "github.com/fredporter/uDosConnect/modules/usxd-go"
)

func (s *Story) ToUSXDState() usxd.State {
	state := usxd.NewBaselineState()
	state.OpenBox.ID = "story-state"
	state.OpenBox.Type = "application/vnd.usxd.story"
	state.OpenBox.UsxdVersion = "v0.2.0-alpha.1"

	current := 0
	if s.TotalSteps() > 0 {
		current = s.Cursor() + 1
	}

	stepPayload := map[string]interface{}{
		"title":   s.Title,
		"current": current,
		"total":   s.TotalSteps(),
	}
	if step, ok := s.CurrentStep(); ok {
		stepPayload["step"] = step
	}
	stepPayload["answers"] = s.Answers()

	state.Widgets.Instances = []usxd.WidgetInstance{
		{
			ID:      "story",
			Type:    "story",
			Payload: stepPayload,
		},
	}
	state.Chassis.Focus.ActiveID = "story"
	return state
}
