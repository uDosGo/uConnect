package main

import (
	"fmt"

	usxd "github.com/fredporter/uDosConnect/modules/usxd-go"
	"github.com/fredporter/uDosConnect/modules/usxd-go/widgets"
)

func main() {
	state := usxd.NewBaselineState()

	login := widgets.LoginModel{Username: "demo", Remember: true, Focused: "login"}
	table := widgets.DataTableModel{
		Columns: []string{"ID", "Title"},
		Rows:    [][]string{{"1", "Hello"}, {"2", "World"}},
		Cursor:  0,
	}
	tabs := widgets.TabsModel{Tabs: []string{"Home", "Config", "Logs"}, ActiveTab: 0}
	async := widgets.AsyncLoaderModel{State: "idle", Message: "ready"}

	state.Widgets.Instances = append(state.Widgets.Instances,
		usxd.WidgetInstance{ID: "login", Type: "login", Payload: login.Serialize()},
		usxd.WidgetInstance{ID: "table", Type: "table", Payload: table.Serialize()},
		usxd.WidgetInstance{ID: "tabs", Type: "tabs", Payload: tabs.Serialize()},
		usxd.WidgetInstance{ID: "async", Type: "async", Payload: async.Serialize()},
	)

	fmt.Printf("USXD baseline ready: %s\n", usxd.Version())
	fmt.Printf("widgets: %d\n", len(state.Widgets.Instances))
}
