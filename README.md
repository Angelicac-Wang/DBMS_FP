# 舞告Match - K-pop 舞蹈翻跳媒合平台

## 📖 專案簡介

**舞告Match** 是一個專為 K-pop 舞蹈翻跳愛好者打造的線上媒合平台。無論你是想要尋找志同道合的舞者一起翻跳 K-pop 歌曲，還是想要招募成員完成你的翻跳專案，這個平台都能幫助你找到最適合的合作夥伴。

### 核心功能

- 🎯 **專案媒合**：創建或加入 K-pop 翻跳專案，招募特定偶像位置或伴舞
- 🎵 **歌曲管理**：豐富的 K-pop 歌曲資料庫，包含團體、偶像資訊
- 👥 **成員招募**：精確的成員位置招募系統，支援偶像角色和伴舞需求
- 📅 **練習排程**：管理專案的練習時間和地點
- 📊 **行為分析**：追蹤用戶行為，提供數據分析功能
- 👤 **個人作品集**：展示過往翻跳作品，建立個人品牌
- 🔍 **智能搜尋**：根據團體、地區、歌曲等條件篩選專案

### 適用對象

- K-pop 舞蹈愛好者
- 想要組織翻跳專案的舞者
- 尋找翻跳機會的舞者
- 想要建立作品集的舞者

---

## 🚀 安裝說明

### 前置需求

- **Node.js** 18+ 和 **Yarn** 或 **npm**
- **PostgreSQL** 14+（本地）- 用于存储交易数据
- **MongoDB** 6.0+（本地）- 用于存储行为分析数据
- **Git**

### 步驟 1: 克隆專案

```bash
git clone https://github.com/Angelicac-Wang/DBMS_FP.git
git checkout local-DB
```

### 步驟 2: 安裝依賴

```bash
npm install
```

### 步驟 3: 資料庫設定

#### 3.1 PostgreSQL（交易資料）

1. **安裝 PostgreSQL**（如果尚未安裝）：
   ```bash
   # macOS (使用 Homebrew)
   brew install postgresql@14
   brew services start postgresql@14
   
   # 或使用其他方式安裝
   ```

2. **創建資料庫**：
   ```bash
   createdb -U your_username kpop_dance_db
   ```

3. **恢復資料庫備份**：
   ```bash
   psql -U your_username -d kpop_dance_db < database_backup_latest.sql
   ```
   
   > **注意**：`database_backup.sql` 包含完整的資料庫結構和資料，直接恢復即可使用，無需額外執行其他 SQL 文件。

#### 3.2 MongoDB（行為分析資料）

1. **安裝 MongoDB**（如果尚未安裝）：
   ```bash
   # macOS (使用 Homebrew)
   brew tap mongodb/brew
   brew install mongodb/brew/mongodb-community
   brew services start mongodb/brew/mongodb-community
   
   # 或使用 Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

2. **MongoDB 會自動創建資料庫**，無需手動創建。

3. **（可選）創建索引以優化查詢性能**：
   ```bash
   npx tsx scripts/create-mongodb-indexes.ts
   ```

4. **（可選）遷移現有行為資料**：
   ```bash
   npx tsx scripts/migrate-behavior-to-mongodb.ts
   ```

### 步驟 4: 環境變數設定

創建 `.env.local` 文件：

```bash
cp .env_example .env.local
```

編輯 `.env.local`，填入你的資料庫資訊：

```env
# PostgreSQL 設定（交易資料）
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kpop_dance_db
DB_USER=your_username
DB_PASSWORD=your_password

# MongoDB 設定（行為分析資料）
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=kpop_dance_analytics
```

> **提示**：
> - 如果 PostgreSQL 沒有設定密碼，可以留空 `DB_PASSWORD=`
> - MongoDB 預設不需要認證，如果使用 Docker 或遠端 MongoDB，請相應調整 `MONGODB_URI`

### 步驟 5: 啟動開發伺服器

```bash
npm run dev

