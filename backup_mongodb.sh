#!/usr/bin/env bash
set -euo pipefail

# MongoDB backup script
# Usage:
#   ./backup_mongodb.sh [output_dir]
# Default output dir: mongo-backups

DB_NAME="${MONGODB_DB_NAME:-kpop_dance_analytics}"
MONGO_URI="${MONGODB_URI:-mongodb://localhost:27017}"
OUT_ROOT="${1:-mongo-backups}"

TS="$(date +%Y%m%d_%H%M%S)"
TARGET="${OUT_ROOT}/${TS}"

mkdir -p "${OUT_ROOT}"

echo "開始備份 MongoDB..."
echo "資料庫: ${DB_NAME}"
echo "URI: ${MONGO_URI}"
echo "輸出目錄: ${TARGET}"

# mongodump will create a folder named after the DB under TARGET
mongodump --uri "${MONGO_URI}/${DB_NAME}" --out "${TARGET}"

# latest symlink
ln -sfn "${TS}" "${OUT_ROOT}/latest"

SIZE=$(du -sh "${TARGET}" | cut -f1)

echo
echo "✓ 备份成功！"
echo "備份目錄: ${TARGET}"
echo "最新連結: ${OUT_ROOT}/latest"
echo "大小: ${SIZE}"
echo
echo "還原範例:"
echo "  mongorestore --uri \"${MONGO_URI}/${DB_NAME}\" --drop \"${TARGET}/${DB_NAME}\""


