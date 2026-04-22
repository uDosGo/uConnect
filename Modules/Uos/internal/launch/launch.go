package launch

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/fredporter/uDosConnect/modules/uos/internal/manifest"
)

func uosHome() string {
	if v := os.Getenv("UOS_HOME"); v != "" {
		return v
	}
	home, _ := os.UserHomeDir()
	return filepath.Join(home, ".local", "share", "uos")
}

func AppsDir() string {
	return filepath.Join(uosHome(), "apps")
}

func ManifestPath(app string) string {
	return filepath.Join(AppsDir(), app+".obx")
}

func RepoFallbackManifestPath(app string) (string, error) {
	here, err := os.Getwd()
	if err != nil {
		return "", err
	}
	// When `go run` cwd is modules/uos, examples live in ./apps.
	// When cwd is repo root, examples live in modules/uos/apps.
	candidates := []string{
		filepath.Join(here, "apps", app+".obx"),
		filepath.Join(here, "modules", "uos", "apps", app+".obx"),
	}
	for _, c := range candidates {
		if st, err := os.Stat(c); err == nil && !st.IsDir() {
			return c, nil
		}
	}
	return "", fmt.Errorf("manifest not found for app %q", app)
}

// extraBind is an implicit -v for passthrough paths outside the workspace mount.
type extraBind struct {
	host      string
	container string
	readonly  bool
}

func loadManifestAndCommand(app string, passthroughArgs []string) (*manifest.BodyModel, string, string, []extraBind, error) {
	p := ManifestPath(app)
	if _, err := os.Stat(p); err != nil {
		fallback, ferr := RepoFallbackManifestPath(app)
		if ferr != nil {
			return nil, "", "", nil, ferr
		}
		p = fallback
	}
	_, body, err := manifest.LoadOBX(p)
	if err != nil {
		return nil, "", "", nil, err
	}
	wd, err := os.Getwd()
	if err != nil {
		return nil, "", "", nil, err
	}
	cmdT := pickCommand(body, passthroughArgs)
	var extra []extraBind
	var cref string
	if strings.Contains(cmdT, "{file}") && len(passthroughArgs) > 0 {
		extra, cref, err = resolveFilePlaceholder(wd, passthroughArgs[0])
		if err != nil {
			return nil, "", "", nil, err
		}
	}
	cmd := expandPlaceholders(cmdT, passthroughArgs, cref)
	return body, p, cmd, extra, nil
}

// LaunchOpts configures dry-run and execute. Runtime is docker|podman or empty to use manifest / UOS_RUNTIME.
type LaunchOpts struct {
	Runtime    string
	GPUProfile string
}

// effectiveContainerKind resolves docker vs podman: --runtime / LaunchOpts.Runtime wins, then UOS_RUNTIME, then manifest type.
func effectiveContainerKind(manifestType string, override string) (string, error) {
	v := strings.TrimSpace(override)
	if v == "" {
		v = strings.TrimSpace(os.Getenv("UOS_RUNTIME"))
	}
	if v != "" {
		raw := v
		vl := strings.ToLower(v)
		if vl == "docker" || vl == "podman" {
			return vl, nil
		}
		return "", fmt.Errorf("runtime must be docker or podman (got %q)", strings.TrimSpace(raw))
	}
	mt := strings.ToLower(strings.TrimSpace(manifestType))
	switch mt {
	case "docker", "podman":
		return mt, nil
	default:
		return "", fmt.Errorf("unknown container type %q (use docker|podman or set UOS_RUNTIME)", manifestType)
	}
}

func DryRunDocker(app string, passthroughArgs []string, opts LaunchOpts) error {
	body, p, cmd, extra, err := loadManifestAndCommand(app, passthroughArgs)
	if err != nil {
		return err
	}

	kind, err := effectiveContainerKind(body.Container.Type, opts.Runtime)
	if err != nil {
		return err
	}
	gpuProfile, err := effectiveGPUProfile(body.Resources.GPU, opts.GPUProfile)
	if err != nil {
		return err
	}

	fmt.Printf("app: %s\n", app)
	fmt.Printf("manifest: %s\n", p)
	fmt.Printf("container: %s image=%s runtime=%s\n", body.Container.Type, body.Container.Image, body.Container.Runtime)
	fmt.Printf("effective: %s\n", kind)
	fmt.Printf("gpu_profile: %s\n", gpuProfile)
	fmt.Printf("command: %s\n\n", cmd)

	var args []string
	switch kind {
	case "docker":
		args, err = dockerRunArgs(body, cmd, extra, gpuProfile)
	case "podman":
		args, err = podmanRunArgs(body, cmd, extra, gpuProfile)
	default:
		return fmt.Errorf("dry-run only supports docker|podman (got %q)", kind)
	}
	if err != nil {
		return err
	}
	fmt.Println(kind + " " + strings.Join(args, " "))
	return nil
}

