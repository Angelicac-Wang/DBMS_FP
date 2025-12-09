#!/bin/bash

# 設定系統 Cron Job 來執行清理過期申請
# 每天凌晨 2:00 自動執行

# 獲取腳本所在目錄的絕對路徑
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"

# 獲取 Node.js 和 npm 的路徑
NODE_PATH=$(which node)
NPM_PATH=$(which npm)

# 創建 cron job 條目
CRON_JOB="0 2 * * * cd $PROJECT_DIR && $NPM_PATH run clean-expired-applications >> $PROJECT_DIR/logs/cron-clean.log 2>&1"

# 檢查是否已經存在相同的 cron job
if crontab -l 2>/dev/null | grep -q "clean-expired-applications"; then
    echo "⚠️  發現已存在的 cron job，將更新..."
    # 移除舊的 cron job
    crontab -l 2>/dev/null | grep -v "clean-expired-applications" | crontab -
fi

# 添加新的 cron job
(crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

# 創建日誌目錄
mkdir -p "$PROJECT_DIR/logs"

echo "✅ Cron job 已設定完成！"
echo ""
echo "📋 設定內容："
echo "   時間：每天凌晨 2:00"
echo "   指令：npm run clean-expired-applications"
echo "   日誌：$PROJECT_DIR/logs/cron-clean.log"
echo ""
echo "📝 查看現有的 cron jobs："
echo "   crontab -l"
echo ""
echo "🗑️  移除 cron job："
echo "   crontab -l | grep -v 'clean-expired-applications' | crontab -"

