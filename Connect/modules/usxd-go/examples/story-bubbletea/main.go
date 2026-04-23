package main

import (
	"log"

	"github.com/fredporter/uDosConnect/modules/usxd-go/story"
)

func main() {
	s := story.New("uDOS onboarding").
		AddStep(story.NewPresentationStep("# Welcome to uDOS\nPress Enter to continue.")).
		AddStep(story.NewSingleChoiceStep("How do you want to start?", []story.Option{
			{Value: "guided", Label: "Guided walkthrough", Default: true},
			{Value: "fast", Label: "Fast track"},
			{Value: "import", Label: "Import existing"},
		})).
		AddStep(story.NewMultiChoiceStep("Which modules do you want?", []story.Option{
			{Value: "usxd", Label: "USXD Core", Selected: true},
			{Value: "thinui", Label: "ThinUI Runtime"},
			{Value: "lens", Label: "LENS Engine"},
		})).
		AddStep(story.NewStarsStep("How familiar are you with terminal tools?", 5, 3)).
		AddStep(story.NewScaleStep("Rate CLI comfort", 1, 5, []string{"Never", "Basic", "Daily", "Expert", "Wizard"}, 3))

	if err := s.RunBubbleTea(story.ThemeTypeform); err != nil {
		log.Fatal(err)
	}
}
