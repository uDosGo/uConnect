package schema

import (
	"encoding/json"
	"testing"

	usxd "github.com/fredporter/uDosConnect/modules/usxd-go"
)

func TestValidateJSON_BaselineStatePasses(t *testing.T) {
	state := usxd.NewBaselineState()
	raw, err := json.Marshal(state)
	if err != nil {
		t.Fatalf("marshal baseline: %v", err)
	}
	if err := ValidateJSON(raw); err != nil {
		t.Fatalf("baseline should pass validation: %v", err)
	}
}

func TestValidateJSON_RejectsForbiddenTopLevelFields(t *testing.T) {
	tests := []string{"liquid", "static_export", "skin", "lens"}
	for _, field := range tests {
		t.Run(field, func(t *testing.T) {
			state := usxd.NewBaselineState()
			raw, err := json.Marshal(state)
			if err != nil {
				t.Fatalf("marshal baseline: %v", err)
			}
			var doc map[string]any
			if err := json.Unmarshal(raw, &doc); err != nil {
				t.Fatalf("unmarshal baseline: %v", err)
			}
			doc[field] = map[string]any{"enabled": true}
			modified, err := json.Marshal(doc)
			if err != nil {
				t.Fatalf("marshal modified: %v", err)
			}
			if err := ValidateJSON(modified); err == nil {
				t.Fatalf("expected validation error for field %q", field)
			}
		})
	}
}

func TestValidateJSON_RequiresExpectedOpenBoxType(t *testing.T) {
	state := usxd.NewBaselineState()
	raw, err := json.Marshal(state)
	if err != nil {
		t.Fatalf("marshal baseline: %v", err)
	}
	var doc map[string]any
	if err := json.Unmarshal(raw, &doc); err != nil {
		t.Fatalf("unmarshal baseline: %v", err)
	}
	doc["open_box"].(map[string]any)["type"] = "application/json"
	modified, err := json.Marshal(doc)
	if err != nil {
		t.Fatalf("marshal modified: %v", err)
	}
	if err := ValidateJSON(modified); err == nil {
		t.Fatalf("expected validation error for open_box.type")
	}
}
