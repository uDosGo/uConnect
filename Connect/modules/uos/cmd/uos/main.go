package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/fredporter/uDosConnect/modules/uos/internal/launch"
)

func main() {
	if len(os.Args) < 2 {
		printHelp()
		os.Exit(2)
	}
	switch os.Args[1] {
	case "apps":
		if len(os.Args) < 3 || os.Args[2] != "list" {
			fmt.Fprintln(os.Stderr, "usage: uos apps list")
			os.Exit(2)
		}
		if err := cmdAppsList(); err != nil {
			fmt.Fprintln(os.Stderr, err)
			os.Exit(1)
		}
	case "launch":
		if err := cmdLaunch(os.Args[2:]); err != nil {
			fmt.Fprintln(os.Stderr, err)
			os.Exit(1)
		}
	default:
		printHelp()
		os.Exit(2)
	}
}

func printHelp() {
	fmt.Print(`uos - external app launcher (scaffold)

Commands:
  uos apps list
  uos launch <app> [options] (--dry-run | --execute) [--] [args...]

Options:
  --runtime docker|podman   Override OBX container.type (default: manifest or UOS_RUNTIME)
  --gpu-profile auto|off|all|nvidia|amd|intel   Override GPU runtime mode (default: auto)

`)
}

func cmdAppsList() error {
	appsDir := launch.AppsDir()
	entries, err := os.ReadDir(appsDir)
	if err != nil {
		// repo dev fallback (go run cwd is often modules/uos)
		wd, err2 := os.Getwd()
		if err2 != nil {
			return err
		}
		fallback := filepath.Join(wd, "apps")
		entries, err = os.ReadDir(fallback)
		if err != nil {
			fallback = filepath.Join(wd, "modules", "uos", "apps")
			entries, err = os.ReadDir(fallback)
			if err != nil {
				return err
			}
		}
		appsDir = fallback
	}
	for _, e := range entries {
		if e.IsDir() {
			continue
		}
		if strings.HasSuffix(strings.ToLower(e.Name()), ".obx") {
			fmt.Println(strings.TrimSuffix(e.Name(), filepath.Ext(e.Name())))
		}
	}
	return nil
}

func cmdLaunch(args []string) error {
	if len(args) < 1 {
		return fmt.Errorf("usage: uos launch <app> [options] (--dry-run | --execute) [--] [args...]")
	}
	app := args[0]
	rest := args[1:]
	dry := false
	execute := false
	runtimeFlag := ""
	gpuProfile := ""
	var passthrough []string
	sawSep := false
	for i := 0; i < len(rest); i++ {
		a := rest[i]
		if sawSep {
			passthrough = append(passthrough, a)
			continue
		}
		if a == "--dry-run" {
			dry = true
			continue
		}
		if a == "--execute" {
			execute = true
			continue
		}
		if a == "--runtime" {
			if i+1 >= len(rest) {
				return fmt.Errorf("--runtime requires docker or podman")
			}
			runtimeFlag = strings.ToLower(strings.TrimSpace(rest[i+1]))
			if runtimeFlag != "docker" && runtimeFlag != "podman" {
				return fmt.Errorf("--runtime must be docker or podman")
			}
			i++
			continue
		}
		if a == "--gpu-profile" {
			if i+1 >= len(rest) {
				return fmt.Errorf("--gpu-profile requires auto|off|all|nvidia|amd|intel")
			}
			gpuProfile = strings.ToLower(strings.TrimSpace(rest[i+1]))
			i++
			continue
		}
		if a == "--" {
			sawSep = true
			continue
		}
		passthrough = append(passthrough, a)
	}
	if dry && execute {
		return fmt.Errorf("pass only one of --dry-run or --execute")
	}
	if !dry && !execute {
		return fmt.Errorf("choose --dry-run (print invocation) or --execute (run docker/podman)")
	}
	opts := launch.LaunchOpts{Runtime: runtimeFlag, GPUProfile: gpuProfile}
	if dry {
		return launch.DryRunDocker(app, passthrough, opts)
	}
	return launch.RunContainer(app, passthrough, opts)
}
