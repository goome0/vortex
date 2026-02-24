#!/bin/bash
# Run all SQL migrations using mysql client (no Node.js required on VPS).
# Loads DB_* from .env in backend/ if present.
#
# Usage (from backend/ or project root):
#   ./scripts/run-migrations.sh
#   # or
#   cd backend && bash scripts/run-migrations.sh
#
# Or set env vars:
#   DB_HOST=149.56.143.161 DB_USERNAME=comp DB_PASSWORD=xxx DB_DATABASE=comp_hack ./scripts/run-migrations.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SQL_DIR="$BACKEND_DIR/sql"
ENV_FILE="$BACKEND_DIR/.env"

# Load .env if exists
if [ -f "$ENV_FILE" ]; then
  set -a
  source "$ENV_FILE"
  set +a
fi

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_USERNAME="${DB_USERNAME:-root}"
DB_PASSWORD="${DB_PASSWORD:-}"
DB_DATABASE="${DB_DATABASE:-comp_hack}"

if [ ! -d "$SQL_DIR" ]; then
  echo "sql/ directory not found: $SQL_DIR"
  exit 1
fi

FILES=($(ls -1 "$SQL_DIR"/*.sql 2>/dev/null | sort))
if [ ${#FILES[@]} -eq 0 ]; then
  echo "No .sql files in sql/"
  exit 0
fi

echo "Database: $DB_USERNAME@$DB_HOST:$DB_PORT/$DB_DATABASE"
echo "Running ${#FILES[@]} migration(s)..."
echo ""

for f in "${FILES[@]}"; do
  name=$(basename "$f")
  echo -n "  $name ... "
  if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" -p"$DB_PASSWORD" "$DB_DATABASE" < "$f" 2>/dev/null; then
    echo "OK"
  else
    echo "FAILED (may be OK if column/object already exists)"
  fi
done

echo ""
echo "Done."
