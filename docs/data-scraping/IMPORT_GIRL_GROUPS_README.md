# 導入女團資料腳本說明

## 功能

從 `girl-groups-batch1.json` 文件中提取女團資料並導入到資料庫的 `KPOP_GROUPS` 表中。

## 處理邏輯

1. **提取團體名稱**：從 JSON key（格式：`"XXX MEMBERS"`）中提取 `group_name`（去掉 `" MEMBERS"`）
2. **檢查重複**：檢查資料庫中是否已存在相同 `group_name` 的團體
3. **資料處理**：
   - 排除 `members` 欄位
   - 處理欄位長度限制（自動截斷）
   - 處理缺失的 `company` 欄位（使用 "Unknown" 作為預設值）
4. **插入資料**：將處理後的資料插入到 `KPOP_GROUPS` 表

## 使用方法

### 1. 設置環境變數

確保設置了 Supabase 連接資訊：

```bash
export NEXT_PUBLIC_SUPABASE_URL="你的_supabase_url"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="你的_supabase_anon_key"
```

或在 `.env.local` 文件中設置。

### 2. 執行腳本

```bash
cd docs/data-scraping
npx tsx import-girl-groups.ts
```

或使用 ts-node：

```bash
npx ts-node import-girl-groups.ts
```

## 資料對應

| JSON 欄位 | 資料庫欄位 | 說明 |
|----------|-----------|------|
| key (去掉 " MEMBERS") | `group_name` | 團體名稱（限制 20 字元） |
| `group_namekr` | `group_namekr` | 韓文名稱（可選，限制 20 字元） |
| `debut_date` | `debut_date` | 出道日期（必填） |
| `company` | `company` | 經紀公司（必填，無則使用 "Unknown"，限制 20 字元） |
| `group_type` | `group_type` | 團體類型（預設 'G'） |
| `member_count` | `member_count` | 成員數量（必填） |
| `logo_image` | `logo_image` | Logo 圖片 URL（可選，限制 100 字元） |
| `discription` | `discription` | 描述（可選） |
| `members` | - | **排除**（不導入） |

## 注意事項

1. **欄位長度限制**：
   - `group_name`: 20 字元（超過會自動截斷）
   - `group_namekr`: 20 字元（超過會自動截斷）
   - `company`: 20 字元（超過會自動截斷）
   - `logo_image`: 100 字元（超過會自動截斷）

2. **必填欄位**：
   - `debut_date`：如果缺失會跳過該筆資料
   - `company`：如果缺失會使用 "Unknown"

3. **重複檢查**：根據 `group_name` 檢查，已存在的團體會自動跳過

4. **執行速度**：每筆資料插入後會等待 100ms，避免請求過快

## 輸出範例

```
開始導入女團資料...

✅ 成功插入: O.A.Be (ID: 17331234567890123)
⏭️  跳過（已存在）: 2NE1
✅ 成功插入: 4X4 (ID: 17331234567890124)
...

=== 導入完成 ===
✅ 成功插入: 150 筆
⏭️  跳過（已存在）: 10 筆
❌ 錯誤: 2 筆

錯誤詳情:
  - XXX: 缺少 debut_date
  - YYY: 插入失敗
```

## 故障排除

### 錯誤：環境變數未設置
```
錯誤：請設置 SUPABASE_URL 和 SUPABASE_KEY 環境變數
```
**解決方法**：設置環境變數或使用 `.env.local` 文件

### 錯誤：表不存在
```
relation "kpop_groups" does not exist
```
**解決方法**：確認已執行 `data_structure.sql` 創建表結構

### 錯誤：欄位長度超過限制
腳本會自動截斷，但會顯示警告訊息

