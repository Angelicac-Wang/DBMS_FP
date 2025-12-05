# GROUP_IDOL 表遷移說明

## 變更內容

將 `KPOP_IDOLS` 表中的 `group_id` 欄位移除，改為使用 `GROUP_IDOL` 關聯表來建立偶像與團體之間的多對多關係。

## 為什麼需要這個變更？

1. **一個偶像可能屬於多個團體**：
   - 子團成員（例如：Apink BnN、Apink JooJiRong）
   - 限定團成員
   - 團體解散後加入新團體

2. **更符合實際情況**：
   - 偶像的職業生涯可能跨越多個團體
   - 需要記錄偶像在不同時期的團體歸屬

## 資料庫變更

### 1. 創建 GROUP_IDOL 表

```sql
CREATE TABLE GROUP_IDOL (
    group_id BIGINT NOT NULL,
    idol_id BIGINT NOT NULL,
    PRIMARY KEY (group_id, idol_id),
    FOREIGN KEY (group_id) REFERENCES KPOP_GROUPS(group_id),
    FOREIGN KEY (idol_id) REFERENCES KPOP_IDOLS(idol_id)
);
```

### 2. 遷移現有數據

執行 `migrate_group_idol.sql` 腳本：
- 將 `KPOP_IDOLS` 表中所有有 `group_id` 的記錄遷移到 `GROUP_IDOL` 表
- 刪除 `KPOP_IDOLS` 表的 `group_id` 欄位和外鍵約束

### 3. 更新表結構

`KPOP_IDOLS` 表的新結構：
```sql
CREATE TABLE KPOP_IDOLS (
    idol_id BIGINT PRIMARY KEY,
    nationality VARCHAR(20),
    stage_name VARCHAR(30) NOT NULL,
    stage_name_kr VARCHAR(30) NOT NULL,
    debut_date DATE NOT NULL
);
```

## 程式碼變更

### 已更新的檔案

1. **`src/app/group/[id]/page.tsx`**
   - 改為透過 `GROUP_IDOL` 表查詢團體成員

2. **`src/app/admin/groups/[id]/page.tsx`**
   - 改為透過 `GROUP_IDOL` 表查詢團體成員

3. **`src/app/idol/[id]/page.tsx`**
   - 改為透過 `GROUP_IDOL` 表查詢偶像所屬團體
   - 支援顯示多個團體（改為 `groups` 陣列）

## 執行步驟

### 對於新資料庫

1. 執行 `data_structure.sql`（已更新，不包含 `group_id`）
2. 執行 `create_group_idol_table.sql`（創建關聯表）

### 對於現有資料庫

1. **備份資料庫**（重要！）
2. 執行 `migrate_group_idol.sql`：
   - 創建 `GROUP_IDOL` 表
   - 遷移現有數據
   - 刪除 `KPOP_IDOLS.group_id` 欄位

## 查詢範例

### 查詢團體的所有成員

```sql
-- 舊方式（已不可用）
SELECT * FROM KPOP_IDOLS WHERE group_id = 123;

-- 新方式
SELECT i.* 
FROM KPOP_IDOLS i
JOIN GROUP_IDOL gi ON i.idol_id = gi.idol_id
WHERE gi.group_id = 123;
```

### 查詢偶像的所有團體

```sql
SELECT g.* 
FROM KPOP_GROUPS g
JOIN GROUP_IDOL gi ON g.group_id = gi.group_id
WHERE gi.idol_id = 456;
```

### 使用 Supabase 客戶端

```typescript
// 查詢團體成員
const { data: groupIdols } = await supabase
  .from('group_idol')
  .select('idol_id')
  .eq('group_id', groupId);

const idolIds = groupIdols?.map(gi => gi.idol_id) || [];
const { data: idols } = await supabase
  .from('kpop_idols')
  .select('*')
  .in('idol_id', idolIds);

// 查詢偶像所屬團體
const { data: groupIdols } = await supabase
  .from('group_idol')
  .select('group_id')
  .eq('idol_id', idolId);

const groupIds = groupIdols?.map(gi => gi.group_id) || [];
const { data: groups } = await supabase
  .from('kpop_groups')
  .select('*')
  .in('group_id', groupIds);
```

## 注意事項

1. **備份資料**：執行遷移前務必備份資料庫
2. **測試查詢**：遷移後測試所有相關查詢功能
3. **更新爬蟲腳本**：如果爬蟲腳本直接插入 `group_id`，需要改為插入 `GROUP_IDOL` 表

## 相關檔案

- `data_structure.sql` - 更新的表結構
- `migrate_group_idol.sql` - 遷移腳本
- `create_group_idol_table.sql` - 新建表腳本

