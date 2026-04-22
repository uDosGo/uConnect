# Ghost Mode - Anonymous First Run

## Overview

uDosConnect implements **Ghost Mode** as the default anonymous state for all new installations. This privacy-first approach ensures no personal data is collected until the user explicitly chooses to register.

## How Ghost Mode Works

### 1. First Run (Automatic)
When you run uDosConnect for the first time:

```bash
./launcher/udos.command
```

The system automatically creates a **Ghost profile** without asking any questions:

- **User ID**: `ghost_<random>` (e.g., `ghost_a1b2c3d4e5f6`)
- **Role**: `ghost`
- **Registration**: `false`
- **Email**: `null`
- **Date of Birth**: Today's date (will fail age checks)
- **No personal data stored**

### 2. Ghost Capabilities

| Feature | Ghost Access | Registered User Access |
|---------|-------------|------------------------|
| Basic `udo` commands | ✅ Yes | ✅ Yes |
| Local vault (read-only) | ✅ Yes | ✅ Read/Write |
| Shared secrets | ❌ No | ✅ Yes (if permitted) |
| Network sync | ❌ No | ✅ Yes |
| Master node | ❌ No | ✅ Yes (admin only) |
| Age-gated features | ❌ No | ✅ Yes (if DOB passes) |

### 3. Checking Your Status

```bash
# Check if you're a ghost
udo whoami

# Or
udo ghost
```

Example output for Ghost:
```
👻 Ghost Mode Active
You are currently running as an unregistered ghost user.

User ID: ghost_a1b2c3d4e5f6
Role: ghost
Registration: Not registered
Installation Type: ghost

To complete registration, run:
  udo setup
```

## Completing Registration (Setup)

To upgrade from Ghost to a registered user:

```bash
udo setup
```

This starts the **7-step registration process**:

### Step 1: Name
- Default: Current system username
- Can be changed

### Step 2: Email
- Required for registration
- Must be valid format
- Stored encrypted in contact database

### Step 3: Date of Birth
- Required for age verification
- Must be 18+ years old
- Encrypted and stored securely
- Used for age-gated features

### Step 4: Role
Choose your role:
- **Developer**: Full access, can create content
- **Admin**: Management access
- **User**: Standard access

### Step 5: Installation Type
Choose your node type:
- **ghost**: Default anonymous
- **drone**: Automated worker
- **crypt**: Secure storage
- **tomb**: Archive node
- **knight**: Defensive node
- **sorcerer**: Transformation node
- **wizard**: Master node

### Step 6: Device Type
- **Master**: Primary device (initializes secret store)
- **Child**: Secondary device (registers with master)

### Step 7: Confirmation
Review your information and confirm.

## After Registration

Once completed:

```
✅ Registration complete!

User ID: usr_a1b2c3d4e5f6
Name: Your Name
Role: developer
Email: your@email.com

🔐 Initializing master secret store...
✅ Master secret store initialized

🎉 You are now a registered uDosConnect user!
```

### What Changes:
- **User ID**: Changes from `ghost_*` to `usr_*`
- **Role**: Changes to your selected role
- **Registration**: `true`
- **Email**: Stored (encrypted)
- **Date of Birth**: Encrypted and stored
- **Contact DB**: Entry created in master database
- **Ghost ID**: Stored as alias for reference

## Age Verification

Ghosts cannot access age-restricted features:

```bash
udo some-age-restricted-command
```

Output:
```
⚠️ Age verification required.
Please complete registration (udo setup) to verify your age.
```

After registration, your encrypted DOB is checked to verify you're 18+.

## Master Contact Database

When you register:
1. A real `user_id` is generated (`usr_*`)
2. Your ghost ID is stored as an alias
3. Email and name are stored in the contact database
4. Installation is linked to your user account

### Admin Commands

```bash
# List ghost users (admin only)
udo user list --role ghost

# Find user by email
# (Implementation in progress)
```

## Privacy Guarantees

### Ghost Mode Privacy:
- ✅ No personal data collected
- ✅ No email required
- ✅ No real name required
- ✅ No contact information stored
- ✅ Anonymous usage

### After Registration:
- 🔒 Email encrypted in database
- 🔒 Date of birth encrypted
- 🔒 Personal data protected
- 🔒 Only accessible to you (master node) or with explicit sharing

## Switching Back to Ghost

Currently, registration is permanent. Once you complete setup, you cannot revert to ghost mode. This may change in future versions.

## Technical Details

### Profile Structure (Ghost)

```json
{
  "user": {
    "name": "Ghost",
    "email": null,
    "role": "ghost",
    "user_id": "ghost_a1b2c3d4e5f6",
    "date_of_birth": "2026-04-19",
    "is_registered": false
  },
  "install": {
    "install_id": "ins_a1b2c3d4e5f6",
    "install_type": "ghost",
    "first_install_at": "2026-04-19T12:00:00.000Z",
    "timezone": "America/New_York",
    "timezone_city": "New York",
    "grid_code": null
  },
  "preferences": {
    "editor": "cursor",
    "language": "typescript"
  },
  "device": {
    "type": "master",
    "name": "your-hostname"
  },
  "version": 2
}
```

### Profile Structure (Registered)

```json
{
  "user": {
    "name": "Your Name",
    "email": "your@email.com",
    "role": "developer",
    "user_id": "usr_a1b2c3d4e5f6",
    "date_of_birth": null,
    "date_of_birth_encrypted": "base64-encoded",
    "is_registered": true
  },
  "install": {
    "install_id": "ins_a1b2c3d4e5f6",
    "install_type": "wizard",
    "first_install_at": "2026-04-19T12:00:00.000Z",
    "timezone": "America/New_York",
    "timezone_city": "New York",
    "grid_code": null
  },
  "preferences": {
    "editor": "cursor",
    "language": "typescript"
  },
  "device": {
    "type": "master",
    "name": "your-hostname"
  },
  "version": 2
}
```

### Contact Database Schema

```sql
CREATE TABLE contacts (
  user_id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  registered_at DATETIME,
  aliases TEXT,  -- JSON array of ghost IDs
  install_ids TEXT, -- JSON array of install IDs
  role TEXT
);

CREATE TABLE contact_aliases (
  alias_id TEXT PRIMARY KEY,
  user_id TEXT,
  FOREIGN KEY (user_id) REFERENCES contacts(user_id)
);
```

## Future Enhancements

- Multiple profiles per installation
- Profile switching
- Temporary ghost sessions
- Export/import profiles
- Profile backup and restore
- Multi-factor authentication for registration

## Support

If you have questions about Ghost Mode or registration:

```bash
udo help
udo ghost --help
udo setup --help
```
