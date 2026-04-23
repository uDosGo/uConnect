# Widget Test Bed

This folder is a sandbox for evaluating external widget integrations before promoting patterns into the main UI.

## Widgets under test

- `EditTFWidget.vue` for `vendor/edit.tf` teletext editor embedding
- `NextChatWidget.vue` for `vendor/nextchat` embedding

## Integration modes to evaluate

- iframe embedding
- Web Component wrapper
- Direct app shell integration
- USXD skin token compatibility (`default`, `terminal`, `nord`, `amber`)

## Evaluation checklist

- Startup latency
- Keyboard interaction fidelity
- Theme compatibility
- Memory impact
- Cross-platform behavior notes
