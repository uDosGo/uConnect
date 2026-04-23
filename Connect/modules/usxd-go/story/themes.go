package story

import (
	"fmt"
	"strings"
)

type Theme string

const (
	ThemeTypeform Theme = "typeform"
	ThemeMarp     Theme = "marp"
	ThemeTeletext Theme = "teletext"
	ThemeThinUI   Theme = "thinui"
)

func (s *Story) RenderCurrent(theme Theme) (string, error) {
	step, ok := s.CurrentStep()
	if !ok {
		return "", ErrNoSteps
	}
	switch theme {
	case ThemeTypeform:
		return renderTypeform(s, step), nil
	case ThemeMarp:
		return renderMarp(s, step), nil
	case ThemeTeletext:
		return renderTeletext(s, step), nil
	case ThemeThinUI:
		return renderThinUI(s, step), nil
	default:
		return renderTypeform(s, step), nil
	}
}

func renderTypeform(s *Story, step Step) string {
	cur, total, _ := s.Progress()
	var b strings.Builder
	if s.Navigation.Progress != "hidden" {
		b.WriteString(fmt.Sprintf("Story %d/%d\n", cur, total))
	}
	if step.Title != "" {
		b.WriteString(step.Title + "\n")
	}
	if step.Label != "" {
		b.WriteString(step.Label + "\n")
	}
	if step.Content != "" {
		b.WriteString(step.Content + "\n")
	}
	b.WriteString(renderControl(step))
	b.WriteString("\n" + controlHint(step))
	return b.String()
}

func renderMarp(s *Story, step Step) string {
	cur, total, _ := s.Progress()
	var b strings.Builder
	if s.Navigation.Progress != "hidden" {
		b.WriteString(fmt.Sprintf("Story %d/%d · Presentation Mode\n", cur, total))
	} else {
		b.WriteString("Presentation Mode\n")
	}
	if step.Content != "" {
		b.WriteString(step.Content + "\n")
	}
	if step.Label != "" {
		b.WriteString(step.Label + "\n")
	}
	b.WriteString(renderControl(step))
	b.WriteString("\n← Back | Enter → Continue")
	return b.String()
}

func renderTeletext(s *Story, step Step) string {
	cur, total, _ := s.Progress()
	var b strings.Builder
	b.WriteString(fmt.Sprintf("STORY %03d/%03d\n", cur, total))
	if step.Title != "" {
		b.WriteString(strings.ToUpper(step.Title) + "\n")
	}
	if step.Label != "" {
		b.WriteString(strings.ToUpper(step.Label) + "\n")
	}
	b.WriteString(strings.ToUpper(renderControl(step)))
	b.WriteString("\n" + strings.ToUpper(controlHint(step)))
	return b.String()
}

func renderThinUI(s *Story, step Step) string {
	cur, total, _ := s.Progress()
	progressHTML := ""
	if s.Navigation.Progress != "hidden" {
		progressHTML = fmt.Sprintf("<div class=\"story-progress\">Step %d of %d</div>", cur, total)
	}
	return fmt.Sprintf(
		"<div class=\"story-panel\">%s<h2>%s</h2><pre>%s</pre><div class=\"story-footer\"><button>← Back</button><button>Enter →</button></div></div>",
		progressHTML,
		escape(step.Label),
		escape(renderControl(step)),
	)
}

func renderControl(step Step) string {
	switch step.Type {
	case StepPresentation:
		if step.Content == "" {
			return ""
		}
		return step.Content
	case StepInput:
		if step.Field == "textarea" {
			return "+--------------------------+\n|                          |\n|                          |\n|                          |\n+--------------------------+"
		}
		return "[________________________]"
	case StepSingleChoice:
		lines := make([]string, 0, len(step.Options))
		for _, opt := range step.Options {
			prefix := "( )"
			if opt.Selected || opt.Default {
				prefix = "(*)"
			}
			lines = append(lines, fmt.Sprintf("%s %s", prefix, opt.Label))
		}
		return strings.Join(lines, "\n")
	case StepMultiChoice:
		lines := make([]string, 0, len(step.Options))
		for _, opt := range step.Options {
			prefix := "[ ]"
			if opt.Selected {
				prefix = "[x]"
			}
			lines = append(lines, fmt.Sprintf("%s %s", prefix, opt.Label))
		}
		return strings.Join(lines, "\n")
	case StepStars:
		stars := ""
		for i := 1; i <= step.Max; i++ {
			if i <= step.Value {
				stars += "★ "
			} else {
				stars += "☆ "
			}
		}
		return strings.TrimSpace(stars)
	case StepScale:
		parts := make([]string, 0, step.Max-step.Min+1)
		for i := step.Min; i <= step.Max; i++ {
			parts = append(parts, fmt.Sprintf("[%d]", i))
		}
		return strings.Join(parts, " ")
	default:
		return ""
	}
}

func controlHint(step Step) string {
	switch step.Type {
	case StepStars, StepScale:
		return "Hint: Use ← → then Enter"
	case StepMultiChoice:
		return "Hint: Space to toggle, Enter to continue"
	default:
		return "Press Enter to continue"
	}
}

func escape(v string) string {
	v = strings.ReplaceAll(v, "&", "&amp;")
	v = strings.ReplaceAll(v, "<", "&lt;")
	v = strings.ReplaceAll(v, ">", "&gt;")
	return v
}
