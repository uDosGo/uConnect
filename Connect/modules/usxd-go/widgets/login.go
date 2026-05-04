package widgets

type LoginModel struct {
	Username string
	Password string
	Remember bool
	Focused  string
}

func (m LoginModel) Serialize() map[string]interface{} {
	return map[string]interface{}{
		"type": "form",
		"fields": []map[string]interface{}{
			{"name": "username", "value": m.Username, "focused": m.Focused == "username"},
			{"name": "password", "value": maskString(m.Password), "focused": m.Focused == "password"},
		},
		"checkbox": m.Remember,
		"button": map[string]interface{}{
			"label":   "Login",
			"focused": m.Focused == "login",
		},
	}
}

func maskString(v string) string {
	if v == "" {
		return ""
	}
	return "********"
}
