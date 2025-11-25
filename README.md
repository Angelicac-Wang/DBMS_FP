# 🎤 Cover 團招募平台

一個基於 React + TypeScript + Ant Design 的 K-pop Cover 團招募管理網站。

## 📋 功能特色

### 1️⃣ 舞團瀏覽頁（首頁）
- 🔍 搜尋功能：可搜尋團名或歌名
- 🏷️ 地區篩選：支援雙北、台中、桃園、高雄等地區
- 📋 詳細資訊：
  - 缺的位置
  - 練習時間與地點
  - 拍攝時間與地點
  - 展開查看完整規則與說明
- 💾 儲存功能：將有興趣的團加入清單

### 2️⃣ 我的行事曆頁
- 📅 視覺化行事曆：顯示所有儲存團體的練習與拍攝時間
- ✅ 彈性勾選：可勾選/取消要顯示的團體
- ⚠️ 衝突偵測：自動標記時間衝突的活動
- ℹ️ 詳細資訊：點擊事件查看詳細時間地點

### 3️⃣ 儲存清單 / 申請頁
- 📝 統一管理：顯示所有已儲存的團體
- ☑️ 批次申請：可勾選多個團體一次送出申請
- ✉️ 申請追蹤：顯示「等待團主回覆中」狀態
- 🔒 申請鎖定：已申請的團體無法取消

## 🛠️ 技術架構

- **前端框架**：React 18 + TypeScript
- **UI 框架**：Ant Design 5
- **路由管理**：React Router v6
- **狀態管理**：React Context API + localStorage
- **資料來源**：CSV 檔案（支援熱更新）
- **建置工具**：Vite

## 📂 專案結構

```
hw3/
├── public/
│   └── data/
│       └── cover_groups.csv          # 資料來源
├── src/
│   ├── components/
│   │   └── GroupCard.tsx             # 團體卡片元件
│   ├── pages/
│   │   ├── HomePage.tsx              # 舞團瀏覽頁
│   │   ├── CalendarPage.tsx          # 行事曆頁
│   │   └── SavedListPage.tsx         # 儲存清單頁
│   ├── context/
│   │   └── CoverGroupContext.tsx     # 全域狀態管理
│   ├── types/
│   │   └── types.ts                  # TypeScript 型別定義
│   ├── utils/
│   │   ├── csvParser.ts              # CSV 解析工具
│   │   └── timeConflict.ts           # 時間衝突檢測
│   ├── App.tsx                       # 主應用程式
│   └── main.tsx                      # 入口檔案
└── package.json
```

## 🚀 快速開始

### 安裝依賴
```bash
npm install
```

### 開發模式
```bash
npm run dev
```

### 建置專案
```bash
npm run build
```

### 預覽建置結果
```bash
npm run preview
```

## 📊 資料格式

CSV 檔案格式（`public/data/cover_groups.csv`）：

```csv
id,group_name,song_name,missing_positions,region,practice_times,practice_location,shooting_time,shooting_location,rules,description,contact,group_type
```

### 欄位說明
- `id`：唯一識別碼
- `group_name`：團體名稱（如 TWICE、Aespa）
- `song_name`：歌曲名稱
- `missing_positions`：缺的位置（逗號分隔）
- `region`：地區（雙北/台中/桃園/高雄）
- `practice_times`：練習時間（用 `|` 分隔多個時間）
- `practice_location`：練習地點
- `shooting_time`：拍攝時間
- `shooting_location`：拍攝地點
- `rules`：規則與要求
- `description`：詳細說明
- `contact`：聯絡方式

### 時間格式
```
2025-10-15（二） 19:00-21:00
```

## ✨ 特色功能

### Hot Reload
修改 `public/data/cover_groups.csv` 後，開發模式下會自動重新載入資料，無需重啟服務。

### 本地儲存
使用 localStorage 儲存使用者的：
- 已儲存的團體清單
- 已申請的團體清單
- 行事曆中勾選的團體

### 智慧衝突檢測
自動比對所有勾選團體的練習與拍攝時間，標記出時間重疊的活動。

## 🎯 使用流程

1. **探索團體**：在首頁瀏覽、搜尋、篩選有興趣的 cover 團
2. **儲存團體**：點擊「儲存」按鈕將團體加入清單
3. **檢查時間**：前往行事曆頁面，勾選團體查看是否有時間衝突
4. **送出申請**：前往我的清單頁面，勾選要申請的團體並送出
5. **等待回覆**：顯示「等待團主回覆中」狀態

## 📝 作業資訊

- **課程**：Web Programming
- **作業**：HW3 - 純前端資料視覺化網站
- **要求**：
  - ✅ 使用 React + TypeScript
  - ✅ 使用 UI 框架（Ant Design）
  - ✅ 資料來源為 CSV 檔案
  - ✅ 支援 hot reload
