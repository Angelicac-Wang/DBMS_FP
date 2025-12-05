# 為什麼即使前端沒有提供 Update/Delete，仍然需要 RLS 防護？

## ⚠️ 關鍵問題：Supabase 客戶端是公開的

你的專案中，Supabase 客戶端配置是這樣的：

```typescript
// src/lib/supabase.ts
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;  // ⚠️ 公開的！
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**這意味著什麼？**

1. ✅ `NEXT_PUBLIC_` 前綴表示這個變數會被打包到前端代碼中
2. ✅ 任何人都可以在瀏覽器控制台看到這個 key
3. ✅ 任何人都可以創建 Supabase 客戶端並直接操作資料庫

---

## 🚨 實際攻擊場景

### 場景 1：瀏覽器控制台直接操作

任何用戶都可以在瀏覽器控制台（F12）執行：

```javascript
// 1. 獲取 Supabase 配置（從頁面源代碼或 Network 請求中）
const supabaseUrl = '你的_supabase_url';
const anonKey = '你的_anon_key';

// 2. 創建 Supabase 客戶端
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(supabaseUrl, anonKey);

// 3. 直接刪除所有行為事件！
await supabase
  .from('USER_BEHAVIOR_EVENTS')
  .delete()
  .neq('event_id', 0);  // 刪除所有資料

// 4. 或者修改資料
await supabase
  .from('USER_BEHAVIOR_EVENTS')
  .update({ user_id: 999999 })  // 偽造用戶 ID
  .eq('user_id', 123);

// 5. 或者插入假資料
await supabase
  .from('USER_BEHAVIOR_EVENTS')
  .insert({
    event_type: 'fake_event',
    event_data: { fake: true },
    user_id: 999999
  });
```

**如果沒有 RLS，這些操作都會成功！** ❌

---

### 場景 2：修改前端代碼

1. 用戶打開瀏覽器開發者工具
2. 找到你的前端代碼
3. 修改代碼，添加 delete 功能
4. 執行惡意操作

---

### 場景 3：使用 Postman/curl 直接調用

即使你的 API 沒有提供 delete 端點，用戶仍然可以：

```bash
# 直接調用 Supabase REST API
curl -X DELETE \
  'https://你的專案.supabase.co/rest/v1/USER_BEHAVIOR_EVENTS?event_id=eq.123' \
  -H "apikey: 你的_anon_key" \
  -H "Authorization: Bearer 你的_anon_key"
```

---

## 📊 你的代碼中實際有 Update 操作

檢查你的代碼，發現確實有 update 操作：

```typescript
// src/lib/behavior-analytics.ts
export async function endSession(sessionId: string) {
  // ...
  const { data, error } = await supabase
    .from('USER_SESSIONS')
    .update({  // ⚠️ 這裡有 update！
      ended_at: endedAt.toISOString(),
      duration_seconds: durationSeconds
    })
    .eq('session_id', sessionId)
    .select()
    .single();
}
```

雖然這個函數是內部使用的，但：
- 如果沒有 RLS，任何人都可以調用這個函數
- 或者直接操作資料庫修改任何 session

---

## ✅ 正確的防護策略

### 方案 1：使用 RLS 只允許 INSERT（推薦）

```sql
-- 允許所有人插入（用於行為追蹤）
CREATE POLICY "Allow insert for all" ON USER_BEHAVIOR_EVENTS
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- ❌ 不允許 UPDATE
-- ❌ 不允許 DELETE
-- ❌ 不允許 SELECT（通過 API 控制）
```

**優點：**
- ✅ 用戶可以插入資料（行為追蹤）
- ✅ 用戶無法修改或刪除資料
- ✅ 即使有人嘗試在控制台操作，也會被 RLS 阻止

---

### 方案 2：使用 RLS 限制 UPDATE/DELETE

```sql
-- 允許插入
CREATE POLICY "Allow insert" ON USER_BEHAVIOR_EVENTS
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- 不允許 UPDATE（沒有 Policy = 拒絕）
-- 不允許 DELETE（沒有 Policy = 拒絕）

-- 只允許查詢（可選，如果需要）
CREATE POLICY "Allow select via API" ON USER_BEHAVIOR_EVENTS
  FOR SELECT
  TO authenticated, anon
  USING (true);  -- 或更嚴格的條件
