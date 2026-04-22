package story

import "fmt"

type StepType string

const (
	// Core story step kinds for v0.2.0-alpha.1.
	StepPresentation StepType = "presentation"
	StepInput        StepType = "input"
	StepSingleChoice StepType = "single_choice"
	StepMultiChoice  StepType = "multi_choice"
	StepStars        StepType = "stars"
	StepScale        StepType = "scale"
)

type PanelKind string

const (
	PanelStoryIntro       PanelKind = "story-intro"
	PanelStoryInput       PanelKind = "story-input"
	PanelStoryChoice      PanelKind = "story-choice"
	PanelStoryScale       PanelKind = "story-scale"
	PanelStoryRatingStars PanelKind = "story-rating-stars"
	PanelStorySummary     PanelKind = "story-summary"
	PanelStoryConfirm     PanelKind = "story-confirm"
	PanelStorySlide       PanelKind = "story-slide"
	PanelStorySlideInput  PanelKind = "story-slide-input"
	PanelStoryEnd         PanelKind = "story-end"
)

type Option struct {
	Value    string `json:"value"`
	Label    string `json:"label"`
	Selected bool   `json:"selected,omitempty"`
	Default  bool   `json:"default,omitempty"`
}

type Step struct {
	ID          string   `json:"id,omitempty"`
	Type        StepType `json:"type"`
	Title       string   `json:"title,omitempty"`
	Label       string   `json:"label,omitempty"`
	Content     string   `json:"content,omitempty"`
	Field       string   `json:"field,omitempty"` // text|textarea
	Placeholder string   `json:"placeholder,omitempty"`
	Required    bool     `json:"required,omitempty"`

	Options []Option `json:"options,omitempty"`

	Min    int      `json:"min,omitempty"`
	Max    int      `json:"max,omitempty"`
	Value  int      `json:"value,omitempty"`
	Labels []string `json:"labels,omitempty"`

	NextAction string `json:"next_action,omitempty"`
}

type NavigationConfig struct {
	Back            bool   `json:"back"`
	Cancel          bool   `json:"cancel"`
	Progress        string `json:"progress"` // visible|hidden
	EnterToContinue bool   `json:"enter_to_continue"`
}

func (n *NavigationConfig) normalize() {
	if n.Progress == "" {
		n.Progress = "visible"
	}
	// Story baseline requires Enter as the primary action.
	n.EnterToContinue = true
}

type Story struct {
	Title      string           `json:"title"`
	Steps      []Step           `json:"steps"`
	Navigation NavigationConfig `json:"navigation"`
	cursor     int
	answers    map[int]any
}

func New(title string) *Story {
	return &Story{
		Title: title,
		Navigation: NavigationConfig{
			Back:            true,
			Cancel:          true,
			Progress:        "visible",
			EnterToContinue: true,
		},
		Steps:   []Step{},
		answers: map[int]any{},
	}
}

func (s *Story) AddStep(step Step) *Story {
	s.Navigation.normalize()
	s.Steps = append(s.Steps, step)
	return s
}

func (s *Story) MustCurrentStep() Step {
	if len(s.Steps) == 0 {
		panic("story has no steps")
	}
	if s.cursor < 0 || s.cursor >= len(s.Steps) {
		panic(fmt.Sprintf("story cursor out of bounds: %d", s.cursor))
	}
	return s.Steps[s.cursor]
}

func (s *Story) CurrentStep() (Step, bool) {
	if len(s.Steps) == 0 || s.cursor < 0 || s.cursor >= len(s.Steps) {
		return Step{}, false
	}
	return s.Steps[s.cursor], true
}

func (s *Story) Cursor() int {
	return s.cursor
}

func (s *Story) TotalSteps() int {
	return len(s.Steps)
}

func (s *Story) Progress() (current int, total int, percent int) {
	s.Navigation.normalize()
	total = len(s.Steps)
	if total == 0 {
		return 0, 0, 0
	}
	current = s.cursor + 1
	percent = int(float64(current) / float64(total) * 100.0)
	return
}

func (s *Story) Answers() map[int]any {
	out := map[int]any{}
	for k, v := range s.answers {
		out[k] = v
	}
	return out
}

func NewPresentationStep(content string) Step {
	return Step{
		Type:       StepPresentation,
		Content:    content,
		NextAction: "enter",
	}
}

// PanelKind maps step semantics to the story surface taxonomy.
func (st Step) PanelKind() PanelKind {
	switch st.Type {
	case StepPresentation:
		if st.Field != "" || st.Label != "" || st.Placeholder != "" || len(st.Options) > 0 {
			return PanelStorySlideInput
		}
		return PanelStorySlide
	case StepInput:
		return PanelStoryInput
	case StepSingleChoice, StepMultiChoice:
		return PanelStoryChoice
	case StepScale:
		return PanelStoryScale
	case StepStars:
		return PanelStoryRatingStars
	default:
		return PanelStoryInput
	}
}

func NewInputStep(label string, field string, placeholder string, required bool) Step {
	return Step{
		Type:        StepInput,
		Label:       label,
		Field:       field,
		Placeholder: placeholder,
		Required:    required,
	}
}

func NewSingleChoiceStep(label string, options []Option) Step {
	return Step{
		Type:    StepSingleChoice,
		Label:   label,
		Options: options,
	}
}

func NewMultiChoiceStep(label string, options []Option) Step {
	return Step{
		Type:    StepMultiChoice,
		Label:   label,
		Options: options,
	}
}

func NewStarsStep(label string, max int, value int) Step {
	if max <= 0 {
		max = 5
	}
	if value < 0 {
		value = 0
	}
	if value > max {
		value = max
	}
	return Step{
		Type:  StepStars,
		Label: label,
		Max:   max,
		Value: value,
	}
}

func NewScaleStep(label string, min int, max int, labels []string, value int) Step {
	if min <= 0 {
		min = 1
	}
	if max < min {
		max = min
	}
	if value < min {
		value = min
	}
	if value > max {
		value = max
	}
	return Step{
		Type:   StepScale,
		Label:  label,
		Min:    min,
		Max:    max,
		Labels: labels,
		Value:  value,
	}
}