```

開啟瀏覽器訪問 [http://localhost:3000](http://localhost:3000)

---

## 📚 快速開始教學

### 範例 1: 創建一個翻跳專案

1. **註冊/登入帳號**
   - 訪問 `/auth` 頁面
   - 輸入用戶 ID 登入，或填寫資料註冊新帳號

2. **創建專案**
   - 在主頁點擊「建立專案」按鈕
   - 填寫專案資訊：
     - **專案標題**：例如「TWICE - One Spark 翻跳」
     - **翻跳歌曲**：搜尋並選擇要翻跳的歌曲
     - **練習地點**：例如「台北車站」
     - **專案描述**：說明專案需求和目標
   
3. **設定練習時間**
   - 點擊「+ 新增時間」
   - 選擇日期、開始時間和結束時間
   - 可以新增多個練習時段

4. **招募成員**
   - 選擇歌曲後，系統會自動載入該歌曲的偶像列表
   - 勾選要招募的偶像位置（例如：Sana、Mina）
   - 或設定伴舞數量
   - 系統會自動計算總招募人數

5. **提交專案**
   - 確認所有資訊無誤後，點擊「建立專案」
   - 專案建立成功後，會自動跳轉到專案管理頁面

### 範例 2: 申請加入專案

1. **瀏覽專案**
   - 訪問 `/projects` 頁面
   - 使用搜尋和篩選功能找到感興趣的專案

2. **查看專案詳情**
   - 點擊專案卡片查看詳細資訊
   - 查看練習時間、地點、缺少的位置等

3. **申請加入**
   - 點擊「申請加入」按鈕
   - 選擇想要申請的位置（例如：Sana 位置）
   - 提交申請

4. **等待審核**
   - 專案發起人會收到申請通知
   - 審核通過後即可加入專案

### 範例 3: 管理專案

1. **查看我的專案**
   - 訪問 `/profile/projects` 查看自己創建的專案

2. **審核申請**
   - 在專案管理頁面查看申請列表
   - 批准或拒絕申請

3. **更新專案狀態**
   - 專案進行中時，可以更新狀態為「進行中」
   - 完成後標記為「已完成」

---

## 🛠️ 技術棧

- **前端框架**: Next.js 16 (App Router)
- **語言**: TypeScript
- **樣式**: Tailwind CSS
- **資料庫**: 
  - PostgreSQL (本地) - 交易資料
  - MongoDB (本地) - 行為分析資料
- **ORM/查詢**: 
  - pg (PostgreSQL 客戶端)
  - mongodb (MongoDB 官方驅動)
- **套件管理**: Yarn / npm

---

## 📁 專案結構

```
DBMS_FP/
├── src/
│   ├── app/                    # Next.js App Router 頁面
│   │   ├── admin/              # 管理後台
│   │   ├── api/                # API 路由
│   │   ├── auth/               # 登入/註冊
│   │   ├── project/            # 專案相關頁面
│   │   └── profile/            # 個人資料
│   ├── components/             # React 組件
│   ├── hooks/                  # React Hooks
│   ├── lib/                    # 工具函數
│   │   └── db.ts              # 資料庫連接
│   └── types/                  # TypeScript 類型定義
├── docs/                       # 文件
│   ├── behavior-analytics/    # 行為分析系統
│   └── data-scraping/         # 資料爬蟲
├── scripts/                    # 工具腳本
├── backup_database.sh          # 資料庫備份腳本
├── data_structure.sql          # 資料庫結構
├── database_backup.sql         # 資料庫備份（舊版）
├── database_backup_latest.sql  # 最新資料庫備份
└── README.md                  # 本文件
```

---

## 📖 功能說明

### 用戶功能
- **登入/註冊**：簡化的用戶認證系統
- **專案瀏覽**：查看所有活躍的翻跳專案
- **搜尋與篩選**：根據團體、地區、歌曲等條件搜尋
- **專案詳情**：查看練習時間、地點、缺少位置等
- **申請加入**：申請加入感興趣的專案
- **個人作品集**：上傳和管理翻跳作品

### 管理功能
- **專案管理**：創建、編輯、刪除專案
- **申請審核**：審核成員申請
- **數據統計**：查看平台使用統計
- **行為分析**：追蹤用戶行為數據
- **內容管理**：管理歌曲、團體、偶像資料

---

## 📝 資料庫備份與恢復

專案包含完整的資料庫備份文件 `database_backup.sql`，包含所有資料表結構和資料。

### 創建資料庫備份

使用提供的備份腳本快速創建資料庫備份：

```bash
# 執行備份腳本
./backup_database.sh
```

備份腳本會：
- 自動生成帶時間戳的備份文件（例如：`database_backup_20251209_005036.sql`）
- 同時創建 `database_backup_latest.sql` 作為最新備份的快捷方式
- 顯示備份文件大小

**環境變數設定（可選）**：

如果需要在腳本中使用環境變數，可以設定：

```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=kpop_dance_db
export DB_USER=your_username
export DB_PASSWORD=your_password  # 可選，如果未設定會提示輸入

