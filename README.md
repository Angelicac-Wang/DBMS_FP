# 舞告Match - K-pop 舞蹈翻跳媒合平台

專為 K-pop 舞蹈翻跳愛好者打造的線上媒合平台。

## 環境設定

1. 複製 `.env_example` 為 `.env.local`：
```bash
cp .env_example .env.local
```

2. 在 `.env.local` 中填入你的 Supabase 專案資訊：
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. 安裝依賴套件：
```bash
yarn install
```

## 資料庫設定

1. 在 Supabase SQL Editor 中執行 `data_structure.sql` 建立資料表結構
2. 執行 `insert_sample_data.sql` 插入測試資料

## 開始使用

啟動開發伺服器：

```bash
yarn dev
```

開啟 [http://localhost:3000](http://localhost:3000) 查看結果。

## 功能說明

- **登入/註冊**：簡化的用戶認證系統（登入只需用戶ID，註冊需填寫基本資料）
- **專案瀏覽**：查看所有活躍的 K-pop 翻跳專案
- **搜尋與篩選**：根據團名、地區等條件搜尋專案
- **專案詳情**：查看專案的練習時間、地點、拍攝資訊、缺少的位置等

## 技術棧

- **框架**：Next.js 16
- **語言**：TypeScript
- **樣式**：Tailwind CSS
- **資料庫**：Supabase (PostgreSQL)
- **套件管理**：Yarn

## 專案結構

```
src/
├── app/              # Next.js App Router 頁面
│   ├── auth/         # 登入/註冊頁面
│   └── page.tsx      # 主頁
├── components/       # React 組件
│   ├── BottomNav.tsx    # 底部導航欄
│   └── ProjectCard.tsx  # 專案卡片
└── lib/              # 工具函數
    └── supabase.ts   # Supabase 客戶端配置

docs/
├── behavior-analytics/  # 行為分析系統文件
│   ├── behavior_analytics_schema.sql
│   ├── behavior_analytics_rls_safe.sql
│   ├── BEHAVIOR_ANALYTICS_README.md
│   └── ...
└── data-scraping/      # 資料爬蟲文件
    ├── fetch-kprofiles-groups.ts
    ├── fetch-spotify-songs.ts
    └── ...
```

## 文件說明

### 行為分析系統
所有行為分析相關的文件已整理至 `docs/behavior-analytics/` 資料夾：
- 資料庫 Schema 和 RLS 策略
- 使用文件和說明
- 詳細說明請參考 [行為分析文件](./docs/behavior-analytics/README.md)

### 資料爬蟲
所有爬蟲相關的文件已整理至 `docs/data-scraping/` 資料夾：
- Kprofiles 和 Spotify 爬蟲腳本
- 資料文件和連結列表
- 詳細說明請參考 [資料爬蟲文件](./docs/data-scraping/README.md)
