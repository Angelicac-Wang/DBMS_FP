# 詳細遷移步驟

由於你的專案較大且複雜，以下是我建議的做法：

## 選項 1: 保留 Supabase 作為主要方式（推薦）

實際上，你可以**暫時不修改程式碼**，因為：

1. Supabase 本身就是使用 PostgreSQL
2. 你可以繼續使用 Supabase 的 API 連接到你的資料庫
3. 只有在需要更精細的控制或是要完全脫離 Supabase 時才需要改

### 如果選擇這個方式：

你只需要：
- 保留現有的 Supabase 連接
- 本地 PostgreSQL 作為開發/測試環境
- 繼續使用 Supabase 作為生產環境

## 選項 2: 完全遷移到本地 PostgreSQL（適合學習）

如果你想完全學習如何使用原生 PostgreSQL，這是更好的學習機會。

### 步驟：

#### 1. 創建 API Routes（已完成）

我已經創建了以下 API routes：
- `src/app/api/songs/route.ts` - 獲取歌曲列表
- `src/app/api/songs/[songId]/idols/route.ts` - 獲取歌曲的偶像
- `src/app/api/projects/locations/route.ts` - 獲取練習地點
- `src/app/api/projects/route.ts` - 創建專案

#### 2. 需要創建更多 API Routes

你還需要為其他頁面創建 API routes：

**admin/users/page.tsx 需要：**
```typescript
// src/app/api/admin/users/route.ts
GET /api/admin/users?search=xxx&region=xxx&gender=xxx&status=xxx
```

**admin/groups/create/page.tsx 需要：**
```typescript
// src/app/api/admin/groups/route.ts
POST /api/admin/groups
```

**admin/groups/page.tsx 需要：**
```typescript
// src/app/api/admin/groups/route.ts
GET /api/admin/groups
```

**admin/projects/page.tsx 需要：**
```typescript
// src/app/api/admin/projects/route.ts
GET /api/admin/projects
```

**admin/songs/create/page.tsx 需要：**
```typescript
// src/app/api/admin/songs/route.ts
POST /api/admin/songs
```

**admin/songs/[id]/edit/page.tsx 需要：**
```typescript
// src/app/api/admin/songs/[id]/route.ts
GET /api/admin/songs/[id]
PUT /api/admin/songs/[id]
```

#### 3. 修改前端程式碼

將所有的 Supabase 查詢改成 fetch API 調用：

**Before (Supabase):**
```typescript
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('status', 'A');
```

**After (Fetch API):**
```typescript
const response = await fetch('/api/admin/users?status=A');
const data = await response.json();
```

## 選項 3: 混合模式（最實際）

1. 保留 Supabase 給簡單的查詢
2. 複雜的查詢或需要 JOIN 的，使用 API routes + PostgreSQL
3. 逐步遷移，不用一次全改

## 我的建議

基於你的情況，我建議：

### 對於這個資料庫課程專案：

**使用選項 2（完全遷移）**，理由：
1. 學習價值最高 - 你會學到完整的 PostgreSQL 操作
2. 展示技術能力 - 教授會看到你真的會用資料庫
3. 不依賴第三方服務 - 完全本地運行

### 實作建議：

1. **先測試一個頁面** - 選最簡單的（如 admin/groups/page.tsx）
2. **創建對應的 API route**
3. **修改前端調用**
4. **測試功能**
5. **確認沒問題後，再改下一個**

### 我可以幫你做什麼？

我可以：
1. ✅ 幫你創建所有需要的 API routes
2. ✅ 幫你修改所有前端檔案
3. ✅ 提供測試指南

或者：
- 你選一個最重要的頁面，我先幫你完整改好
- 你看懂模式後，自己改其他頁面
- 遇到問題再問我

## 你想要哪個選項？

請告訴我：
A. 選項 1 - 保留 Supabase（快速，但學習價值較低）
B. 選項 2 - 完全遷移（需要時間，但學習價值高）
C. 選項 3 - 混合模式（平衡）
D. 先改一個頁面看看效果

或者直接說：「幫我全部改成本地 PostgreSQL」，我就全部幫你改好！
