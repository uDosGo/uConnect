GO ?= go

.PHONY: test fmt run-server run-example run-story run-story-tui

test:
	$(GO) test ./...

fmt:
	gofmt -w $$(find . -name '*.go' -not -path './vendor/*')

run-server:
	$(GO) run ./cmd/usxd-server

run-example:
	$(GO) run ./examples/four-components

run-story:
	$(GO) run ./examples/story-onboarding

run-story-tui:
	$(GO) run ./examples/story-bubbletea
