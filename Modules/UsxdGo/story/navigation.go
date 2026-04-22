package story

import "errors"

var (
	ErrNoSteps       = errors.New("story has no steps")
	ErrAtStart       = errors.New("already at first step")
	ErrAtEnd         = errors.New("already at last step")
	ErrInvalidChoice = errors.New("invalid choice")
)

func (s *Story) Next() error {
	if len(s.Steps) == 0 {
		return ErrNoSteps
	}
	if s.cursor >= len(s.Steps)-1 {
		return ErrAtEnd
	}
	s.cursor++
	return nil
}

func (s *Story) Back() error {
	if len(s.Steps) == 0 {
		return ErrNoSteps
	}
	if s.cursor == 0 {
		return ErrAtStart
	}
	s.cursor--
	return nil
}

func (s *Story) Submit() bool {
	return len(s.Steps) > 0 && s.cursor == len(s.Steps)-1
}

func (s *Story) Enter() (submitted bool, err error) {
	s.Navigation.normalize()
	if len(s.Steps) == 0 {
		return false, ErrNoSteps
	}
	if !s.Navigation.EnterToContinue {
		return false, ErrInvalidChoice
	}
	if s.Submit() {
		return true, nil
	}
	return false, s.Next()
}

func (s *Story) SetInput(text string) error {
	step, ok := s.CurrentStep()
	if !ok {
		return ErrNoSteps
	}
	if step.Type != StepInput {
		return ErrInvalidChoice
	}
	s.answers[s.cursor] = text
	return nil
}

func (s *Story) SelectSingle(index int) error {
	step, ok := s.CurrentStep()
	if !ok {
		return ErrNoSteps
	}
	if step.Type != StepSingleChoice {
		return ErrInvalidChoice
	}
	if index < 0 || index >= len(step.Options) {
		return ErrInvalidChoice
	}
	for i := range step.Options {
		step.Options[i].Selected = i == index
	}
	s.Steps[s.cursor] = step
	s.answers[s.cursor] = step.Options[index].Value
	return nil
}

func (s *Story) ToggleMulti(index int) error {
	step, ok := s.CurrentStep()
	if !ok {
		return ErrNoSteps
	}
	if step.Type != StepMultiChoice {
		return ErrInvalidChoice
	}
	if index < 0 || index >= len(step.Options) {
		return ErrInvalidChoice
	}
	step.Options[index].Selected = !step.Options[index].Selected
	s.Steps[s.cursor] = step

	selected := []string{}
	for _, opt := range step.Options {
		if opt.Selected {
			selected = append(selected, opt.Value)
		}
	}
	s.answers[s.cursor] = selected
	return nil
}

func (s *Story) SetStars(value int) error {
	step, ok := s.CurrentStep()
	if !ok {
		return ErrNoSteps
	}
	if step.Type != StepStars {
		return ErrInvalidChoice
	}
	if value < 0 || value > step.Max {
		return ErrInvalidChoice
	}
	step.Value = value
	s.Steps[s.cursor] = step
	s.answers[s.cursor] = value
	return nil
}

func (s *Story) SetScale(value int) error {
	step, ok := s.CurrentStep()
	if !ok {
		return ErrNoSteps
	}
	if step.Type != StepScale {
		return ErrInvalidChoice
	}
	if value < step.Min || value > step.Max {
		return ErrInvalidChoice
	}
	step.Value = value
	s.Steps[s.cursor] = step
	s.answers[s.cursor] = value
	return nil
}
