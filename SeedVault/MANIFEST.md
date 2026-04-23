# Seed Vault Manifest

## Directory Structure

- **{system}**: System configuration and state
  - {config}: System configuration files
  - {state}: System state files
  - {cache}: System cache files
  - {user}: User-specific system config

- **@workspace**: User workspaces
  - active: Active workspaces
  - archived: Archived workspaces
  - shared: Shared workspaces

- **-inbox**: Incoming data flow
  - incoming: Raw incoming data
  - processing: Data being processed
  - completed: Processed data
  - failed: Failed processing

- **-outbox**: Outgoing data flow
  - pending: Data waiting to be sent
  - sending: Data in transit
  - sent: Sent data
  - failed: Failed sending

- **--dev**: Development scratch space
  - experiments: Quick tests
  - scratch: Temporary files
  - builds: Build artifacts
  - temp: Session temporary files

- **.compost**: Soft delete
  - heap: Active compost
  - archive: Compressed compost
  - vector: Searchable compost

- **.config**: User configuration
  - git: Git configuration
  - ssh: SSH configuration
  - secrets: Encrypted secrets

- **docs**: Documentation
- **notes**: Notes
- **learning**: Learning materials
- **templates**: Templates
