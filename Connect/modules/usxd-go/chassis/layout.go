package chassis

import usxd "github.com/fredporter/uDosConnect/modules/usxd-go"

func BuildLayout() usxd.LayoutNode {
	return usxd.LayoutNode{
		Type: "column",
		ID:   "root",
		Children: []usxd.LayoutNode{
			{Type: "card", ID: "login-card"},
			{Type: "row", ID: "workspace-row"},
		},
	}
}
