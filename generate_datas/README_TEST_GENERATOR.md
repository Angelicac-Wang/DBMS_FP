# 測試專案資料生成器使用說明

這個Python腳本可以生成10000筆測試專案資料，可以先預覽結果，確認無誤後再插入資料庫。

## 安裝依賴

```bash
pip install -r requirements_test_gen.txt
```

或手動安裝：

```bash
pip install supabase psycopg2-binary python-dotenv
```

## 配置

### 方法1：使用環境變數

創建一個 `.env` 文件（或修改現有的 `.env.local`）：

```env
NEXT_PUBLIC_SUPABASE_URL=你的_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_supabase_anon_key
```

或在終端中設置：

```bash
export NEXT_PUBLIC_SUPABASE_URL="你的_supabase_url"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="你的_supabase_anon_key"
```

### 方法2：使用PostgreSQL直連（可選）

如果需要使用PostgreSQL直連（例如當Supabase API有限制時）：

```env
DATABASE_URL=postgresql://user:password@host:port/database
```

可以在 Supabase Dashboard -> Settings -> Database -> Connection string 找到連接字串。

## 使用方法

1. **執行腳本**：

```bash
python generate_test_projects.py
```

2. **腳本會自動**：
   - 連接資料庫
   - 從資料庫讀取必要的資料（users, songs, groups等）
   - 生成10000筆測試專案資料
   - 顯示前10筆資料的預覽
   - 顯示統計資訊
   - 將資料儲存為 `test_projects.json`

3. **確認後插入資料庫**：

腳本會詢問是否要插入資料庫：
- 輸入 `y` 或 `Y`：將資料插入資料庫
- 輸入 `n` 或 `N`：只儲存JSON，不插入資料庫

## 功能特點

- ✅ **隨機生成**：每筆資料的 creator_id、song_id、地點、描述等都是隨機選擇的
- ✅ **p_id格式正確**：使用與網頁相同的方式生成（timestamp * 10000 + random）
- ✅ **預覽功能**：可以先查看生成的資料，確認無誤
- ✅ **JSON儲存**：資料會自動儲存為JSON檔案，方便查看和備份
- ✅ **批次插入**：使用批次插入提高效率
- ✅ **錯誤處理**：包含錯誤處理和進度顯示

## 生成的資料欄位

- `p_id`: 專案ID（隨機生成）
- `creator_id`: 創建者ID（從users表中隨機選擇）
- `song_id`: 歌曲ID（從提供的歌曲列表中隨機選擇）
- `porject_title`: 專案標題（格式：song_title - group_name）
- `target_cnt`: 目標人數（1到該團體member_count之間的隨機數）
- `practice_location`: 練習地點（從7個地點中隨機選擇）
- `create_at`: 創建時間（過去一年內的隨機時間）
- `update_at`: 更新時間（create_at之後0-30天內的隨機時間）
- `status`: 狀態（固定為 'A'）
- `description`: 描述（從6個描述選項中隨機選擇）

## 注意事項

1. **確認資料庫連接**：執行前請確認資料庫連接配置正確
2. **檢查現有資料**：如果資料庫中已有測試資料，可能需要先刪除（使用 `delete_test_projects.sql`）
3. **外鍵約束**：確保資料庫中有足夠的users和songs資料
4. **執行時間**：生成10000筆資料可能需要幾分鐘時間

## 刪除測試資料

如果需要刪除剛生成的測試資料，可以使用：

```sql
-- 執行 delete_test_projects.sql
```

或根據時間範圍手動刪除：

```sql
DELETE FROM project_applications WHERE p_id IN (
    SELECT p_id FROM project WHERE create_at > NOW() - INTERVAL '1 hour'
);
-- ... 其他關聯表
DELETE FROM project WHERE create_at > NOW() - INTERVAL '1 hour';
```

## 疑難排解

### 無法連接資料庫
- 檢查環境變數是否正確設置
- 確認Supabase專案是否正常運行
- 檢查網路連接

### 找不到users或songs資料
- 確認資料庫中已有這些資料
- 檢查表名是否正確（可能區分大小寫）

### 插入資料時出錯
- 檢查外鍵約束
- 確認p_id是否有重複
- 查看錯誤訊息並檢查資料格式



