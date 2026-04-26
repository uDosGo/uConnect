# Contact Schema Specification v4.0

**Version:** 4.0.0  
**Status:** Locked (refinable)  
**File Format:** GFM Enhanced (`.md` files with `type: contact`)  
**Principle:** One canonical schema. Many platform mappings. Markdown is truth.

---

## 1. Purpose

This specification defines a **universal contact data model** for uDos-compatible systems. It:

- Works across Apple Contacts, Google Contacts, and HubSpot
- Maps common fields between platforms
- Stores contacts as markdown files with YAML frontmatter
- Enables two-way sync without data loss
- Preserves platform-specific fields in an extensible way

**Not a replacement for those platforms.** A portable, markdown-native intermediate format.

---

## 2. Core Principles

| Principle | Meaning |
|-----------|---------|
| **Markdown is truth** | The `.md` file is canonical. Platform data is derived. |
| **Universal fields first** | Common fields (name, email, phone) are top-level. |
| **Platform-specific fields** | Stored under `x_*` or `platforms` namespace. |
| **Lossless round-trip** | No data dropped when syncing to/from platforms. |
| **Obsidian-compatible** | Opens in Obsidian without plugins. |

---

## 3. Canonical Schema

### 3.1 Required Frontmatter Fields

```yaml
---
type: contact
id: string                    # UUID or stable identifier
created: YYYY-MM-DD           # ISO 8601
updated: YYYY-MM-DD           # ISO 8601
---
```

### 3.2 Core Fields (Universal)

| Field | Type | Description | Apple | Google | HubSpot |
|-------|------|-------------|-------|--------|---------|
| `first_name` | string | Given name | ✅ | ✅ | ✅ |
| `last_name` | string | Family name | ✅ | ✅ | ✅ |
| `middle_name` | string | Middle name | ✅ | ✅ | ⚠️ |
| `prefix` | string | Dr., Mr., Ms., etc. | ✅ | ✅ | ⚠️ |
| `suffix` | string | Jr., Sr., III, etc. | ✅ | ✅ | ⚠️ |
| `nickname` | string | Preferred name | ✅ | ✅ | ⚠️ |
| `company` | string | Organisation name | ✅ | ✅ | ✅ |
| `title` | string | Job title | ✅ | ✅ | ✅ |
| `department` | string | Department name | ✅ | ⚠️ | ✅ |
| `role` | string | Functional role | ⚠️ | ⚠️ | ✅ |

**Example:**
```yaml
first_name: George
last_name: Rivers
middle_name: Thomas
prefix: Mr.
company: Venue Co
title: Promotions Manager
department: Marketing
role: Lead Promoter
```

### 3.3 Contact Methods

| Field | Type | Description | Apple | Google | HubSpot |
|-------|------|-------------|-------|--------|---------|
| `emails` | array | List of email objects | ✅ | ✅ | ✅ |
| `phones` | array | List of phone objects | ✅ | ✅ | ✅ |
| `urls` | array | List of URL objects | ✅ | ✅ | ✅ |
| `addresses` | array | List of address objects | ✅ | ✅ | ✅ |
| `im` | array | Instant messaging handles | ✅ | ⚠️ | ⚠️ |
| `social` | array | Social media profiles | ⚠️ | ⚠️ | ✅ |

**Email object:**
```yaml
- value: george@venue.co
  label: work
  primary: true
```

**Phone object:**
```yaml
- value: +61 2 1234 5678
  label: work
  primary: true
```

**Address object:**
```yaml
- street: 123 George Street
  city: Sydney
  state: NSW
  postal_code: 2000
  country: Australia
  label: work
  primary: true
```

**Social object:**
```yaml
- platform: linkedin
  handle: george-rivers-venue
  url: https://linkedin.com/in/george-rivers
```

### 3.4 Dates

