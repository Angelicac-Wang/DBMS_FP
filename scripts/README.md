# Spotify 歌曲資料抓取腳本

這個腳本可以從 Spotify API 搜尋 K-pop 歌曲，並自動匯入到資料庫的 `KPOP_SONGS` 表中。

## 前置準備

1. **安裝依賴**
   ```bash
   yarn install
   # 或
   npm install
   ```

2. **設定環境變數**
   
   確保 `.env.local` 檔案中有以下變數：
   ```bash
   SPOTIFY_CLIENT_ID=你的_spotify_client_id
   SPOTIFY_CLIENT_SECRET=你的_spotify_client_secret
   NEXT_PUBLIC_SUPABASE_URL=你的_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_supabase_anon_key
   ```

## 使用方法

### 模式 1: 一般搜尋（搜尋歌曲）

```bash
yarn fetch-spotify "搜尋關鍵字"
# 或
npm run fetch-spotify "搜尋關鍵字"
```

**指定搜尋結果數量：**
```bash
yarn fetch-spotify "kpop twice" --limit=20
```

**範例：**
```bash
# 搜尋 TWICE 的歌曲（預設最多 50 首）
yarn fetch-spotify "kpop twice"

# 搜尋 BLACKPINK 的歌曲（限制 30 首）
yarn fetch-spotify "blackpink" --limit=30

# 搜尋 aespa 的歌曲
yarn fetch-spotify "aespa"
```

### 模式 2: 藝人查詢模式（推薦）⭐

這個模式會：
1. 先查詢藝人資訊（追蹤者、熱門度等）
2. **顯示該藝人在 Spotify 上的歌曲總數**
3. 然後抓取指定數量的歌曲（或全部）

```bash
# 查詢藝人並抓取所有歌曲
yarn fetch-spotify "TWICE" --artist

# 查詢藝人並只抓取前 30 首
yarn fetch-spotify "BLACKPINK" --artist --limit=30

# 查詢藝人並抓取前 50 首
yarn fetch-spotify "aespa" --artist --limit=50
```

**範例輸出：**
```
🎤 查詢藝人: "TWICE"

✅ 找到藝人: TWICE
   追蹤者: 12,345,678
   熱門度: 85/100
   類型: k-pop, pop

📊 查詢歌曲總數...
✅ 該藝人在 Spotify 上共有 156 首歌曲

📥 將抓取全部 156 首歌曲（這可能需要一些時間）...
✅ 成功取得 156 首歌曲
```

**為什麼推薦使用藝人模式？**
- ✅ 可以知道該藝人總共有多少首歌
- ✅ 可以選擇抓取全部或指定數量
- ✅ 使用藝人 ID 搜尋，結果更精確
- ✅ **自動過濾功能**：只保留主要藝人是目標藝人的歌曲（過濾掉合作歌曲、翻唱等）
- ✅ 自動處理分頁，不用擔心漏掉歌曲

## 功能說明

### 自動處理的欄位

- ✅ `song_id`: 自動遞增（從現有最大值 +1）
- ✅ `title`: 從 Spotify 取得歌名（**自動移除藝人名稱**並分離英文部分）
- ✅ `title_kr`: **自動從歌名中提取韓文部分**（如果 Spotify 有提供韓文）
- ✅ `release_date`: 從 Spotify 專輯發行日取得
- ✅ `duration`: 從 Spotify 計算（毫秒轉秒）
- ✅ `spotify_url`: 從 Spotify 取得完整連結
- ✅ `difficulty_level`: 預設為 5（**需要手動調整**）

### 歌名清理機制

腳本會自動處理以下問題：

#### 1. 移除藝人名稱
Spotify 的歌曲名稱格式可能不一致：
- `"TWICE - MORE & MORE"` → `"MORE & MORE"`
- `"MORE & MORE - TWICE"` → `"MORE & MORE"`
- `"TWICE: YES or YES"` → `"YES or YES"`