```

---

### 方案 3：完全禁用 UPDATE/DELETE（最安全）

```sql
-- 啟用 RLS
ALTER TABLE USER_BEHAVIOR_EVENTS ENABLE ROW LEVEL SECURITY;

-- 只允許 INSERT
CREATE POLICY "Only allow insert" ON USER_BEHAVIOR_EVENTS
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- 不創建 UPDATE 和 DELETE 的 Policy
-- 這樣即使有人嘗試，也會被拒絕
```

---

## 🔍 實際測試：驗證防護是否有效

### 測試 1：嘗試在控制台刪除資料

```javascript
// 在瀏覽器控制台執行
const { data, error } = await supabase
  .from('USER_BEHAVIOR_EVENTS')
  .delete()
  .neq('event_id', 0);

console.log('結果:', { data, error });
// 如果有 RLS 防護：error = "new row violates row-level security policy"
// 如果沒有 RLS：成功刪除所有資料！❌
```

### 測試 2：嘗試修改資料

```javascript
const { data, error } = await supabase
  .from('USER_BEHAVIOR_EVENTS')
  .update({ user_id: 999999 })
  .eq('user_id', 123);

console.log('結果:', { data, error });
// 如果有 RLS 防護：error = "new row violates row-level security policy"
// 如果沒有 RLS：成功修改資料！❌
```

---

## 📋 建議的 RLS 配置（針對行為追蹤表）

```sql
-- 啟用 RLS
ALTER TABLE USER_BEHAVIOR_EVENTS ENABLE ROW LEVEL SECURITY;
ALTER TABLE USER_SESSIONS ENABLE ROW LEVEL SECURITY;
ALTER TABLE BEHAVIOR_AGGREGATES ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USER_BEHAVIOR_EVENTS 表
-- ============================================

-- ✅ 允許所有人插入（行為追蹤需要）
CREATE POLICY "Allow insert for tracking" ON USER_BEHAVIOR_EVENTS
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- ❌ 不允許 UPDATE（沒有 Policy = 拒絕所有 UPDATE）
-- ❌ 不允許 DELETE（沒有 Policy = 拒絕所有 DELETE）

-- ✅ 允許查詢（如果需要，可以通過 API 進一步控制）
CREATE POLICY "Allow select for all" ON USER_BEHAVIOR_EVENTS
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- ============================================
-- USER_SESSIONS 表
-- ============================================

-- ✅ 允許插入和更新（會話管理需要）
CREATE POLICY "Allow insert for sessions" ON USER_SESSIONS
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Allow update own sessions" ON USER_SESSIONS
  FOR UPDATE
  TO authenticated, anon
  USING (true)  -- 可以進一步限制為只能更新自己的 session
  WITH CHECK (true);

-- ❌ 不允許 DELETE

-- ============================================
-- BEHAVIOR_AGGREGATES 表
-- ============================================

-- ✅ 允許插入（聚合數據更新）
CREATE POLICY "Allow insert for aggregates" ON BEHAVIOR_AGGREGATES
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- ✅ 允許更新（聚合數據需要更新）
CREATE POLICY "Allow update aggregates" ON BEHAVIOR_AGGREGATES
  FOR UPDATE
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- ❌ 不允許 DELETE
```

---

## 🎯 總結

### 為什麼需要防護？

1. ✅ **Supabase 客戶端是公開的** - 任何人都可以獲取 key
2. ✅ **前端代碼可以被修改** - 用戶可以修改或直接調用
3. ✅ **REST API 可以直接訪問** - 不需要通過你的前端代碼
4. ✅ **你的代碼中確實有 update 操作** - 需要限制權限

### 建議做法

**對於行為追蹤表（USER_BEHAVIOR_EVENTS）：**
- ✅ 允許 INSERT（追蹤需要）
- ❌ **禁止 UPDATE**（行為資料不應該被修改）
- ❌ **禁止 DELETE**（行為資料不應該被刪除）
- ✅ 允許 SELECT（可選，通過 API 進一步控制）

**對於會話表（USER_SESSIONS）：**
- ✅ 允許 INSERT 和 UPDATE（會話管理需要）
- ❌ 禁止 DELETE

這樣即使有人嘗試在控制台操作，也會被 RLS 阻止！🛡️

