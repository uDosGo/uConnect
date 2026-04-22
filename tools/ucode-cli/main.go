package main

import (
	"encoding/json"
	"fmt"
	"os"
)

func main() {
	out := map[string]string{"tool": "ucode-cli", "status": "stub"}
	enc := json.NewEncoder(os.Stdout)
	enc.SetEscapeHTML(false)
	if err := enc.Encode(out); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