| Field | Type | Description | Apple | Google | HubSpot |
|-------|------|-------------|-------|--------|---------|
| `birthday` | date | Birth date (YYYY-MM-DD) | ✅ | ✅ | ✅ |
| `anniversary` | date | Wedding/partnership date | ✅ | ⚠️ | ✅ |
| `last_contact` | datetime | Last interaction timestamp | ⚠️ | ⚠️ | ✅ |
| `next_followup` | date | Scheduled next contact | ⚠️ | ⚠️ | ✅ |

### 3.5 Relationships

| Field | Type | Description | Apple | Google | HubSpot |
|-------|------|-------------|-------|--------|---------|
| `related` | array | Related contacts (by ID) | ✅ | ⚠️ | ✅ |
| `assistant` | string | Assistant contact ID | ✅ | ⚠️ | ⚠️ |
| `manager` | string | Manager contact ID | ✅ | ⚠️ | ⚠️ |
| `spouse` | string | Spouse/partner contact ID | ✅ | ⚠️ | ⚠️ |

**Example:**
```yaml
related:
  - id: cnt_02
    type: colleague
  - id: cnt_03
    type: client
manager: cnt_04
```

### 3.6 Notes & Metadata

| Field | Type | Description | Apple | Google | HubSpot |
|-------|------|-------------|-------|--------|---------|
| `notes` | string | Free text notes | ✅ | ✅ | ✅ |
| `tags` | array | Classification tags | ⚠️ | ✅ | ✅ |
| `stage` | string | Sales/lifecycle stage | ⚠️ | ⚠️ | ✅ |
| `lead_status` | string | Lead qualification | ⚠️ | ⚠️ | ✅ |
| `lifecycle_stage` | string | Subscriber, Lead, Opportunity, Customer | ⚠️ | ⚠️ | ✅ |

**Example:**
```yaml
notes: |
  Met at industry conference. Interested in launch event.
tags: [prospect, event-lead, high-value]
stage: negotiation
lifecycle_stage: opportunity
```

### 3.7 Platform-Specific Fields

Store any non-canonical fields under `platforms` to preserve round-trip data:

```yaml
platforms:
  apple:
    identifier: AB234-56789-ABCD
    custom_fields:
      MaidenName: Smith
  google:
    resource_name: people/123456789
    etag: "Rgwk4f3jsk"
    user_defined:
      - key: referral_source
        value: conference
  hubspot:
    vid: 987654321
    properties:
      hs_lead_status: OPEN
      hs_num_contacts: 3
```

---

## 4. Complete Example

```yaml
---
type: contact
id: cnt_george_rivers
created: 2026-04-10
updated: 2026-04-10
first_name: George
last_name: Rivers
middle_name: Thomas
prefix: Mr.
company: Venue Co
title: Promotions Manager
department: Marketing
role: Lead Promoter
emails:
  - value: george@venue.co
    label: work
    primary: true
  - value: george@gmail.com
    label: personal
phones:
  - value: +61 2 1234 5678
    label: work
    primary: true
  - value: +61 4 1234 5678
    label: mobile
addresses:
  - street: 123 George Street
    city: Sydney
    state: NSW
    postal_code: 2000
    country: Australia
    label: work
    primary: true
social:
  - platform: linkedin
    handle: george-rivers-venue
birthday: 1985-06-15
last_contact: 2026-04-09T14:30:00+10:00
next_followup: 2026-04-16
notes: |
  Met at Music Festival conference. Interested in sponsorship opportunities.
tags: [prospect, event-lead, high-value, music]
stage: negotiation
lifecycle_stage: opportunity
platforms:
  hubspot:
    vid: 987654321
    properties:
      hs_lead_status: OPEN
      hs_num_contacts: 3
---
```

---

## 5. Platform Mapping Tables

### 5.1 Apple Contacts → Canonical

