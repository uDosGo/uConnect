package schema

import (
	"encoding/json"
	"errors"
	"fmt"
)

var (
	ErrMissingOpenBox       = errors.New("missing open_box")
	ErrMissingChassis       = errors.New("missing chassis")
	ErrMissingWidgets       = errors.New("missing widgets")
	ErrForbiddenLiquid      = errors.New("field liquid is not allowed in v0.1.0-alpha.1")
	ErrForbiddenStatic      = errors.New("field static_export is not allowed in v0.1.0-alpha.1")
	ErrForbiddenSkin        = errors.New("field skin is not allowed in v0.1.0-alpha.1")
	ErrForbiddenLens        = errors.New("field lens is not allowed in v0.1.0-alpha.1")
	ErrInvalidOpenBoxType   = errors.New("open_box.type must be application/vnd.usxd.ui")
	ErrInvalidOpenBoxVer    = errors.New("open_box.usxd_version must start with v0.1.0-alpha.")
	ErrInvalidLayoutType    = errors.New("chassis.layout.type must be one of grid|card|row|column")
	ErrInvalidWidgetPayload = errors.New("widgets.instances must be an array")
)

func ValidateJSON(payload []byte) error {
	var doc map[string]any
	if err := json.Unmarshal(payload, &doc); err != nil {
		return fmt.Errorf("invalid json: %w", err)
	}
	return ValidateMap(doc)
}

func ValidateMap(doc map[string]any) error {
	if _, ok := doc["open_box"]; !ok {
		return ErrMissingOpenBox
	}
	if _, ok := doc["chassis"]; !ok {
		return ErrMissingChassis
	}
	if _, ok := doc["widgets"]; !ok {
		return ErrMissingWidgets
	}
	if _, ok := doc["liquid"]; ok {
		return ErrForbiddenLiquid
	}
	if _, ok := doc["static_export"]; ok {
		return ErrForbiddenStatic
	}
	if _, ok := doc["skin"]; ok {
		return ErrForbiddenSkin
	}
	if _, ok := doc["lens"]; ok {
		return ErrForbiddenLens
	}

	if err := validateOpenBox(doc["open_box"]); err != nil {
		return err
	}
	if err := validateChassis(doc["chassis"]); err != nil {
		return err
	}
	if err := validateWidgets(doc["widgets"]); err != nil {
		return err
	}
	return nil
}

func validateOpenBox(v any) error {
	ob, ok := v.(map[string]any)
	if !ok {
		return ErrMissingOpenBox
	}
	t, _ := ob["type"].(string)
	if t != "application/vnd.usxd.ui" {
		return ErrInvalidOpenBoxType
	}
	ver, _ := ob["usxd_version"].(string)
	if len(ver) < len("v0.1.0-alpha.") || ver[:len("v0.1.0-alpha.")] != "v0.1.0-alpha." {
		return ErrInvalidOpenBoxVer
	}
	return nil
}

func validateChassis(v any) error {
	ch, ok := v.(map[string]any)
	if !ok {
		return ErrMissingChassis
	}
	layout, ok := ch["layout"].(map[string]any)
	if !ok {
		return ErrInvalidLayoutType
	}
	lt, _ := layout["type"].(string)
	switch lt {
	case "grid", "card", "row", "column":
		return nil
	default:
		return ErrInvalidLayoutType
	}
}

func validateWidgets(v any) error {
	ws, ok := v.(map[string]any)
	if !ok {
		return ErrMissingWidgets
	}
	if _, ok := ws["instances"].([]any); !ok {
		return ErrInvalidWidgetPayload
	}
	return nil
}
