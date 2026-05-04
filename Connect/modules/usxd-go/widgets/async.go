package widgets

type AsyncLoaderModel struct {
	State   string
	Message string
}

func (m AsyncLoaderModel) Serialize() map[string]interface{} {
	return map[string]interface{}{
		"type":    "async",
		"state":   m.State,
		"message": m.Message,
	}
}
