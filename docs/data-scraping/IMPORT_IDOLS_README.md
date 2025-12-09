# 導入偶像資料腳本說明

## 功能

從 `girl-groups-batch1.json` 文件中提取每個團體的成員（members），並導入到資料庫中。

## 處理邏輯

1. **提取團體名稱**：從 JSON key（格式：`"XXX MEMBERS"`）中提取 `group_name`
2. **查找團體 ID**：在資料庫中查找該團體對應的 `group_id`
3. **處理每個成員**：
   - 檢查 `kpop_idols` 表中是否已存在相同的偶像
   - 判斷標準：`stage_name`、`nationality`、`debut_date` 完全一致
   - 如果不存在，插入到 `kpop_idols` 表
   - 如果已存在，使用現有的 `idol_id`
4. **建立關聯**：在 `group_idol` 表中插入 `(group_id, idol_id)` 的關聯

## 使用方法

### 1. 設置環境變數

確保設置了 Supabase 連接資訊（在 `.env.local` 文件中）：

```
NEXT_PUBLIC_SUPABASE_URL=你的_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_supabase_anon_key
```

### 2. 執行腳本

```bash
cd docs/data-scraping
npx tsx import-idols-from-groups.ts
```

## 重複檢查邏輯

腳本會根據以下三個欄位判斷是否為重複：
- `stage_name`（藝名）
- `nationality`（國籍，可能為 null）
- `debut_date`（出道日期）

**只有當這三個欄位完全一致時，才會被視為重複。**

## 資料流程

```
girl-groups-batch1.json
  ↓
提取團體名稱（去掉 " MEMBERS"）
  ↓
查找資料庫中的 group_id
  ↓
遍歷 members 陣列
  ↓
檢查 kpop_idols 是否已存在
  ├─ 已存在 → 使用現有 idol_id
  └─ 不存在 → 插入新記錄，獲取新的 idol_id
  ↓
在 group_idol 表中插入 (group_id, idol_id)
```

## 輸出範例

```
開始導入偶像資料...

✅ 成功插入: Sooyeon (ID: 1)
✅ 成功建立關聯: Sooyeon -> O.A.Be
✅ 成功插入: Yuri (ID: 2)
✅ 成功建立關聯: Yuri -> O.A.Be
⏭️  跳過（已存在）: CL (ID: 5)
✅ 成功建立關聯: CL -> 2NE1
...

=== 導入完成 ===
✅ 成功插入新偶像: 150 筆
⏭️  跳過（已存在）: 20 筆
✅ 成功建立關聯: 170 筆
⏭️  關聯已存在: 0 筆
❌ 錯誤: 0 筆
```

## 注意事項

1. **必須先執行團體導入**：確保 `kpop_groups` 表中已有對應的團體資料
2. **重複檢查**：根據 `stage_name`、`nationality`、`debut_date` 判斷
3. **關聯建立**：即使偶像已存在，也會建立與團體的關聯（如果關聯不存在）
4. **執行速度**：每筆資料處理後會等待 50ms，避免請求過快

## 故障排除

### 錯誤：找不到團體

```
⚠️  跳過團體 "XXX"：資料庫中找不到該團體
```

**解決方法**：先執行 `import-girl-groups.ts` 導入團體資料

### 錯誤：插入失敗

檢查：
- 資料庫連接是否正常
- `kpop_idols` 表是否存在
- 欄位長度是否超過限制

### 錯誤：建立關聯失敗

檢查：
- `group_idol` 表是否存在
- `group_id` 和 `idol_id` 是否有效