| Apple Contacts Field | Canonical Field | Notes |
|---------------------|-----------------|-------|
| `FirstName` | `first_name` | |
| `LastName` | `last_name` | |
| `MiddleName` | `middle_name` | |
| `Prefix` | `prefix` | |
| `Suffix` | `suffix` | |
| `Nickname` | `nickname` | |
| `Organization` | `company` | |
| `JobTitle` | `title` | |
| `Department` | `department` | |
| `Email` | `emails` | Map label, value |
| `Phone` | `phones` | Map label, value |
| `URL` | `urls` | |
| `Address` | `addresses` | Map street, city, etc. |
| `Instant Message` | `im` | |
| `Birthday` | `birthday` | |
| `Anniversary` | `anniversary` | |
| `Related Names` | `related` | |
| `Note` | `notes` | |
| `Identifier` | `platforms.apple.identifier` | For sync |

### 5.2 Google Contacts → Canonical

| Google Contacts Field | Canonical Field | Notes |
|-----------------------|-----------------|-------|
| `names/givenName` | `first_name` | |
| `names/familyName` | `last_name` | |
| `names/middleName` | `middle_name` | |
| `names/honorificPrefix` | `prefix` | |
| `names/honorificSuffix` | `suffix` | |
| `names/displayName` | Derived from first/last | |
| `organizations/name` | `company` | |
| `organizations/title` | `title` | |
| `organizations/department` | `department` | |
| `emailAddresses` | `emails` | |
| `phoneNumbers` | `phones` | |
| `urls` | `urls` | |
| `addresses` | `addresses` | |
| `birthdays/date` | `birthday` | |
| `biographies` | `notes` | |
| `userDefined` | `platforms.google.user_defined` | |
| `resourceName` | `platforms.google.resource_name` | For sync |

### 5.3 HubSpot → Canonical

| HubSpot Field | Canonical Field | Notes |
|---------------|-----------------|-------|
| `firstname` | `first_name` | |
| `lastname` | `last_name` | |
| `company` | `company` | |
| `jobtitle` | `title` | |
| `email` | `emails` | Primary email |
| `phone` | `phones` | Primary phone |
| `address` | `addresses` | Street |
| `city` | `addresses.city` | |
| `state` | `addresses.state` | |
| `zip` | `addresses.postal_code` | |
| `country` | `addresses.country` | |
| `lifecyclestage` | `lifecycle_stage` | |
| `hs_lead_status` | `lead_status` | |
| `notes_last_contacted` | `last_contact` | |
| `notes_next_activity_date` | `next_followup` | |
| `hs_analytics_last_timestamp` | `platforms.hubspot.last_activity` | |
| `vid` | `platforms.hubspot.vid` | For sync |
| `properties` | `platforms.hubspot.properties` | Other fields |

---

## 6. Sync Rules

| Rule | Description |
|------|-------------|
| **Canonical wins** | The markdown file is source of truth during conflicts |
| **Platform fields preserved** | `platforms.*` fields never overwritten by canonical mapping |
| **Two-way mapping** | Changes to canonical fields write back to platforms |
| **Lossless round-trip** | No data dropped. Unknown fields go to `platforms.*` |

---

## 7. Validation Rules

A valid contact file MUST:

1. Have `type: contact` in frontmatter
2. Have a unique `id`
3. Have `created` and `updated` dates

A valid contact file SHOULD:

1. Have at least `first_name` OR `company`
2. Have at least one `email` or `phone`

A valid contact file MAY:

1. Include any additional fields under `platforms.*`
2. Include any custom fields (ignored by universal parsers)

---

## 8. Example Task Reference

```markdown
- [ ] Follow up with George #contact/cnt_george_rivers #type/followup
  ↳ due:: 2026-04-16
  ↳ notes:: Confirm sponsorship package
```

---

## 9. One-Line Summary

> **Contacts are markdown files with YAML frontmatter following a universal schema that maps to Apple Contacts, Google Contacts, and HubSpot — preserving all platform-specific data for lossless round-trip sync.**

---

## 10. References

- [Apple Contacts Schema](https://developer.apple.com/documentation/contacts)
- [Google People API](https://developers.google.com/people/api/rest/v1/people)
- [HubSpot CRM API](https://developers.hubspot.com/docs/api/crm/contacts)
- [vCard 4.0 Specification](https://datatracker.ietf.org/doc/html/rfc6350)

---

**End of Contact Schema Specification v4.0**