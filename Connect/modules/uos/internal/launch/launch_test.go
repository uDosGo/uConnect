package launch

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/fredporter/uDosConnect/modules/uos/internal/manifest"
)

func TestResolveFilePlaceholder_underWorkspace(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	if err := os.WriteFile(filepath.Join(root, "pic.png"), []byte("x"), 0o644); err != nil {
		t.Fatal(err)
	}
	extra, cref, err := resolveFilePlaceholder(root, filepath.Join(root, "pic.png"))
	if err != nil {
		t.Fatal(err)
	}
	if len(extra) != 0 {
		t.Fatalf("expected no extra binds, got %+v", extra)
	}
	if want := "/workspace/pic.png"; cref != want {
		t.Fatalf("cref: got %q want %q", cref, want)
	}
}

func TestResolveFilePlaceholder_outsideWorkspace_file(t *testing.T) {
	t.Parallel()
	wd := t.TempDir()
	out := t.TempDir()
	f := filepath.Join(out, "x.png")
	if err := os.WriteFile(f, []byte("x"), 0o644); err != nil {
		t.Fatal(err)
	}
	extra, cref, err := resolveFilePlaceholder(wd, f)
	if err != nil {
		t.Fatal(err)
	}
	if len(extra) != 1 {
		t.Fatalf("expected 1 extra bind, got %+v", extra)
	}
	if extra[0].host != f || extra[0].container != "/workspace/.uos-outside" || !extra[0].readonly {
		t.Fatalf("unexpected bind %+v", extra[0])
	}
	if cref != "/workspace/.uos-outside" {
		t.Fatalf("cref: got %q", cref)
	}
}

func TestResolveFilePlaceholder_cwdDot(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	extra, cref, err := resolveFilePlaceholder(root, root)
	if err != nil {
		t.Fatal(err)
	}
	if len(extra) != 0 {
		t.Fatalf("expected no extra binds, got %+v", extra)
	}
	if cref != "/workspace" {
		t.Fatalf("cref: got %q want /workspace", cref)
	}
}

func TestResolveFilePlaceholder_missingOutsideWorkspace(t *testing.T) {
	t.Parallel()
	wd := t.TempDir()
	missing := filepath.Join(t.TempDir(), "nope.png")
	extra, cref, err := resolveFilePlaceholder(wd, missing)
	if err != nil {
		t.Fatal(err)
	}
	if len(extra) != 1 || extra[0].host != missing {
		t.Fatalf("expected bind for missing path, got %+v", extra)
	}
	if cref != "/workspace/.uos-outside" {
		t.Fatalf("cref: got %q", cref)
	}
}

func TestSplitCommandArgv(t *testing.T) {
	t.Parallel()
	for _, tc := range []struct {
		in   string
		want []string
	}{
		{"airpaint foo bar", []string{"airpaint", "foo", "bar"}},
		{`airpaint "/tmp/a b.png"`, []string{"airpaint", "/tmp/a b.png"}},
		{"tool 'x y' z", []string{"tool", "x y", "z"}},
		{`a "b\"c"`, []string{"a", `b"c`}},
	} {
		got, err := splitCommandArgv(tc.in)
		if err != nil {
			t.Fatalf("split %q: %v", tc.in, err)
		}
		if len(got) != len(tc.want) {
			t.Fatalf("split %q: got %#v want %#v", tc.in, got, tc.want)
		}
		for i := range tc.want {
			if got[i] != tc.want[i] {
				t.Fatalf("split %q [%d]: got %q want %q", tc.in, i, got[i], tc.want[i])
			}
		}
	}
	_, err := splitCommandArgv(`echo "hi`)
	if err == nil {
		t.Fatal("expected unterminated quote error")
	}
}

func TestEffectiveContainerKind(t *testing.T) {
	t.Setenv("UOS_RUNTIME", "")
	k, err := effectiveContainerKind("docker", "")
	if err != nil || k != "docker" {
		t.Fatalf("got %q %v", k, err)
	}
	k, err = effectiveContainerKind("docker", "podman")
	if err != nil || k != "podman" {
		t.Fatalf("override: got %q %v", k, err)
	}
	t.Setenv("UOS_RUNTIME", "podman")
	k, err = effectiveContainerKind("docker", "")
	if err != nil || k != "podman" {
		t.Fatalf("env: got %q %v", k, err)
	}
}

func TestEffectiveGPUProfile(t *testing.T) {
	p, err := effectiveGPUProfile(true, "")
	if err != nil || p != "all" {
		t.Fatalf("manifest gpu true should default all, got %q %v", p, err)
	}
	p, err = effectiveGPUProfile(false, "")
	if err != nil || p != "off" {
		t.Fatalf("manifest gpu false should default off, got %q %v", p, err)
	}
	p, err = effectiveGPUProfile(true, "nvidia")
	if err != nil || p != "nvidia" {
		t.Fatalf("override nvidia failed: %q %v", p, err)
	}
	if _, err = effectiveGPUProfile(true, "bad-profile"); err == nil {
		t.Fatal("expected invalid gpu profile error")
	}
}

func TestDockerRunArgs_GPUProfiles(t *testing.T) {
	var body manifest.BodyModel
	body.Container.Image = "example/app:latest"
	body.Container.Type = "docker"
	body.Resources.CPU = 1
	body.Resources.Memory = "512m"
	body.Commands.Default = "echo ok"

	args, err := dockerRunArgs(&body, "echo ok", nil, "nvidia")
	if err != nil {
		t.Fatal(err)
	}
	joined := strings.Join(args, " ")
	if !strings.Contains(joined, "--gpus all") || !strings.Contains(joined, "NVIDIA_DRIVER_CAPABILITIES=all") {
		t.Fatalf("expected nvidia gpu args, got: %s", joined)
	}

	args, err = dockerRunArgs(&body, "echo ok", nil, "amd")
	if err != nil {
		t.Fatal(err)
	}
	joined = strings.Join(args, " ")
	if !strings.Contains(joined, "--device /dev/dri") {
		t.Fatalf("expected /dev/dri for amd profile, got: %s", joined)
	}
}
