# Supabase 到 PostgreSQL 遷移指南

## 已完成的工作

✅ 從 Supabase 匯出資料（252,594 筆資料，19 個表）
✅ 設置本地 PostgreSQL 資料庫（kpop_dance_db）
✅ 匯入所有資料到本地資料庫
✅ 建立新的資料庫連接模組（src/lib/db.ts）

## 資料庫連接資訊

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kpop_dance_db
DB_USER=yu
DB_PASSWORD=(如果有設定密碼)
```

## 程式碼遷移範例

### 舊的 Supabase 方式

```typescript
import { supabase } from '@/lib/supabase';

// 查詢所有 projects
const { data, error } = await supabase
  .from('project')
  .select('*')
  .eq('status', 'A');

if (error) throw error;
return data;
```

### 新的 PostgreSQL 方式

```typescript
import pool, { queryMany } from '@/lib/db';

// 方法 1: 使用輔助函數
const projects = await queryMany(
  'SELECT * FROM project WHERE status = $1',
  ['A']
);

// 方法 2: 直接使用 pool
const result = await pool.query(
  'SELECT * FROM project WHERE status = $1',
  ['A']
);
const projects = result.rows;
```

## 常見查詢轉換

### 1. 基本 SELECT

**Supabase:**
```typescript
const { data } = await supabase
  .from('kpop_songs')
  .select('*');
```

**PostgreSQL:**
```typescript
const songs = await queryMany('SELECT * FROM kpop_songs');
```

### 2. WHERE 條件

**Supabase:**
```typescript
const { data } = await supabase
  .from('project')
  .select('*')
  .eq('creator_id', userId);
```

**PostgreSQL:**
```typescript
const projects = await queryMany(
  'SELECT * FROM project WHERE creator_id = $1',
  [userId]
);
```

### 3. JOIN 查詢

**Supabase:**
```typescript
const { data } = await supabase
  .from('project')
  .select(`
    *,
    kpop_songs(title, title_kr),
    users(name)
  `);
```

**PostgreSQL:**
```typescript
const projects = await queryMany(`
  SELECT
    p.*,
    s.title,
    s.title_kr,
    u.name as creator_name
  FROM project p
  LEFT JOIN kpop_songs s ON p.song_id = s.song_id
  LEFT JOIN users u ON p.creator_id = u.u_id
`);
```

### 4. INSERT

**Supabase:**
```typescript
const { data, error } = await supabase
  .from('project')
  .insert({
    p_id: 123,
    porject_title: 'New Project',
    status: 'A'
  })
  .select();
```

**PostgreSQL:**
```typescript
const result = await pool.query(
  `INSERT INTO project (p_id, porject_title, status)
   VALUES ($1, $2, $3)
   RETURNING *`,
  [123, 'New Project', 'A']
);
const project = result.rows[0];
```

### 5. UPDATE

**Supabase:**
```typescript
const { data } = await supabase
  .from('project')
  .update({ status: 'F' })
  .eq('p_id', projectId);
```

**PostgreSQL:**
```typescript
await pool.query(
  'UPDATE project SET status = $1 WHERE p_id = $2',
  ['F', projectId]
);
```

### 6. DELETE

**Supabase:**
```typescript
const { error } = await supabase
  .from('project')
  .delete()
  .eq('p_id', projectId);
```

**PostgreSQL:**
```typescript
await pool.query(
  'DELETE FROM project WHERE p_id = $1',
  [projectId]
);
```

## 需要修改的檔案

根據之前的掃描，以下 7 個檔案使用了 Supabase：

1. [src/components/CreateProjectModal.tsx](src/components/CreateProjectModal.tsx)
2. [src/app/admin/users/page.tsx](src/app/admin/users/page.tsx)
3. [src/app/admin/groups/create/page.tsx](src/app/admin/groups/create/page.tsx)
4. [src/app/admin/groups/page.tsx](src/app/admin/groups/page.tsx)
5. [src/app/admin/projects/page.tsx](src/app/admin/projects/page.tsx)
6. [src/app/admin/songs/create/page.tsx](src/app/admin/songs/create/page.tsx)
7. [src/app/admin/songs/[id]/edit/page.tsx](src/app/admin/songs/[id]/edit/page.tsx)

## 注意事項

1. **參數化查詢**: 一定要使用 `$1, $2, $3` 參數化查詢，避免 SQL 注入
2. **錯誤處理**: 使用 try-catch 包裹資料庫查詢
3. **連接池**: 已配置連接池，不需要手動管理連接
4. **表名大小寫**: PostgreSQL 表名通常是小寫，但我們的 schema 使用大寫，查詢時需要用雙引號（或改成小寫）

## 測試

啟動開發服務器並測試：

```bash
npm run dev
```

檢查控制台是否有 "✓ PostgreSQL 連接成功" 訊息。

## 備份位置

- 匯出的 JSON 資料：`exports/supabase-export.json`
- 匯出腳本：`scripts/export-from-supabase.ts`
- 匯入腳本：`scripts/import-to-postgres.ts`

## Git 忽略

建議將以下內容加入 `.gitignore`：

```
exports/
scripts/export-*.ts
scripts/import-*.ts
.env.local
```
