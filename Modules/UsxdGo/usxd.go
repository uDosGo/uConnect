package usxd

type OpenBox struct {
	ID          string `json:"id"`
	Type        string `json:"type"`
	UsxdVersion string `json:"usxd_version"`
}

type LayoutNode struct {
	Type     string       `json:"type"`
	ID       string       `json:"id,omitempty"`
	Children []LayoutNode `json:"children,omitempty"`
}

type ChassisState struct {
	Layout LayoutNode `json:"layout"`
	Focus  FocusState `json:"focus"`
}

type FocusState struct {
	ActiveID  string `json:"active_id"`
	FocusRing string `json:"focus_ring"`
}

type WidgetInstance struct {
	ID      string                 `json:"id"`
	Type    string                 `json:"type"`
	Payload map[string]interface{} `json:"payload"`
}

type WidgetsState struct {
	Instances []WidgetInstance `json:"instances"`
}

type State struct {
	OpenBox OpenBox      `json:"open_box"`
	Chassis ChassisState `json:"chassis"`
	Widgets WidgetsState `json:"widgets"`
}

func NewBaselineState() State {
	return State{
		OpenBox: OpenBox{
			ID:          "usxd-block-v1",
			Type:        "application/vnd.usxd.ui",
			UsxdVersion: Version(),
		},
		Chassis: ChassisState{
			Layout: LayoutNode{
				Type: "column",
				ID:   "root",
				Children: []LayoutNode{
					{Type: "card", ID: "login-card"},
					{Type: "row", ID: "main-row"},
				},
			},
			Focus: FocusState{
				ActiveID:  "login",
				FocusRing: ">",
			},
		},
		Widgets: WidgetsState{
			Instances: []WidgetInstance{},
		},
	}
}
