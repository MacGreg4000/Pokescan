#!/bin/sh
BACKUP_DIR="${BACKUP_DIR:-/backups}"
DATE=$(date +%Y%m%d_%H%M%S)
DB_PATH="${DATABASE_PATH:-/data/pokescan.db}"

mkdir -p "$BACKUP_DIR"
sqlite3 "$DB_PATH" ".backup ${BACKUP_DIR}/pokescan_${DATE}.db"
echo "Backup done: pokescan_${DATE}.db"