// RunContainer resolves the OBX manifest and runs docker or podman with inherited stdio.
func RunContainer(app string, passthroughArgs []string, opts LaunchOpts) error {
	body, _, cmd, extra, err := loadManifestAndCommand(app, passthroughArgs)
	if err != nil {
		return err
	}
	kind, err := effectiveContainerKind(body.Container.Type, opts.Runtime)
	if err != nil {
		return err
	}
	gpuProfile, err := effectiveGPUProfile(body.Resources.GPU, opts.GPUProfile)
	if err != nil {
		return err
	}
	bin, err := exec.LookPath(kind)
	if err != nil {
		return fmt.Errorf("%s not found in PATH (install %s or add --dry-run to print the invocation)", kind, kind)
	}
	var runArgs []string
	switch kind {
	case "docker":
		runArgs, err = dockerRunArgs(body, cmd, extra, gpuProfile)
	case "podman":
		runArgs, err = podmanRunArgs(body, cmd, extra, gpuProfile)
	default:
		return fmt.Errorf("execute supports docker|podman only (got %q)", kind)
	}
	if err != nil {
		return err
	}
	c := exec.Command(bin, runArgs...)
	c.Stdin = os.Stdin
	c.Stdout = os.Stdout
	c.Stderr = os.Stderr
	if err := c.Run(); err != nil {
		return err
	}
	return nil
}

// effectiveGPUProfile resolves the runtime GPU profile. Supported values:
// auto|off|all|nvidia|amd|intel.
func effectiveGPUProfile(manifestGPU bool, override string) (string, error) {
	v := strings.ToLower(strings.TrimSpace(override))
	if v == "" || v == "auto" {
		if manifestGPU {
			return "all", nil
		}
		return "off", nil
	}
	switch v {
	case "off", "all", "nvidia", "amd", "intel":
		return v, nil
	default:
		return "", fmt.Errorf("gpu profile must be one of auto|off|all|nvidia|amd|intel (got %q)", override)
	}
}

func pickCommand(body *manifest.BodyModel, passthroughArgs []string) string {
	if strings.TrimSpace(body.Commands.Default) != "" {
		return body.Commands.Default
	}
	for _, e := range body.Commands.CLI {
		if strings.Contains(e.Pattern, "{file}") && len(passthroughArgs) > 0 {
			return e.Command
		}
	}
	if len(body.Commands.CLI) > 0 {
		return body.Commands.CLI[0].Command
	}
	return ""
}

// resolveFilePlaceholder maps a host path to an in-container path for {file}.
// Paths under cwd use the manifest /workspace mount; paths outside cwd get an extra bind to /workspace/.uos-outside.
func resolveFilePlaceholder(wd, hostArg string) ([]extraBind, string, error) {
	abs, err := filepath.Abs(hostArg)
	if err != nil {
		return nil, "", err
	}
	abs = filepath.Clean(abs)
	wd = filepath.Clean(wd)

	rel, err := filepath.Rel(wd, abs)
	if err == nil && rel != ".." && !strings.HasPrefix(rel, "..") {
		if rel == "." {
			return nil, "/workspace", nil
		}
		return nil, "/workspace/" + filepath.ToSlash(rel), nil
	}

	const mnt = "/workspace/.uos-outside"
	b := extraBind{host: abs, container: mnt, readonly: true}
	st, err := os.Stat(abs)
	if err != nil {
		if os.IsNotExist(err) {
			// Dry-run often references a path not created yet; bind as a single file.
			return []extraBind{b}, mnt, nil
		}
		return nil, "", fmt.Errorf("passthrough path: %w", err)
	}
	if st.IsDir() {
		return []extraBind{b}, mnt, nil
	}
	return []extraBind{b}, mnt, nil
}

func expandPlaceholders(cmd string, passthroughArgs []string, containerFile string) string {
	wd, _ := os.Getwd()
	cmd = strings.ReplaceAll(cmd, "{cwd}", wd)
	if strings.Contains(cmd, "{file}") {
		ref := containerFile
		if ref == "" && len(passthroughArgs) > 0 {
			ref = passthroughArgs[0]
		}
		cmd = strings.ReplaceAll(cmd, "{file}", ref)
	}
	cmd = strings.ReplaceAll(cmd, "{display}", os.Getenv("DISPLAY"))
	cmd = strings.ReplaceAll(cmd, "{wayland}", os.Getenv("WAYLAND_DISPLAY"))
	cmd = strings.ReplaceAll(cmd, "{runtime_dir}", os.Getenv("XDG_RUNTIME_DIR"))
	return cmd
}

