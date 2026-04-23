package manifest

import (
	"errors"
	"fmt"
	"os"
	"strings"

	"gopkg.in/yaml.v3"
)

type Manifest struct {
	RawPath string
	Front   FrontMatter
	Body    string
}

type FrontMatter struct {
	Version string `yaml:"version"`
	AppID   string `yaml:"app_id"`
	Name    string `yaml:"name"`
}

type BodyModel struct {
	Container struct {
		Type    string `yaml:"type"`
		Image   string `yaml:"image"`
		Runtime string `yaml:"runtime"`
	} `yaml:"container"`
	Resources struct {
		CPU    int    `yaml:"cpu"`
		Memory string `yaml:"memory"`
		GPU    bool   `yaml:"gpu"`
	} `yaml:"resources"`
	Volumes []struct {
		Host      string `yaml:"host"`
		Container string `yaml:"container"`
		Readonly  bool   `yaml:"readonly"`
	} `yaml:"mounts"`
	Commands struct {
		Default string `yaml:"default"`
		CLI     []struct {
			Pattern string `yaml:"pattern"`
			Command string `yaml:"command"`
		} `yaml:"cli"`
	} `yaml:"commands"`
}

func LoadOBX(path string) (*Manifest, *BodyModel, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return nil, nil, err
	}
	text := string(raw)
	if !strings.HasPrefix(text, "---") {
		return nil, nil, errors.New("expected OBX frontmatter starting with ---")
	}
	rest := strings.TrimPrefix(text, "---")
	parts := strings.SplitN(rest, "\n---\n", 2)
	if len(parts) != 2 {
		return nil, nil, errors.New("expected closing --- delimiter for OBX frontmatter")
	}
	var front FrontMatter
	if err := yaml.Unmarshal([]byte(parts[0]), &front); err != nil {
		return nil, nil, fmt.Errorf("frontmatter yaml: %w", err)
	}
	var body BodyModel
	if err := yaml.Unmarshal([]byte(parts[1]), &body); err != nil {
		return nil, nil, fmt.Errorf("body yaml: %w", err)
	}
	return &Manifest{RawPath: path, Front: front, Body: parts[1]}, &body, nil
}
