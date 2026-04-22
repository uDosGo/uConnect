package story

import "encoding/json"

type StoryEnvelope struct {
	OpenBox map[string]any `json:"open_box"`
	Story   map[string]any `json:"story"`
}

func (s *Story) Serialize() ([]byte, error) {
	s.Navigation.normalize()
	envelope := StoryEnvelope{
		OpenBox: map[string]any{
			"id":           "onboarding-story",
			"type":         "application/vnd.usxd.story",
			"usxd_version": "v0.2.0-alpha.1",
		},
		Story: map[string]any{
			"title":      s.Title,
			"steps":      s.Steps,
			"navigation": s.Navigation,
		},
	}
	return json.MarshalIndent(envelope, "", "  ")
}
