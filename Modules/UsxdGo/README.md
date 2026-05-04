# @udos/usxd-go

Alpha baseline scaffold for `v0.1.0-alpha.1`.

Current scope:

- `version.go` semver prerelease constants (`v0.1.0-alpha.1`)
- Minimal USXD state model (`open_box`, `chassis`, `widgets`)
- Four widget serializers in `widgets/`
- HTTP endpoint: `/api/usxd/state`
- WebSocket endpoint: `/ws/usxd`
- Alpha 1 schema validation helpers in `schema/validate.go`

Run server:

```bash
cd modules/usxd-go
go run ./cmd/usxd-server
```

Run server + interactive story bridge (publishes live state to `/ws/usxd`):

```bash
cd modules/usxd-go
USXD_STORY_TUI=1 go run ./cmd/usxd-server
```

Browser demo page:

```bash
# then open:
http://localhost:8099/demo
http://localhost:8099/demo/story
http://localhost:8099/demo/final
```

Demo example:

```bash
cd modules/usxd-go
go run ./examples/four-components
```

Story example:

```bash
cd modules/usxd-go
go run ./examples/story-onboarding
```

Interactive TUI story (Bubble Tea):

```bash
cd modules/usxd-go
go run ./examples/story-bubbletea
```

Make targets:

```bash
cd modules/usxd-go
make fmt
make test
make run-server
make run-story
make run-story-tui
```

Repo-level scaffold gate:

```bash
cd ../../
bash scripts/check-usxd-go-scaffold.sh
```

Story lane gate:

```bash
cd ../../
bash scripts/check-usxd-story.sh
```

References:

- Spec: `docs/specs/usxd-go.md`
- Versioning policy: `docs/specs/version-mapping-a1.md`