./backup_database.sh
```

> **提示**：如果未設定 `DB_PASSWORD`，腳本會提示輸入 PostgreSQL 密碼。

### 快速恢復（推薦）

直接使用備份文件恢復，無需執行其他 SQL 文件：

```bash
# 創建資料庫（如果不存在）
createdb -U your_username kpop_dance_db

# 恢復備份（使用最新備份或指定時間戳備份）
psql -U your_username -d kpop_dance_db < database_backup_latest.sql
# 或
psql -U your_username -d kpop_dance_db < database_backup_20251209_005036.sql
```

### 重新恢復（PostgreSQL）

如果需要重新恢復（會覆蓋現有資料）：

```bash
# 刪除現有資料庫（謹慎操作）
dropdb -U your_username kpop_dance_db

# 創建新資料庫
createdb -U your_username kpop_dance_db

# 恢復備份
psql -U your_username -d kpop_dance_db < database_backup_latest.sql
```

> **注意**：備份文件已經包含完整的資料庫結構和所有資料，直接恢復即可使用。

詳細說明請參考 [DATABASE_BACKUP_README.md](./DATABASE_BACKUP_README.md)

### MongoDB 備份與還原

> 目標資料庫：`kpop_dance_analytics`（`MONGODB_DB_NAME`），檔案存放於 `mongo-backups/` 並提供 `latest` 連結。

#### 快速備份
```bash
chmod +x backup_mongodb.sh
# 全量備份（含索引），預設輸出到 mongo-backups/時間戳
./backup_mongodb.sh

# 或指定輸出資料夾
./backup_mongodb.sh /path/to/mongo-backups
```

備份結果：
- 目錄：`mongo-backups/<timestamp>/`（內含資料庫資料夾）
- 最新連結：`mongo-backups/latest` 指向最近一次備份

#### 快速還原
```bash
# 還原 latest（使用預設 localhost:27017）
mongorestore --uri "mongodb://localhost:27017/kpop_dance_analytics" --drop \
  mongo-backups/latest/kpop_dance_analytics

# 還原指定時間戳
mongorestore --uri "mongodb://localhost:27017/kpop_dance_analytics" --drop \
  mongo-backups/20251209_203933/kpop_dance_analytics

# 或使用環境變數（如果已設定）
mongorestore --uri "${MONGODB_URI:-mongodb://localhost:27017}/${MONGODB_DB_NAME:-kpop_dance_analytics}" --drop \
  mongo-backups/latest/kpop_dance_analytics
```

> **注意**：`--drop` 會先刪除現有資料庫，請謹慎使用。如果不想刪除現有資料，可以移除 `--drop` 參數。

#### 手動使用 mongodump / mongorestore
```bash
# 備份
mongodump --db kpop_dance_analytics --out ./mongo-backups/$(date +%Y%m%d_%H%M%S)

# 還原
mongorestore --db kpop_dance_analytics --drop ./mongo-backups/20251209_203933/kpop_dance_analytics
```

---

## 📚 相關文件

- [資料庫備份說明](./DATABASE_BACKUP_README.md)
- [MongoDB 遷移指南](./docs/MONGODB_MIGRATION.md) - **新增：MongoDB 設定和遷移說明**
- [行為分析系統](./docs/behavior-analytics/README.md)
- [資料爬蟲說明](./docs/data-scraping/README.md)
- [遷移指南](./MIGRATION_GUIDE.md)

---

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

---

## 📄 授權

本專案為學術專案，僅供學習和研究使用。

---

## 📧 聯絡方式

如有問題或建議，請透過 GitHub Issues 聯繫。
