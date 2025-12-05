# Kprofiles.com KPOP 團體資料抓取腳本

這個腳本可以從 Kprofiles.com 抓取 KPOP 團體的成員和職位資訊，並輸出為 JSON 格式。

## 安裝依賴

```bash
npm install
# 或
yarn install
```

腳本需要以下依賴：
- `cheerio`: HTML 解析
- `tsx`: TypeScript 執行器

## 使用方法

### 基本使用

```bash
npx tsx scripts/fetch-kprofiles-groups.ts
```

這會自動嘗試從 Kprofiles.com 找到團體列表，並抓取資料。

### 指定輸出檔案

```bash
npx tsx scripts/fetch-kprofiles-groups.ts --output=kpop-groups.json
```

### 限制抓取數量

```bash
npx tsx scripts/fetch-kprofiles-groups.ts --limit=10
```

### 從檔案讀取團體列表（推薦）

如果您知道要抓取的團體 URL，可以建立一個文字檔案，每行一個 URL：

**group-urls.txt:**
```
https://kprofiles.com/black-pink-members-profile/
https://kprofiles.com/twice-members-profile/
https://kprofiles.com/bts-bangtan-boys-members-profile/
https://kprofiles.com/red-velvet-members-profile/
```

然後執行：

```bash
npx tsx scripts/fetch-kprofiles-groups.ts --groups=group-urls.txt --output=result.json
```

## 輸出格式

腳本會產生符合您要求的 JSON 格式：

```json
{
  "BLACKPINK": {
    "members": [
      {
        "name": "Jisoo",
        "position": ["Lead Vocal", "Visual"]
      },
      {
        "name": "Jennie",
        "position": ["Main Rapper", "Lead Vocal"]
      },
      {
        "name": "Rosé",
        "position": ["Main Vocal", "Lead Dancer"]
      },
      {
        "name": "Lisa",
        "position": ["Main Dancer", "Lead Rapper"]
      }
    ]
  },
  "TWICE": {
    "members": [
      {
        "name": "Nayeon",
        "position": ["Lead Vocal", "Center"]
      },
      ...
    ]
  }
}
```

## 注意事項

1. **請求頻率**: 腳本會在每個請求之間延遲 1 秒，以避免對網站造成負擔。

2. **資料準確性**: 
   - 腳本會自動解析 HTML 結構來提取成員和職位資訊
   - 如果網站結構改變，可能需要調整解析邏輯
   - 建議先測試幾個團體，確認資料正確性

3. **職位識別**: 
   - 腳本會自動識別常見的職位關鍵字（Main Vocal, Lead Vocal, Rapper, Dancer, Visual, Leader 等）
   - 如果無法識別職位，會標記為 "Unknown"

4. **團體 URL 格式**: 
   - Kprofiles.com 的團體頁面 URL 通常格式為：`https://kprofiles.com/{group-name}-members-profile/`
   - 您可以在瀏覽器中訪問團體頁面，複製 URL 到文字檔案中

## 如何找到團體 URL

1. 訪問 https://kprofiles.com
2. 搜尋或瀏覽找到您想要的團體
3. 進入團體的成員資料頁面
4. 複製瀏覽器地址欄的 URL
5. 將 URL 加入到文字檔案中

## 常見問題

**Q: 為什麼有些團體無法提取資料？**
A: 可能是因為：
- URL 不正確
- 網站結構改變
- 頁面需要 JavaScript 渲染（腳本目前只處理靜態 HTML）

**Q: 如何提高資料準確性？**
A: 
- 使用 `--groups` 參數手動指定已知的正確 URL
- 先測試幾個團體，確認解析邏輯正確
- 如果發現問題，可以調整腳本中的解析邏輯

**Q: 可以抓取所有團體嗎？**
A: 理論上可以，但建議：
- 使用 `--limit` 參數限制數量，先測試
- 分批抓取，避免一次請求過多
- 尊重網站的服務條款和 robots.txt

## 範例：建立團體列表檔案

建立 `popular-groups.txt`:

```
https://kprofiles.com/black-pink-members-profile/
https://kprofiles.com/twice-members-profile/
https://kprofiles.com/bts-bangtan-boys-members-profile/
https://kprofiles.com/red-velvet-members-profile/
https://kprofiles.com/aespa-members-profile/
https://kprofiles.com/newjeans-members-profile/
https://kprofiles.com/ive-members-profile/
https://kprofiles.com/le-sserafim-members-profile/
https://kprofiles.com/idle-members-profile/
https://kprofiles.com/stray-kids-members-profile/
```

執行：

```bash
npx tsx scripts/fetch-kprofiles-groups.ts --groups=popular-groups.txt --output=kpop-groups.json
```