// splitCommandArgv splits a manifest command line on ASCII whitespace outside of '...' and "...".
func splitCommandArgv(s string) ([]string, error) {
	s = strings.TrimSpace(s)
	if s == "" {
		return nil, nil
	}
	var parts []string
	var cur strings.Builder
	inSingle, inDouble := false, false
	escape := false
	flush := func() {
		if cur.Len() > 0 {
			parts = append(parts, cur.String())
			cur.Reset()
		}
	}
	for _, r := range s {
		if escape {
			cur.WriteRune(r)
			escape = false
			continue
		}
		if inDouble {
			if r == '\\' {
				escape = true
				continue
			}
			if r == '"' {
				inDouble = false
				continue
			}
			cur.WriteRune(r)
			continue
		}
		if inSingle {
			if r == '\'' {
				inSingle = false
				continue
			}
			cur.WriteRune(r)
			continue
		}
		switch r {
		case ' ', '\t', '\n':
			flush()
		case '\'':
			inSingle = true
		case '"':
			inDouble = true
		default:
			cur.WriteRune(r)
		}
	}
	if inSingle || inDouble || escape {
		return nil, fmt.Errorf("unterminated quote in command")
	}
	flush()
	return parts, nil
}

func dockerRunArgs(body *manifest.BodyModel, command string, extra []extraBind, gpuProfile string) ([]string, error) {
	args := []string{"run", "--rm", "--name", sanitizeName(body)}
	if body.Resources.CPU > 0 {
		args = append(args, "--cpus", fmt.Sprintf("%d", body.Resources.CPU))
	}
	if strings.TrimSpace(body.Resources.Memory) != "" {
		args = append(args, "--memory", body.Resources.Memory)
	}
	switch gpuProfile {
	case "all":
		args = append(args, "--gpus", "all")
	case "nvidia":
		args = append(args, "--gpus", "all", "-e", "NVIDIA_DRIVER_CAPABILITIES=all")
	case "amd", "intel":
		args = append(args, "--device", "/dev/dri")
	}
	if os.Getenv("DISPLAY") != "" {
		args = append(args, "-e", "DISPLAY="+os.Getenv("DISPLAY"))
		args = append(args, "-v", "/tmp/.X11-unix:/tmp/.X11-unix")
	}
	if os.Getenv("WAYLAND_DISPLAY") != "" && os.Getenv("XDG_RUNTIME_DIR") != "" {
		args = append(args, "-e", "WAYLAND_DISPLAY="+os.Getenv("WAYLAND_DISPLAY"))
		args = append(args, "-e", "XDG_RUNTIME_DIR="+os.Getenv("XDG_RUNTIME_DIR"))
		args = append(args, "-v", os.Getenv("XDG_RUNTIME_DIR")+":"+os.Getenv("XDG_RUNTIME_DIR"))
	}
	wd, _ := os.Getwd()
	for _, m := range body.Volumes {
		ro := ""
		if m.Readonly {
			ro = ":ro"
		}
		host := expandVolumeHost(m.Host, wd)
		args = append(args, "-v", host+":"+m.Container+ro)
	}
	for _, b := range extra {
		ro := ""
		if b.readonly {
			ro = ":ro"
		}
		args = append(args, "-v", b.host+":"+b.container+ro)
	}
	parts, err := splitCommandArgv(command)
	if err != nil {
		return nil, err
	}
	args = append(args, body.Container.Image)
	args = append(args, parts...)
	return args, nil
}

func podmanRunArgs(body *manifest.BodyModel, command string, extra []extraBind, gpuProfile string) ([]string, error) {
	args, err := dockerRunArgs(body, command, extra, gpuProfile)
	if err != nil {
		return nil, err
	}
	// podman supports --replace for dev iteration; harmless for one-shot runs.
	out := []string{"run", "--rm", "--replace"}
	out = append(out, args[2:]...)
	return out, nil
}

func sanitizeName(body *manifest.BodyModel) string {
	if strings.TrimSpace(body.Container.Image) != "" {
		base := filepath.Base(strings.Split(body.Container.Image, ":")[0])
		return strings.ReplaceAll(base, "/", "-")
	}
	return "uos-app"
}

func expandHome(p string) string {
	if strings.HasPrefix(p, "~/") {
		home, _ := os.UserHomeDir()
		return filepath.Join(home, strings.TrimPrefix(p, "~/"))
	}
	return p
}

func expandVolumeHost(host string, cwd string) string {
	h := expandHome(host)
	return strings.ReplaceAll(h, "{cwd}", cwd)
}
