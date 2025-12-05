# 資料爬蟲文件

此資料夾包含所有與爬取 K-pop 團體、歌手、歌曲資料相關的文件。

## 📁 文件結構

### 爬蟲腳本
- `fetch-kprofiles-groups.ts` - 從 Kprofiles 爬取團體資料
- `fetch-spotify-songs.ts` - 從 Spotify API 獲取歌曲資料
- `extract-groups-links.ts` - 提取團體連結
- `extract-solo-artists-links.ts` - 提取個人歌手連結
- `test-spotify-response.ts` - 測試 Spotify API 回應

### 文件說明
- `README.md` - 腳本使用說明（原始）
- `KPROFILES_README.md` - Kprofiles 爬蟲說明
- `KPROFILES_IDOL_FIELDS.md` - Kprofiles 偶像欄位說明
- `SPOTIFY_API_FORMAT.md` - Spotify API 格式說明
- `DISPLAY_LOGIC_EXPLANATION.md` - 顯示邏輯說明

### 資料文件
- `kpop-groups.json` - K-pop 團體資料（JSON 格式）
- `girl-groups-batch1.json` - 女團資料批次 1
- `sample-data.json` - 範例資料

### 連結文件
- `all-kprofiles-links.txt` - 所有 Kprofiles 連結
- `all-links.txt` - 所有連結
- `boy-groups-link.txt` - 男團連結
- `girl-groups-link.txt` - 女團連結
- `solo-artists-link.txt` - 個人歌手連結
- `example-group-urls.txt` - 範例團體 URL

## 🚀 使用方式

### 執行爬蟲腳本

```bash
# 爬取 Kprofiles 團體資料
npx tsx fetch-kprofiles-groups.ts

# 爬取 Spotify 歌曲資料
npx tsx fetch-spotify-songs.ts

# 提取連結
npx tsx extract-groups-links.ts
npx tsx extract-solo-artists-links.ts
```

### 環境變數

確保設置了必要的環境變數：
- `SPOTIFY_CLIENT_ID` - Spotify API Client ID
- `SPOTIFY_CLIENT_SECRET` - Spotify API Client Secret
- `SUPABASE_URL` - Supabase 專案 URL
- `SUPABASE_KEY` - Supabase API Key

## 📚 相關文件

詳細說明請參考：
- [腳本使用說明](./README.md)
- [Kprofiles 爬蟲說明](./KPROFILES_README.md)
- [Spotify API 格式](./SPOTIFY_API_FORMAT.md)
