package serializer

import "encoding/json"

func ToJSON(v any) ([]byte, error) {
	return json.MarshalIndent(v, "", "  ")
}
