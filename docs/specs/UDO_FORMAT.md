# UDO Format Specification
# Universal Document Object - Block-Based Layout Format

**Version:** 1.0
**Status:** Final
**Last Updated:** 2024-04-24

## 📋 Overview

UDO (Universal Document Object) is a JSON-based format for defining block-based document layouts. It's designed for uDos's teletext-inspired interfaces and provides a structured way to organize content blocks with styling and layout information.

## 🗂️ Format Structure

### Root Object

```json
{
  "version": "1.0",
  "type": "dashboard",
  "title": "Document Title",
  "layout": "grid-12",
  "blocks": [...],
  "theme": "teletext",
  "refreshInterval": 30
}
```

### Root Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `version` | string | Yes | Format version (currently "1.0") |
| `type` | string | Yes | Document type (e.g., "dashboard", "report", "page") |
| `title` | string | Yes | Document title |
| `layout` | string | Yes | Layout system (e.g., "grid-12", "flex", "stack") |
| `blocks` | array | Yes | Array of content blocks |
| `theme` | string | No | Theme name (default: "default") |
| `refreshInterval` | number | No | Auto-refresh interval in seconds |

## 🧱 Block Types

### Base Block Structure

```json
{
  "id": "unique-identifier",
  "type": "block-type",
  "content": {...},
  "style": {...}
}
```

### Block Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | Yes | Unique block identifier |
| `type` | string | Yes | Block type (see below) |
| `content` | object | Yes | Block content (type-specific) |
| `style` | object | No | Styling information |

### Supported Block Types

#### 1. Text Block

```json
{
  "id": "welcome",
  "type": "text",
  "content": "# Welcome\n\nThis is a text block",
  "style": {
    "span": 12,
    "theme": "primary",
    "font": "teletext"
  }
}
```

**Content:** Markdown or plain text
**Style Properties:**
- `span`: Grid columns (1-12)
- `theme`: Text theme
- `font`: Font family

#### 2. Metric Block

```json
{
  "id": "stats_items",
  "type": "metric",
  "content": {
    "value": 42,
    "label": "Vault Items",
    "icon": "📦"
  },
  "style": {
    "span": 3,
    "theme": "info"
  }
}
```

**Content Properties:**
- `value`: Numeric value
- `label`: Metric label
- `icon`: Optional emoji icon

#### 3. Activity Block

```json
{
  "id": "recent_activity",
  "type": "activity",
  "content": {
    "items": [
      {"timestamp": "2024-04-24T00:00:00Z", "message": "System started"}
    ]
  },
  "style": {
    "span": 6,
    "height": "300px"
  }
}
```

**Content Properties:**
- `items`: Array of activity items
- `timestamp`: ISO 8601 timestamp
- `message`: Activity message

#### 4. Health Block

```json
{
  "id": "system_health",
  "type": "health",
  "content": {
    "metrics": [
      {"label": "CPU Usage", "value": "45%"}
    ]
  },
  "style": {
    "span": 6,
    "height": "300px"
  }
}
```

**Content Properties:**
- `metrics`: Array of metric objects
- `label`: Metric label
- `value`: Metric value

## 🎨 Styling System

### Common Style Properties

| Property | Type | Description | Default |
|----------|------|-------------|---------|
| `span` | number | Grid columns (1-12) | 12 |
| `theme` | string | Color theme | "default" |
| `height` | string | Fixed height | "auto" |
| `font` | string | Font family | "system" |

### Theme Options

- `default`: System default theme
- `primary`: Primary accent color
- `secondary`: Secondary color
- `info`: Information blue
- `success`: Success green
- `warning`: Warning yellow
- `danger`: Danger red
- `teletext`: Teletext retro theme

## 📝 Example: Complete Dashboard

```json
{
  "version": "1.0",
  "type": "dashboard",
  "title": "System Dashboard",
  "layout": "grid-12",
  "blocks": [
    {
      "id": "header",
      "type": "text",
      "content": "# System Dashboard\n\nReal-time monitoring",
      "style": {"span": 12, "theme": "primary"}
    },
    {
      "id": "vault_stats",
      "type": "metric",
      "content": {"value": 42, "label": "Vault Items", "icon": "📦"},
      "style": {"span": 3, "theme": "info"}
    },
    {
      "id": "activity",
      "type": "activity",
      "content": {
        "items": [
          {"timestamp": "2024-04-24T00:00:00Z", "message": "System started"}
        ]
      },
      "style": {"span": 6, "height": "200px"}
    }
  ],
  "theme": "teletext",
  "refreshInterval": 30
}
```

## 🔧 Validation Rules

1. **Required Fields**: All required fields must be present
2. **Unique IDs**: Block IDs must be unique within a document
3. **Valid Types**: Block types must be from the supported list
4. **Grid Layout**: `span` values must sum to ≤ 12 per row
5. **Valid JSON**: Document must be valid JSON

## 📚 Usage in uDos

### File Extension
- `.udo` - Universal Document Object files

### Storage Location
- `~/Code/Vault/.udo/` - UDO document storage

### Integration
- Loaded by uCode1's vault-bridge
- Rendered by TUI system
- Refreshable via MCP interface

## 🎯 Future Extensions

### Planned Features
- Interactive blocks (buttons, forms)
- Data binding to real-time sources
- Template inheritance
- Internationalization support

## 📋 Changelog

### Version 1.0
- Initial release
- Basic block types
- Grid layout system
- Teletext theme support

## 🔒 Compatibility

- **uCode1**: Full support
- **uCode2**: Full support
- **uCode3**: Full support with extensions
- **uCode4**: Full support with AI enhancements

## 📝 License

MIT License - Copyright (c) 2024 uDos System