package story

import (
	"fmt"
	"strings"

	tea "github.com/charmbracelet/bubbletea"
	usxd "github.com/fredporter/uDosConnect/modules/usxd-go"
)

type BubbleRuntime struct {
	Story         *Story
	Theme         Theme
	OnStateChange func(usxd.State)
	choiceCursor  int
	submitted     bool
	cancelled     bool
	lastRenderErr error
}

func NewBubbleRuntime(s *Story, theme Theme) *BubbleRuntime {
	return &BubbleRuntime{
		Story: s,
		Theme: theme,
	}
}

func (r *BubbleRuntime) Init() tea.Cmd {
	return nil
}

func (r *BubbleRuntime) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch m := msg.(type) {
	case tea.KeyMsg:
		return r.handleKey(m.String())
	}
	return r, nil
}

func (r *BubbleRuntime) View() string {
	if r.lastRenderErr != nil {
		return fmt.Sprintf("render error: %v\n", r.lastRenderErr)
	}
	if r.cancelled {
		return "Story cancelled.\n"
	}
	if r.submitted {
		return "Story submitted.\nPress q to quit.\n"
	}
	v, err := r.Story.RenderCurrent(r.Theme)
	if err != nil {
		r.lastRenderErr = err
		return fmt.Sprintf("render error: %v\n", err)
	}
	hint := "\nKeys: Enter=continue, b=back, <-/-> move, space=toggle/select, q=quit\n"
	return v + hint
}

func (r *BubbleRuntime) handleKey(key string) (tea.Model, tea.Cmd) {
	switch key {
	case "q", "ctrl+c":
		return r, tea.Quit
	case "esc":
		r.cancelled = true
		return r, tea.Quit
	case "b":
		_ = r.Story.Back()
		r.choiceCursor = 0
		r.emitState()
		return r, nil
	case "enter":
		if err := r.applyStepSelection(); err != nil {
			return r, nil
		}
		submitted, err := r.Story.Enter()
		if err == ErrAtEnd {
			r.submitted = true
			r.emitState()
			return r, tea.Quit
		}
		if err != nil {
			return r, nil
		}
		if submitted {
			r.submitted = true
			r.emitState()
			return r, tea.Quit
		}
		r.choiceCursor = 0
		r.emitState()
		return r, nil
	case "left":
		r.moveLeft()
		r.emitState()
		return r, nil
	case "right":
		r.moveRight()
		r.emitState()
		return r, nil
	case " ":
		_ = r.applySpaceToggle()
		r.emitState()
		return r, nil
	default:
		return r, nil
	}
}

func (r *BubbleRuntime) moveLeft() {
	step, ok := r.Story.CurrentStep()
	if !ok {
		return
	}
	switch step.Type {
	case StepStars:
		if step.Value > 0 {
			_ = r.Story.SetStars(step.Value - 1)
		}
	case StepScale:
		if step.Value > step.Min {
			_ = r.Story.SetScale(step.Value - 1)
		}
	case StepSingleChoice, StepMultiChoice:
		if r.choiceCursor > 0 {
			r.choiceCursor--
		}
	}
}

func (r *BubbleRuntime) moveRight() {
	step, ok := r.Story.CurrentStep()
	if !ok {
		return
	}
	switch step.Type {
	case StepStars:
		if step.Value < step.Max {
			_ = r.Story.SetStars(step.Value + 1)
		}
	case StepScale:
		if step.Value < step.Max {
			_ = r.Story.SetScale(step.Value + 1)
		}
	case StepSingleChoice, StepMultiChoice:
		if r.choiceCursor < len(step.Options)-1 {
			r.choiceCursor++
		}
	}
}

func (r *BubbleRuntime) applySpaceToggle() error {
	step, ok := r.Story.CurrentStep()
	if !ok {
		return ErrNoSteps
	}
	switch step.Type {
	case StepMultiChoice:
		return r.Story.ToggleMulti(r.choiceCursor)
	case StepSingleChoice:
		return r.Story.SelectSingle(r.choiceCursor)
	default:
		return nil
	}
}

func (r *BubbleRuntime) applyStepSelection() error {
	step, ok := r.Story.CurrentStep()
	if !ok {
		return ErrNoSteps
	}
	switch step.Type {
	case StepSingleChoice:
		return r.Story.SelectSingle(r.choiceCursor)
	case StepMultiChoice:
		// Multi-choice persists as toggled via space; enter just advances.
		return nil
	default:
		return nil
	}
}

func (s *Story) RunBubbleTea(theme Theme) error {
	return s.RunBubbleTeaWithState(theme, nil)
}

func (s *Story) RunBubbleTeaWithState(theme Theme, onStateChange func(usxd.State)) error {
	// Ensure defaults are selected for single-choice steps.
	for i := range s.Steps {
		if s.Steps[i].Type != StepSingleChoice {
			continue
		}
		found := false
		for j := range s.Steps[i].Options {
			if s.Steps[i].Options[j].Selected || s.Steps[i].Options[j].Default {
				s.Steps[i].Options[j].Selected = true
				found = true
				break
			}
		}
		if !found && len(s.Steps[i].Options) > 0 {
			s.Steps[i].Options[0].Selected = true
		}
	}

	m := NewBubbleRuntime(s, theme)
	m.OnStateChange = onStateChange
	m.emitState()
	_, err := tea.NewProgram(m).Run()
	return err
}

func (r *BubbleRuntime) SelectedHint() string {
	step, ok := r.Story.CurrentStep()
	if !ok {
		return ""
	}
	if step.Type != StepSingleChoice && step.Type != StepMultiChoice {
		return ""
	}
	if r.choiceCursor < 0 || r.choiceCursor >= len(step.Options) {
		return ""
	}
	return strings.TrimSpace(step.Options[r.choiceCursor].Label)
}

func (r *BubbleRuntime) emitState() {
	if r.OnStateChange == nil || r.Story == nil {
		return
	}
	r.OnStateChange(r.Story.ToUSXDState())
}
