package main

import (
	"fmt"
	"os"

	"github.com/uDosGo/uCode3/sonic-home/pkg/bundle"
)

func main() {
	if len(os.Args) != 2 {
		fmt.Fprintln(os.Stderr, "usage: verify <bundle.she>")
		os.Exit(2)
	}

	path := os.Args[1]
	if err := bundle.VerifyDraftBundle(path); err != nil {
		fmt.Fprintf(os.Stderr, "verify failed: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("verify ok: %s\n", path)
}
