#!/bin/bash

# Database migration runner for uDos

echo "🗃️ Running database migrations..."

set -e  # Exit on error

# Configuration
DB_FILE="${DB_FILE:-udos.db}"
MIGRATIONS_DIR="${MIGRATIONS_DIR:-db/migrations}"

# Check if SQLite is available
if ! command -v sqlite3 &> /dev/null; then
    echo "❌ SQLite3 is required but not installed"
    exit 1
fi

# Create database file if it doesn't exist
if [ ! -f "$DB_FILE" ]; then
    echo "📁 Creating database file: $DB_FILE"
    touch "$DB_FILE"
fi

# Create migrations table if it doesn't exist
sqlite3 "$DB_FILE" <<'EOF'
CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT UNIQUE NOT NULL,
    applied_at DATETIME NOT NULL DEFAULT (datetime('now'))
);
EOF

# Get list of already applied migrations
APPLIED=$(sqlite3 "$DB_FILE" "SELECT filename FROM migrations ORDER BY applied_at ASC;" 2>/dev/null || echo "")

# Find all migration files
MIGRATION_FILES=$(find "$MIGRATIONS_DIR" -name "*.sql" | sort)

if [ -z "$MIGRATION_FILES" ]; then
    echo "✅ No migrations found in $MIGRATIONS_DIR"
    exit 0
fi

PENDING_MIGRATIONS=()

# Check which migrations need to be applied
while IFS= read -r migration; do
    if [[ ! "$APPLIED" =~ "$migration" ]]; then
        PENDING_MIGRATIONS+=("$migration")
    fi
done <<< "$MIGRATION_FILES"

if [ ${#PENDING_MIGRATIONS[@]} -eq 0 ]; then
    echo "✅ All migrations are up to date"
    exit 0
fi

echo "Found ${#PENDING_MIGRATIONS[@]} pending migration(s):"
for migration in "${PENDING_MIGRATIONS[@]}"; do
    echo "  - $(basename $migration)"
done

echo ""
echo "Applying migrations..."

# Apply pending migrations
for migration in "${PENDING_MIGRATIONS[@]}"; do
    echo "📄 Applying $(basename $migration)..."
    
    # Run migration
    sqlite3 "$DB_FILE" < "$migration"
    
    # Record migration
    sqlite3 "$DB_FILE" "INSERT INTO migrations (filename) VALUES ('$(basename $migration)');"
    
    echo "✅ $(basename $migration) applied successfully"
done

echo ""
echo "🎉 All migrations applied successfully!"
echo "   Applied: ${#PENDING_MIGRATIONS[@]} migration(s)"
echo "   Total migrations: $(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM migrations;")"

exit 0