#!/bin/bash

# 数据库备份脚本
# 使用方法: ./backup_database.sh

# 设置数据库连接参数（可以从环境变量读取）
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-kpop_dance_db}"
DB_USER="${DB_USER:-yu}"

# 生成备份文件名（带时间戳）
BACKUP_FILE="database_backup_$(date +%Y%m%d_%H%M%S).sql"
BACKUP_FILE_LATEST="database_backup_latest.sql"

echo "开始备份数据库..."
echo "数据库: $DB_NAME"
echo "用户: $DB_USER"
echo "主机: $DB_HOST:$DB_PORT"
echo ""

# 如果设置了密码环境变量，使用它
if [ -n "$DB_PASSWORD" ]; then
    export PGPASSWORD="$DB_PASSWORD"
    pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --no-owner \
        --no-acl \
        -F p \
        -f "$BACKUP_FILE"
else
    # 如果没有设置密码，直接运行（会提示输入密码）
    pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --no-owner \
        --no-acl \
        -F p \
        -f "$BACKUP_FILE"
fi

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ 备份成功！"
    echo "备份文件: $BACKUP_FILE"
    
    # 同时创建一个 latest 链接
    cp "$BACKUP_FILE" "$BACKUP_FILE_LATEST"
    echo "已创建最新备份链接: $BACKUP_FILE_LATEST"
    
    # 显示文件大小
    ls -lh "$BACKUP_FILE" | awk '{print "文件大小: " $5}'
else
    echo ""
    echo "✗ 备份失败！"
    exit 1
fi




