# RLS (Row Level Security) 禁用與啟用的區別

## 🔒 什麼是 RLS？

**Row Level Security (RLS)** 是 PostgreSQL/Supabase 的一種安全機制，可以在資料庫層面控制**誰可以存取哪些資料列**。

### 簡單比喻
- **沒有 RLS**：就像一個沒有門鎖的房間，任何人都可以進出
- **有 RLS**：就像有門禁系統的房間，只有符合條件的人才能進入

---

## 📊 禁用 RLS vs 啟用 RLS

### ❌ **禁用 RLS**（DISABLE ROW LEVEL SECURITY）

```sql
ALTER TABLE USER_BEHAVIOR_EVENTS DISABLE ROW LEVEL SECURITY;
```

**行為：**
- ✅ **任何人都可以**讀取、插入、更新、刪除資料
- ✅ **不需要任何權限檢查**
- ✅ **最簡單**，適合開發和測試階段
- ⚠️ **沒有安全保護**，任何人都可以存取所有資料

**適用情況：**
- 🧪 開發/測試階段
- 🚀 快速原型開發
- 📝 內部工具（不需要多用戶權限）

---

### ✅ **啟用 RLS**（ENABLE ROW LEVEL SECURITY）

```sql
ALTER TABLE USER_BEHAVIOR_EVENTS ENABLE ROW LEVEL SECURITY;
```

**行為：**
- 🔒 **預設拒絕所有存取**（除非有 Policy）
- ✅ **必須建立 Policy 才能存取資料**
- ✅ **可以精細控制權限**（例如：用戶只能看自己的資料）
- ⚠️ **需要正確配置 Policy**，否則無法存取資料

**適用情況：**
- 🏢 生產環境
- 👥 多用戶系統
- 🔐 需要資料隔離的應用

---

## 🔍 實際範例對比

### 場景：查詢行為事件

#### **禁用 RLS 時：**
```sql
-- 任何人都可以查詢所有資料
SELECT * FROM USER_BEHAVIOR_EVENTS;
-- ✅ 成功：返回所有事件（不管 user_id 是誰）
```

#### **啟用 RLS 時（有 Policy）：**
```sql
-- 用戶 A 查詢
SELECT * FROM USER_BEHAVIOR_EVENTS;
-- ✅ 成功：只返回 user_id = A 的事件（根據 Policy）

-- 用戶 B 查詢
SELECT * FROM USER_BEHAVIOR_EVENTS;
-- ✅ 成功：只返回 user_id = B 的事件（根據 Policy）

-- 未登入用戶查詢
SELECT * FROM USER_BEHAVIOR_EVENTS;
-- ❌ 失敗：沒有符合的 Policy，拒絕存取
```

#### **啟用 RLS 時（沒有 Policy）：**
```sql
-- 任何人查詢
SELECT * FROM USER_BEHAVIOR_EVENTS;
-- ❌ 失敗：沒有 Policy，預設拒絕所有存取
```

---

## ⚠️ 你的專案的特殊情況

### 問題：你的專案使用自定義認證系統

你的專案使用：
- ✅ `localStorage` 儲存 `userId`
- ✅ 自定義的登入系統（不是 Supabase Auth）
- ❌ **不是** Supabase 標準的 `auth.users` 系統

### 當前 RLS 策略的問題

```sql
-- 這個策略可能無法正常工作
CREATE POLICY "Users can view their own events" ON USER_BEHAVIOR_EVENTS
  FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT u_id FROM USERS WHERE u_id = auth.uid()::bigint)
    -- ❌ auth.uid() 在你的系統中可能不存在！
  );
```

**原因：**
- `auth.uid()` 是 Supabase Auth 系統的函數
- 你的專案使用自定義認證，沒有 `auth.uid()`
- 所以這個 Policy **可能無法正確識別用戶**

---

## 💡 建議方案

### 方案 1：暫時禁用 RLS（推薦用於開發）

```sql
-- 在 Supabase SQL Editor 執行
ALTER TABLE USER_BEHAVIOR_EVENTS DISABLE ROW LEVEL SECURITY;
ALTER TABLE USER_SESSIONS DISABLE ROW LEVEL SECURITY;
ALTER TABLE BEHAVIOR_AGGREGATES DISABLE ROW LEVEL SECURITY;
```

**優點：**
- ✅ 簡單快速
- ✅ 適合開發和測試
- ✅ 不會有權限問題

**缺點：**
- ⚠️ 沒有資料保護
- ⚠️ 不適合生產環境

---

### 方案 2：修改 RLS 策略（適合生產環境）

由於你的專案使用自定義認證，需要修改策略：

```sql
-- 允許所有人插入（用於行為追蹤）
CREATE POLICY "Allow insert for all" ON USER_BEHAVIOR_EVENTS
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- 允許所有人查詢（因為你的應用層已經控制權限）
CREATE POLICY "Allow select for all" ON USER_BEHAVIOR_EVENTS
  FOR SELECT
  TO authenticated, anon
  USING (true);
```

**或者更安全的版本：**

```sql
-- 只允許插入，不允許查詢（查詢通過 API 控制）
CREATE POLICY "Allow insert for all" ON USER_BEHAVIOR_EVENTS
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- 只允許管理員查詢
CREATE POLICY "Admins can view all events" ON USER_BEHAVIOR_EVENTS
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM USERS 
      WHERE u_id::text = current_setting('request.jwt.claims', true)::json->>'user_id'
      AND role = 'A'
    )
  );
```

---

### 方案 3：在應用層控制權限（推薦）

**不使用 RLS，而是在 API 層控制：**

1. **禁用 RLS**（允許插入）
2. **在 API 路由中檢查權限**（`src/app/api/analytics/query/route.ts`）
3. **只返回用戶有權限查看的資料**

這樣的好處：
- ✅ 更靈活
- ✅ 不依賴 Supabase Auth
- ✅ 可以根據業務邏輯自定義權限

---

## 📋 決策建議

### 開發階段
```sql
-- 禁用 RLS，專注於功能開發
ALTER TABLE USER_BEHAVIOR_EVENTS DISABLE ROW LEVEL SECURITY;
```

### 生產環境
1. **如果只需要追蹤（插入）**：只允許 INSERT，禁用 SELECT
2. **如果需要查詢**：在 API 層控制權限，或使用方案 2 的簡化策略

---

## 🔧 快速測試

### 測試 RLS 是否啟用

```sql
-- 查看表的 RLS 狀態
SELECT 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('user_behavior_events', 'user_sessions', 'behavior_aggregates');
```

### 測試插入是否成功

```sql
-- 嘗試插入測試資料
INSERT INTO USER_BEHAVIOR_EVENTS (
  event_type, 
  event_data
) VALUES (
  'test', 
  '{"test": true}'::jsonb
);

-- 如果成功，表示至少 INSERT 權限正常
```

---

## 📚 總結

| 特性 | 禁用 RLS | 啟用 RLS（無 Policy） | 啟用 RLS（有 Policy） |
|------|---------|---------------------|-------------------|
| **插入資料** | ✅ 允許 | ❌ 拒絕 | ✅ 根據 Policy |
| **查詢資料** | ✅ 允許 | ❌ 拒絕 | ✅ 根據 Policy |
| **安全性** | ⚠️ 低 | ✅ 高（但無法使用） | ✅ 高 |
| **複雜度** | ✅ 簡單 | ✅ 簡單 | ⚠️ 需要配置 |
| **適合階段** | 開發/測試 | 不適用 | 生產環境 |

**對於你的專案：建議在開發階段禁用 RLS，在生產環境中根據需求選擇方案 2 或方案 3。**

