# 行為追蹤除錯指南

## 🔍 檢查步驟

### 1. 檢查瀏覽器控制台

打開瀏覽器開發者工具（F12），查看 Console 標籤：

**應該看到的日誌：**
- ✅ `Page view tracked successfully: {success: true, event_id: ...}`
- ✅ `Event tracked successfully: {success: true, event_id: ...}`

**如果有錯誤：**
- ❌ `Failed to track page view: {error: ...}`
- ❌ `Failed to track event: {error: ...}`

### 2. 檢查網路請求

在瀏覽器開發者工具的 Network 標籤：

1. 過濾 `/api/analytics/track`
2. 點擊請求查看詳細信息
3. 檢查：
   - **Status**: 應該是 `200`（成功）或 `500`（錯誤）
   - **Response**: 查看返回的 JSON

**成功響應：**
```json
{
  "success": true,
  "event_id": 123,
  "session_id": "xxx"
}
```

**錯誤響應：**
```json
{
  "error": "Failed to track event",
  "details": {
    "message": "...",
    "code": "..."
  }
}
```

### 3. 檢查 Supabase 資料庫

在 Supabase SQL Editor 執行 `test_analytics.sql`：

```sql
-- 查看最近的資料
SELECT * FROM USER_BEHAVIOR_EVENTS
ORDER BY event_timestamp DESC
LIMIT 10;
```

### 4. 檢查 RLS 策略

```sql
-- 檢查 RLS 是否啟用
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_behavior_events';

-- 檢查 Policy
SELECT * FROM pg_policies 
WHERE tablename = 'user_behavior_events';
```

### 5. 常見問題

#### 問題 1: RLS 阻止插入

**錯誤訊息：**
```
new row violates row-level security policy
```

**解決方法：**
```sql
-- 暫時禁用 RLS（開發階段）
ALTER TABLE USER_BEHAVIOR_EVENTS DISABLE ROW LEVEL SECURITY;

-- 或執行安全版本的 RLS 策略
-- behavior_analytics_rls_safe.sql
```

#### 問題 2: 表名大小寫問題

**錯誤訊息：**
```
relation "user_behavior_events" does not exist
```

**解決方法：**
- 確認表名是 `USER_BEHAVIOR_EVENTS`（大寫）
- 或修改代碼使用小寫 `user_behavior_events`

#### 問題 3: 欄位不存在

**錯誤訊息：**
```
column "xxx" does not exist
```

**解決方法：**
- 確認已執行 `behavior_analytics_schema.sql`
- 檢查表結構是否正確

### 6. 手動測試插入

在 Supabase SQL Editor 執行：

```sql
-- 測試插入
INSERT INTO USER_BEHAVIOR_EVENTS (
  event_type,
  event_data,
  session_id
) VALUES (
  'test',
  '{"test": true}'::jsonb,
  'test-session'
) RETURNING *;
```

如果這個成功，表示資料庫和 RLS 沒問題，問題可能在 API 或前端。

### 7. 檢查終端日誌

查看 Next.js 開發伺服器的終端輸出：

**應該看到：**
```
Attempting to insert event: { event_type: 'page_view', ... }
Event inserted successfully: 123
```

**如果有錯誤：**
```
Supabase insert error: { code: '42501', message: '...' }
```

### 8. 快速修復

如果確定是 RLS 問題，快速修復：

```sql
-- 在 Supabase SQL Editor 執行
ALTER TABLE USER_BEHAVIOR_EVENTS DISABLE ROW LEVEL SECURITY;
ALTER TABLE USER_SESSIONS DISABLE ROW LEVEL SECURITY;
ALTER TABLE BEHAVIOR_AGGREGATES DISABLE ROW LEVEL SECURITY;
```

然後重新測試。

