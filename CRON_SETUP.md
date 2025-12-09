# 自動清理過期申請 - 設定指南

本文件說明如何設定自動清理過期申請的功能，每天自動檢查並清理超過 30 天未審核的申請。

## 📋 功能說明

- **清理條件**：狀態為 `'W'`（等待審核）且申請時間超過 30 天
- **更新動作**：將狀態改為 `'C'`（已取消），並設定 `reviewed_time` 為當前時間
- **執行頻率**：每天凌晨 2:00 自動執行

---

## 🚀 方案 1：使用系統 Cron Job（推薦用於伺服器）

### 優點
- ✅ 不依賴應用程式運行狀態
- ✅ 系統級別管理，穩定可靠
- ✅ 資源消耗低

### 設定步驟

#### 1. 安裝依賴（如果還沒安裝）
```bash
npm install
```

#### 2. 執行設定腳本
```bash
chmod +x setup-cron.sh
./setup-cron.sh
```

#### 3. 驗證設定
```bash
crontab -l
```

應該會看到類似這樣的輸出：
```
0 2 * * * cd /path/to/project && npm run clean-expired-applications >> /path/to/project/logs/cron-clean.log 2>&1
```

#### 4. 查看日誌
```bash
tail -f logs/cron-clean.log
```

#### 5. 手動測試（可選）
```bash
npm run clean-expired-applications
```

### 移除 Cron Job
```bash
crontab -l | grep -v 'clean-expired-applications' | crontab -
```

---

## 🚀 方案 2：使用 Node.js Cron 服務器（推薦用於開發環境）

### 優點
- ✅ 易於測試和除錯
- ✅ 可以即時看到執行結果
- ✅ 適合開發環境

### 設定步驟

#### 1. 安裝 node-cron
```bash
npm install node-cron
npm install --save-dev @types/node-cron
```

#### 2. 啟動 Cron 服務器
```bash
npx tsx scripts/cron-server.ts
```

#### 3. 使用 PM2 管理（生產環境推薦）
```bash
# 安裝 PM2
npm install -g pm2

# 啟動服務
pm2 start scripts/cron-server.ts --interpreter tsx --name cron-server

# 查看狀態
pm2 status

# 查看日誌
pm2 logs cron-server

# 停止服務
pm2 stop cron-server

# 設定開機自動啟動
pm2 startup
pm2 save
```

### 修改執行時間

編輯 `scripts/cron-server.ts`，修改 cron 表達式：

```typescript
// 每天凌晨 2:00
cron.schedule('0 0 2 * * *', async () => { ... });

// 每小時執行（測試用）
cron.schedule('0 0 * * * *', async () => { ... });

// 每 30 分鐘執行
cron.schedule('0 */30 * * * *', async () => { ... });
```

---

## 🚀 方案 3：使用 Vercel Cron Jobs（推薦用於 Vercel 部署）

### 優點
- ✅ 無需額外服務器
- ✅ Vercel 自動管理
- ✅ 適合雲端部署

### 設定步驟

#### 1. 創建 `vercel.json`
```json
{
  "crons": [
    {
      "path": "/api/admin/clean-expired-applications",
      "schedule": "0 2 * * *"
    }
  ]
}
```

#### 2. 部署到 Vercel
```bash
vercel deploy
```

Vercel 會自動在每天凌晨 2:00（UTC）調用該 API。

---

## 🚀 方案 4：使用外部定時服務（如 EasyCron、Cron-job.org）

### 優點
- ✅ 不需要自己的服務器
- ✅ 簡單易用
- ✅ 免費方案可用

### 設定步驟

1. 註冊外部定時服務帳號
2. 設定 HTTP 請求：
   - **URL**: `https://your-domain.com/api/admin/clean-expired-applications`
   - **方法**: POST
   - **頻率**: 每天 2:00
3. 儲存設定

---

## 📊 Cron 表達式說明

| 表達式 | 說明 |
|--------|------|
| `0 0 2 * * *` | 每天凌晨 2:00 |
| `0 0 * * * *` | 每小時整點 |
| `0 */30 * * * *` | 每 30 分鐘 |
| `0 0 0 * * 0` | 每週日凌晨 |
| `0 0 2 1 * *` | 每月 1 號凌晨 2:00 |

格式：`秒 分鐘 小時 日 月 星期`

---

## 🧪 測試

### 手動執行清理
```bash
npm run clean-expired-applications
```

### 查詢過期申請數量（不執行清理）
```bash
curl http://localhost:3000/api/admin/clean-expired-applications
```

### 手動觸發清理（透過 API）
```bash
curl -X POST http://localhost:3000/api/admin/clean-expired-applications
```

---

## 📝 日誌位置

- **Cron Job 日誌**: `logs/cron-clean.log`
- **應用程式日誌**: 控制台輸出
- **PM2 日誌**: `~/.pm2/logs/`

---

## ⚠️ 注意事項

1. **時區設定**：確保系統時區正確，cron 使用系統時區
2. **資料庫連接**：確保資料庫連接正常
3. **權限設定**：確保腳本有執行權限
4. **日誌監控**：定期檢查日誌，確保任務正常執行

---

## 🔧 故障排除

### 問題：Cron Job 沒有執行
1. 檢查 cron 服務是否運行：`systemctl status cron` (Linux) 或檢查 macOS 的 cron
2. 檢查日誌：`tail -f logs/cron-clean.log`
3. 檢查路徑：確保腳本路徑正確

### 問題：權限錯誤
```bash
chmod +x setup-cron.sh
chmod +x scripts/clean-expired-applications.ts
```

### 問題：找不到 node 或 npm
確保在 PATH 中，或使用完整路徑：
```bash
which node
which npm
```

