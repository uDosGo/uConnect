package widgets

type DataTableModel struct {
	Columns []string
	Rows    [][]string
	Cursor  int
}

func (m DataTableModel) Serialize() map[string]interface{} {
	return map[string]interface{}{
		"type":    "table",
		"columns": m.Columns,
		"rows":    m.Rows,
		"cursor":  m.Cursor,
	}
}
