package widgets

import (
	"github.com/fredporter/uDosConnect/modules/usxd-go/story"
)

type StoryWidget struct {
	Engine *story.Story
	Theme  story.Theme
}

func NewStoryWidget(title string, theme story.Theme) *StoryWidget {
	return &StoryWidget{
		Engine: story.New(title),
		Theme:  theme,
	}
}

func (w *StoryWidget) AddStep(step story.Step) *StoryWidget {
	w.Engine.AddStep(step)
	return w
}

func (w *StoryWidget) Render() (string, error) {
	return w.Engine.RenderCurrent(w.Theme)
}

func (w *StoryWidget) Enter() (bool, error) {
	return w.Engine.Enter()
}

func (w *StoryWidget) Back() error {
	return w.Engine.Back()
}

func (w *StoryWidget) Serialize() ([]byte, error) {
	return w.Engine.Serialize()
}
