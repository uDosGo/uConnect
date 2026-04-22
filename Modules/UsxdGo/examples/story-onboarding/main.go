package main

import (
	"fmt"
	"log"

	"github.com/fredporter/uDosConnect/modules/usxd-go/story"
	"github.com/fredporter/uDosConnect/modules/usxd-go/widgets"
)

func main() {
	w := widgets.NewStoryWidget("Welcome to uDOS", story.ThemeTypeform).
		AddStep(story.NewPresentationStep("# Welcome to uDOS\nLet's get started.")).
		AddStep(story.NewInputStep("Workspace name", "text", "MyAwesomeProject", true)).
		AddStep(story.NewMultiChoiceStep("Select features", []story.Option{
			{Value: "usxd", Label: "USXD Core", Selected: true},
			{Value: "monodraw", Label: "Monodraw CLI", Selected: true},
			{Value: "thinui", Label: "ThinUI Runtime"},
		})).
		AddStep(story.NewStarsStep("How familiar are you?", 5, 4)).
		AddStep(story.NewScaleStep("Rate CLI experience", 1, 5, []string{"Never", "Basic", "Daily", "Expert", "Wizard"}, 4)).
		AddStep(story.NewSingleChoiceStep("Launch dashboard?", []story.Option{
			{Value: "yes", Label: "Yes, launch now"},
			{Value: "no", Label: "No, explore later", Default: true},
		}))

	view, err := w.Render()
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(view)

	raw, err := w.Serialize()
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(string(raw))
}
