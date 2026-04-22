package chassis

import usxd "github.com/fredporter/uDosConnect/modules/usxd-go"

func DefaultFocus() usxd.FocusState {
	return usxd.FocusState{
		ActiveID:  "login",
		FocusRing: ">",
	}
}
