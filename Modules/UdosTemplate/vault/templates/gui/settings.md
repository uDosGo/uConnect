---
template: gui
type: settings-panel
title: uDos Settings
---

## Site Settings

{{#form}}
| Field | Type | Value | Options |
|-------|------|-------|---------|
| Site Title | text | {{site_title}} | - |
| Theme | select | {{theme}} | wireframe, mono, blueprint |
| Author | text | {{author}} | - |

{{#button}}Save{{/button}} {{#button}}Cancel{{/button}}
{{/form}}
