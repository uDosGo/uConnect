package widgets

type TabsModel struct {
	Tabs      []string
	ActiveTab int
}

func (m TabsModel) Serialize() map[string]interface{} {
	return map[string]interface{}{
		"type":   "tabs",
		"tabs":   m.Tabs,
		"active": m.ActiveTab,
	}
}
