# Vercel 部署指南

## Vercel 專案數量限制

**免費方案（Hobby Plan）限制：**
- ✅ **最多 200 個專案**（對個人開發者來說非常充足）
- ✅ 每個部署最多 12 個無伺服器函數
- ✅ 每月 100GB 頻寬
- ✅ 每月 100GB 小時的函數執行時間

**付費方案（Pro Plan）：**
- 無限專案數量
- 更多資源配額

對於你的專案來說，免費方案完全足夠！

## Vercel 部署需要設置的環境變數

在 Vercel 上部署時，你需要在 Vercel 的環境變數設置中添加以下變數：

### 必需環境變數

```
NEXT_PUBLIC_SUPABASE_URL=你的Supabase專案URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase匿名金鑰
```

### 如何設置環境變數

1. 登入 Vercel Dashboard
2. 選擇你的專案
3. 進入 **Settings** → **Environment Variables**
4. 添加上述兩個環境變數
5. 選擇適用的環境（Production, Preview, Development）
6. 點擊 **Save**

## 初始資料說明

### ❌ 不需要在 Vercel 上放置的資料

- **資料庫初始資料**：這些應該在 Supabase 資料庫中執行
  - `data_structure.sql` - 在 Supabase SQL Editor 執行
  - `insert_sample_data.sql` - 在 Supabase SQL Editor 執行
  - `update_jump_links.sql` - 在 Supabase SQL Editor 執行

### ✅ Vercel 會自動處理的

- **程式碼**：Vercel 會自動從 GitHub 拉取並構建
- **靜態資源**：Next.js 會自動優化並部署
- **環境變數**：需要在 Vercel Dashboard 中手動設置

## 部署步驟

### 1. 準備 GitHub 倉庫

確保你的代碼已經推送到 GitHub：
```bash
git add .
git commit -m "準備部署到 Vercel"
git push origin main
```

### 2. 連接 Vercel

1. 前往 [vercel.com](https://vercel.com)
2. 使用 GitHub 帳號登入
3. 點擊 **Add New Project**
4. 選擇你的 `dancing` 倉庫
5. 點擊 **Import**

### 3. 配置專案

Vercel 會自動檢測 Next.js 專案，通常不需要額外配置：

- **Framework Preset**: Next.js（自動檢測）
- **Root Directory**: `./`（預設）
- **Build Command**: `yarn build`（自動檢測）
- **Output Directory**: `.next`（自動檢測）

### 4. 設置環境變數

在 **Environment Variables** 部分添加：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 5. 部署

點擊 **Deploy**，Vercel 會自動：
1. 安裝依賴（`yarn install`）
2. 構建專案（`yarn build`）
3. 部署到全球 CDN

### 6. 設置資料庫

部署完成後，記得在 Supabase 中執行：
1. `data_structure.sql` - 創建資料表結構
2. `insert_sample_data.sql` - 插入測試資料
3. `update_jump_links.sql` - 更新 JUMP 歌曲連結

## 部署後檢查清單

- [ ] 環境變數已正確設置
- [ ] 專案構建成功
- [ ] 網站可以正常訪問
- [ ] 在 Supabase 中執行資料庫初始化 SQL
- [ ] 測試登入/註冊功能
- [ ] 測試專案瀏覽功能

## 常見問題

### Q: 部署後出現環境變數錯誤？
A: 檢查 Vercel Dashboard 中的環境變數是否正確設置，並確保變數名稱與 `.env_example` 中的一致。

### Q: 資料庫連接失敗？
A: 確認 Supabase 專案的 URL 和 Anon Key 是否正確，並檢查 Supabase 專案是否已啟動。

### Q: 構建失敗？
A: 檢查 `yarn build` 是否在本地可以成功執行，確保所有依賴都已正確安裝。

## 注意事項

1. **不要將 `.env.local` 提交到 Git**：環境變數應該在 Vercel Dashboard 中設置
2. **資料庫初始化**：記得在 Supabase 中執行 SQL 腳本
3. **免費方案限制**：200 個專案對個人開發完全足夠

