# Feed/Spool Format Specification

This document specifies the feed/spool format for data exchange within the uDos ecosystem. The feed/spool format is designed to standardize data exchange across all repositories and services, ensuring consistency and interoperability.

## Overview

The feed/spool format is a standardized data exchange format used for logs, events, messages, and other types of data within the uDos ecosystem. This format ensures that data can be easily exchanged, validated, and processed across different components and services.

## Format Specification

### 1. Feed Format

The feed format is used for real-time data exchange and event streaming. It is designed to be lightweight and efficient for real-time applications.

#### 1.1 Feed Structure

```json
{
  "feed": {
    "id": "unique-feed-id",
    "type": "log|event|message",
    "timestamp": "ISO-8601-timestamp",
    "source": "source-component",
    "data": {
      "key": "value",
      ...
    },
    "metadata": {
      "key": "value",
      ...
    }
  }
}
```

#### 1.2 Feed Fields

- **id**: A unique identifier for the feed entry.
- **type**: The type of feed entry (e.g., log, event, message).
- **timestamp**: The timestamp of the feed entry in ISO-8601 format.
- **source**: The source component or service generating the feed entry.
- **data**: The main data payload of the feed entry.
- **metadata**: Additional metadata associated with the feed entry.

### 2. Spool Format

The spool format is used for batch data exchange and processing. It is designed to be robust and flexible for batch applications.

#### 2.1 Spool Structure

```json
{
  "spool": {
    "id": "unique-spool-id",
    "type": "log|event|message",
    "timestamp": "ISO-8601-timestamp",
    "source": "source-component",
    "batch": [
      {
        "id": "unique-entry-id",
        "data": {
          "key": "value",
          ...
        },
        "metadata": {
          "key": "value",
          ...
        }
      },
      ...
    ]
  }
}
```

#### 2.2 Spool Fields

- **id**: A unique identifier for the spool.
- **type**: The type of spool (e.g., log, event, message).
- **timestamp**: The timestamp of the spool in ISO-8601 format.
- **source**: The source component or service generating the spool.
- **batch**: An array of feed entries included in the spool.

## Validation Rules

### 1. Feed Validation

- **id**: Must be a unique string.
- **type**: Must be one of the predefined types (log, event, message).
- **timestamp**: Must be a valid ISO-8601 timestamp.
- **source**: Must be a non-empty string.
- **data**: Must be a valid JSON object.
- **metadata**: Must be a valid JSON object.

### 2. Spool Validation

- **id**: Must be a unique string.
- **type**: Must be one of the predefined types (log, event, message).
- **timestamp**: Must be a valid ISO-8601 timestamp.
- **source**: Must be a non-empty string.
- **batch**: Must be a non-empty array of valid feed entries.

## Examples

### 1. Feed Example

```json
{
  "feed": {
    "id": "feed-123",
    "type": "event",
    "timestamp": "2026-04-23T12:00:00Z",
    "source": "uDosGo/Connect",
    "data": {
      "event": "user_login",
      "user_id": "user-456",
      "status": "success"
    },
    "metadata": {
      "version": "1.0",
      "environment": "production"
    }
  }
}
```

### 2. Spool Example

```json
{
  "spool": {
    "id": "spool-789",
    "type": "log",
    "timestamp": "2026-04-23T12:00:00Z",
    "source": "uDosGo/Hivemind",
    "batch": [
      {
        "id": "log-101",
        "data": {
          "level": "info",
          "message": "Service started",
          "service": "hivemind"
        },
        "metadata": {
          "version": "1.0",
          "environment": "production"
        }
      },
      {
        "id": "log-102",
        "data": {
          "level": "info",
          "message": "Task delegated",
          "task": "task-123"
        },
        "metadata": {
          "version": "1.0",
          "environment": "production"
        }
      }
    ]
  }
}
```

## Implementation

### 1. MCP Gateway Integration

- **Objective**: Integrate feed/spool format support into the MCP Gateway.
- **Tasks**:
  - Extend MCP Gateway to support feed/spool format validation and processing.
  - Implement endpoints for feed/spool data exchange.
  - Ensure feed/spool data is validated and processed correctly.

### 2. Repository Integration

- **Objective**: Integrate feed/spool formats into all repositories and services.
- **Tasks**:
  - Update all repositories to use feed/spool formats for data exchange.
  - Ensure feed/spool formats are validated and processed correctly.
  - Provide examples and documentation for feed/spool format usage.

## Success Criteria

- Feed/spool formats are standardized and implemented.
- Feed/spool formats are validated and processed correctly.
- Feed/spool formats are documented and maintainable.

## License

MIT