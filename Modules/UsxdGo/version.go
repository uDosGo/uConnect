package usxd

import "fmt"

const (
	Major      = 0
	Minor      = 1
	Patch      = 0
	PreRelease = "alpha.1"
)

func Version() string {
	return fmt.Sprintf("v%d.%d.%d-%s", Major, Minor, Patch, PreRelease)
}