腳本會自動識別並移除藝人名稱，確保 `title` 欄位只包含歌名。

#### 2. 韓文歌名提取
腳本會自動：
1. 使用 `market=KR` 參數搜尋，獲取韓國市場的資訊
2. 從歌曲名稱中**自動提取韓文字元**（使用 Unicode 範圍識別）
3. 如果找到韓文，會自動分離：
   - `title`: 英文部分（移除藝人名稱後）
   - `title_kr`: 韓文部分
4. 如果沒有韓文，兩個欄位都會使用清理後的歌名（標示為 ⚠️）

**範例：**
- 輸入：`"TWICE - Dynamite (다이너마이트)"`
- 輸出：`title: "Dynamite"`, `title_kr: "다이너마이트"`

- 輸入：`"MORE & MORE - TWICE"`
- 輸出：`title: "MORE & MORE"`, `title_kr: "MORE & MORE"`

### 需要手動補的欄位

- ⚠️ `title_kr`: 如果 Spotify 沒有提供韓文（會標示為 ⚠️），需要手動更新
- ⚠️ `youtube_original_url`: 目前為 placeholder，請手動補上 YouTube MV 連結
- ⚠️ `difficulty_level`: 預設為 5，請根據實際舞蹈難度調整（0-10）

### 防重複機制

腳本會檢查 `spotify_url`，如果歌曲已存在於資料庫中，會自動跳過，不會重複插入。

### 藝人查詢模式 vs 一般搜尋模式

| 功能 | 一般搜尋模式 | 藝人查詢模式 |
|------|------------|------------|
| 查詢方式 | 關鍵字搜尋 | 精確藝人搜尋 |
| 顯示歌曲總數 | ✅ | ✅ |
| 顯示藝人資訊 | ❌ | ✅ |
| 結果精確度 | 可能混入其他藝人 | **自動過濾，只保留目標藝人的歌曲** |
| 自動分頁 | ✅ | ✅ |
| 自動過濾 | ❌ | ✅（過濾合作歌曲、翻唱等） |
| 適用場景 | 探索性搜尋 | 批量匯入特定藝人 |

### 自動過濾功能（藝人模式）

在藝人模式下，腳本會自動過濾結果：
- ✅ **只保留主要藝人是目標藝人的歌曲**
- ❌ **過濾掉**：合作歌曲（目標藝人不是主要藝人）
- ❌ **過濾掉**：翻唱歌曲
- ❌ **過濾掉**：其他藝人的歌曲（名稱相似但不同藝人）

**過濾邏輯：**
- 優先使用藝人 ID 比對（最精確）
- 如果沒有 ID，使用名稱比對（不區分大小寫）
- 只檢查主要藝人（`artists[0]`），這是 Spotify 的標準做法

## 注意事項

1. **YouTube 連結**: Spotify API 不提供 YouTube 連結，需要手動補上。你可以：
   - 在 Supabase 後台手動更新
   - 或寫另一個腳本用歌名搜尋 YouTube

2. **韓文歌名**: 
   - ✅ 如果 Spotify 的歌曲名稱中包含韓文，腳本會**自動提取**
   - ⚠️ 如果 Spotify 沒有提供韓文（例如只有英文名稱），會標示為 ⚠️，需要手動更新
   - 腳本使用 `market=KR` 參數，盡可能獲取韓國市場的資訊

3. **難度等級**: 預設為 5，需要根據實際舞蹈難度手動調整。

4. **API Rate Limit**: 腳本在每首歌曲之間會延遲 100ms，避免觸發 Spotify API 的 rate limit。

## 後續步驟

匯入完成後，建議：

1. 在 Supabase 後台檢查匯入的資料
2. 手動更新 `title_kr` 為正確的韓文歌名
3. 補上 `youtube_original_url`（可以用歌名搜尋 YouTube）
4. 根據實際情況調整 `difficulty_level`
5. 如果需要，建立 `SONG_GROUP` 和 `SONG_IDOL` 的關聯

