# 業務經營者（管理員）功能實作文件

## 目錄
1. [資料庫修改](#資料庫修改)
2. [實作步驟](#實作步驟)
3. [檔案結構](#檔案結構)
4. [功能詳細說明](#功能詳細說明)
5. [安全性考量](#安全性考量)

---

## 資料庫修改

### 檢查現有結構

**USERS 表已包含 role 欄位，無需修改：**
```sql
role CHAR NOT NULL CHECK (role IN ('U','A'))
```
- `'U'` = 一般使用者 (User)
- `'A'` = 管理員 (Admin)

### 需要執行的 SQL 操作

#### 1. 建立管理員帳號

在 Supabase 中執行以下 SQL 來建立管理員帳號：

```sql
-- 建立管理員帳號（請修改為實際的管理員資訊）
INSERT INTO USERS (
    u_id,
    name,
    email,
    password,
    birthdate,
    gender,
    region,
    phone,
    status,
    create_at,
    last_login,
    role
) VALUES (
    9999999999,  -- 管理員 ID（使用特殊數字）
    'admin',     -- 管理員名稱
    'admin@system.com',  -- 管理員 Email
    'admin123',  -- 管理員密碼（請在正式環境中使用強密碼）
    '2000-01-01',  -- 生日（可選）
    'B',         -- 性別（B=男, G=女）
    '雙北',      -- 地區
    '0912345678', -- 電話
    'A',         -- 狀態（A=啟用）
    NOW(),       -- 建立時間
    NOW(),       -- 最後登入時間
    'A'          -- 角色（A=管理員）
);
```

**注意事項：**
- 請在正式環境中修改密碼為強密碼
- 建議使用更安全的密碼管理方式
- 可以建立多個管理員帳號

---

## 實作步驟

### 階段一：修改登入邏輯與權限檢查

#### 1.1 修改登入邏輯 (`src/app/auth/page.tsx`)

**需要修改的部分：**

1. **在 `handleLogin` 函數中查詢 role：**
   ```typescript
   const { data, error: fetchError } = await supabase
     .from('users')
     .select('u_id, status, password, role')  // 加入 role
     .eq('name', loginData.name)
     .single();
   ```

2. **登入成功後根據 role 導向：**
   ```typescript
   // 儲存到 localStorage
   localStorage.setItem('userId', data.u_id.toString());
   localStorage.setItem('userRole', data.role);  // 儲存角色
   
   // 根據角色導向不同頁面
   if (data.role === 'A') {
     router.push('/admin');
   } else {
     router.push('/');
   }
   ```

#### 1.2 建立權限檢查 Hook (`src/hooks/useAdminAuth.ts`)

**新建檔案：**
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAdminAuth() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');

    if (!userId) {
      router.push('/auth');
      return;
    }

    if (userRole !== 'A') {
      router.push('/');
      return;
    }

    setIsAdmin(true);
    setLoading(false);
  }, [router]);

  return { isAdmin, loading };
}
```

#### 1.3 建立一般使用者權限檢查 (`src/hooks/useUserAuth.ts`)

**新建檔案：**
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useUserAuth() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');

    if (!userId) {
      router.push('/auth');
      return;
    }

    // 如果是管理員，導向管理頁面
    if (userRole === 'A') {
      router.push('/admin');
      return;
    }

    setIsAuthenticated(true);
    setLoading(false);
  }, [router]);

  return { isAuthenticated, loading };
}
```

---

### 階段二：建立管理員頁面結構

#### 2.1 建立管理員首頁 (`src/app/admin/page.tsx`)

**功能：**
- 顯示平台統計概覽
- 快速連結到各管理功能
- 顯示最近活動

**需要顯示的統計：**
- 總使用者數
- 總專案數
- 活躍專案數
- 今日新增專案數

#### 2.2 建立管理員導航組件 (`src/components/AdminNav.tsx`)

**功能：**
- 顯示管理員選單
- 包含所有管理功能的連結
- 顯示當前登入的管理員資訊
- 登出功能

**選單項目：**
- 儀表板（首頁）
- 團體管理
- 歌曲管理
- 使用者管理
- 專案管理
- 統計數據

---

### 階段三：實作團體管理功能

#### 3.1 團體列表頁面 (`src/app/admin/groups/page.tsx`)

**功能：**
- 顯示所有團體列表
- 搜尋功能（依團體名稱）
- 篩選功能（依團體類型、經紀公司）
- 新增、編輯、刪除按鈕
- 分頁功能

**顯示欄位：**
- 團體名稱（英文/韓文）
- 團體類型
- 經紀公司
- 成員人數
- 出道日期
- 操作按鈕

#### 3.2 新增團體頁面 (`src/app/admin/groups/create/page.tsx`)

**表單欄位：**
- group_id (BIGINT, 自動生成)
- group_name (VARCHAR(20), 必填)
- group_namekr (VARCHAR(20), 選填)
- debut_date (DATE, 必填)
- company (VARCHAR(20), 必填)
- group_type (CHAR, 必填, B/G/M)
- member_count (INT, 必填)
- logo_image (VARCHAR(100), 選填)
- discription (CHAR(500), 選填)

**驗證：**
- 所有必填欄位驗證
- group_type 必須是 B/G/M
- member_count 必須 > 0

#### 3.3 編輯團體頁面 (`src/app/admin/groups/[id]/edit/page.tsx`)

**功能：**
- 載入現有團體資料
- 顯示編輯表單
- 更新資料
- 刪除功能（需處理外鍵約束）

**注意事項：**
- 刪除前需檢查是否有歌曲關聯
- 可考慮軟刪除或提示無法刪除

#### 3.4 團體詳情頁面 (`src/app/admin/groups/[id]/page.tsx`)

**顯示內容：**
- 團體基本資訊
- 成員列表（從 KPOP_IDOLS 表）
- 歌曲列表（從 SONG_GROUP 表）
- 相關專案統計

---

### 階段四：實作歌曲管理功能

#### 4.1 歌曲列表頁面 (`src/app/admin/songs/page.tsx`)

**功能：**
- 顯示所有歌曲列表
- 搜尋功能（依歌曲名稱）
- 篩選功能（依團體、難度）
- 新增、編輯、刪除按鈕
- 分頁功能

**顯示欄位：**
- 歌曲名稱（英文/韓文）
- 演唱團體
- 發行日期
- 難度等級
- 時長
- 操作按鈕

#### 4.2 新增歌曲頁面 (`src/app/admin/songs/create/page.tsx`)

**表單欄位：**
- song_id (BIGINT, 自動生成)
- title (VARCHAR(50), 必填)
- title_kr (VARCHAR(50), 必填)
- release_date (DATE, 必填)
- duration (INT, 必填, 秒數)
- difficulty_level (INT, 必填, 0-10)
- spotify_url (VARCHAR(100), 選填)
- youtube_original_url (VARCHAR(100), 必填)

**關聯管理：**
- 選擇演唱團體（多選，建立 SONG_GROUP 關聯）
- 選擇演唱偶像（多選，建立 SONG_IDOL 關聯）

#### 4.3 編輯歌曲頁面 (`src/app/admin/songs/[id]/edit/page.tsx`)

**功能：**
- 載入現有歌曲資料
- 顯示編輯表單
- 更新資料
- 管理團體/偶像關聯
- 刪除功能

#### 4.4 歌曲詳情頁面 (`src/app/admin/songs/[id]/page.tsx`)

**顯示內容：**
- 歌曲基本資訊
- 演唱團體列表
- 演唱偶像列表
- 相關專案統計

---

### 階段五：實作用戶查詢功能

#### 5.1 使用者列表頁面 (`src/app/admin/users/page.tsx`)

**功能：**
- 顯示所有使用者列表
- 搜尋功能（依名稱、Email）
- 篩選功能（依地區、性別、狀態）
- 查看詳情按鈕
- 分頁功能

**顯示欄位：**
- 使用者名稱
- Email
- 地區
- 性別
- 狀態（啟用/停用）
- 註冊日期
- 最後登入時間

#### 5.2 使用者詳情頁面 (`src/app/admin/users/[id]/page.tsx`)

**顯示內容：**

1. **基本資料區塊：**
   - 使用者 ID、名稱、Email
   - 生日、性別、地區
   - 電話、狀態
   - 註冊日期、最後登入時間

2. **發起的專案區塊：**
   - 查詢 PROJECT 表，creator_id = u_id
   - 顯示專案列表（標題、狀態、建立時間）
   - 可點擊查看專案詳情

3. **參與的專案區塊：**
   - 查詢 PROJECT_MEMBERS 表，member_id = u_id
   - 顯示專案列表（標題、位置、加入日期）
   - 可點擊查看專案詳情

4. **作品集區塊：**
   - 查詢 PORTFOLIOS 表，u_id = u_id
   - 顯示作品列表（標題、影片連結、描述）

5. **技能區塊：**
   - 查詢 USER_SKILLS 表
   - 顯示技能列表（類型、熟練度、經驗年數）

6. **社群連結區塊：**
   - 查詢 USER_SOCIAL_LINK 表
   - 顯示社群連結列表（平台、URL、追蹤數）

7. **申請記錄區塊：**
   - 查詢 PROJECT_APPLICATIONS 表，applicant_id = u_id
   - 顯示申請列表（專案、位置、狀態、申請時間）

**SQL 查詢範例：**
```sql
-- 發起的專案
SELECT * FROM PROJECT WHERE creator_id = :user_id;

-- 參與的專案
SELECT p.*, pm.target_seq, pm.join_date
FROM PROJECT p
JOIN PROJECT_MEMBERS pm ON p.p_id = pm.p_id
WHERE pm.member_id = :user_id AND pm.status = 'Y';

-- 作品集
SELECT * FROM PORTFOLIOS WHERE u_id = :user_id;

-- 技能
SELECT * FROM USER_SKILLS WHERE u_id = :user_id;

-- 社群連結
SELECT * FROM USER_SOCIAL_LINK WHERE u_id = :user_id;

-- 申請記錄
SELECT pa.*, p.porject_title
FROM PROJECT_APPLICATIONS pa
JOIN PROJECT p ON pa.p_id = p.p_id
WHERE pa.applicant_id = :user_id;
```

---

### 階段六：實作專案查詢功能

#### 6.1 專案列表頁面 (`src/app/admin/projects/page.tsx`)

**功能：**
- 顯示所有專案列表
- 搜尋功能（依專案標題、歌曲名稱）
- 篩選功能（依狀態、地區、創建者）
- 查看詳情按鈕
- 分頁功能

**顯示欄位：**
- 專案標題
- 創建者名稱
- 歌曲名稱
- 狀態（招募中/進行中/已完成）
- 目標人數
- 建立日期

#### 6.2 專案詳情頁面 (`src/app/admin/projects/[id]/page.tsx`)

**顯示內容：**

1. **基本資料區塊：**
   - 專案 ID、標題、描述
   - 創建者資訊（名稱、ID）
   - 歌曲資訊（名稱、團體、難度）
   - 目標人數、狀態
   - 練習地點、拍攝地點
   - 建立時間、更新時間

2. **成員名單與位置分配區塊：**
   - 查詢 PROJECT_MEMBERS 和 PROJECT_TARGET
   - 顯示所有位置（已填滿和空缺）
   - 每個位置顯示：
     - 位置編號（target_seq）
     - 對應的偶像名稱（如果有）
     - 成員名稱（如果已填滿）
     - 狀態（已填滿/空缺）

3. **所有申請記錄區塊：**
   - 查詢 PROJECT_APPLICATIONS 表
   - 顯示所有申請（不限狀態：W/A/R/C）
   - 顯示申請者資訊、申請位置、狀態、申請時間、審核時間

4. **練習時間表區塊：**
   - 查詢 PRACTICE_SCHEDULE 表
   - 顯示所有練習時間（日期、開始時間、結束時間）

5. **專案進度區塊：**
   - 顯示專案狀態
   - 顯示完成度（已填滿位置數 / 總位置數）
   - 顯示專案時間線

6. **最終成果區塊：**
   - 如果有上傳影片，顯示影片連結
   - 顯示作品集資訊

**SQL 查詢範例：**
```sql
-- 成員名單與位置
SELECT 
    pt.target_seq,
    pt.idol_id,
    pt.status as target_status,
    ki.stage_name as idol_name,
    pm.member_id,
    u.name as member_name
FROM PROJECT_TARGET pt
LEFT JOIN KPOP_IDOLS ki ON pt.idol_id = ki.idol_id
LEFT JOIN PROJECT_MEMBERS pm ON pt.project_id = pm.p_id 
    AND pt.target_seq = pm.target_seq 
    AND pm.status = 'Y'
LEFT JOIN USERS u ON pm.member_id = u.u_id
WHERE pt.project_id = :project_id
ORDER BY pt.target_seq;

-- 所有申請記錄
SELECT 
    pa.*,
    u.name as applicant_name,
    ki.stage_name as idol_name
FROM PROJECT_APPLICATIONS pa
JOIN USERS u ON pa.applicant_id = u.u_id
LEFT JOIN PROJECT_TARGET pt ON pa.p_id = pt.project_id 
    AND pa.target_seq = pt.target_seq
LEFT JOIN KPOP_IDOLS ki ON pt.idol_id = ki.idol_id
WHERE pa.p_id = :project_id
ORDER BY pa.applied_time DESC;
```

---

### 階段七：實作統計數據功能

#### 7.1 統計數據頁面 (`src/app/admin/statistics/page.tsx`)

**需要統計的數據：**

1. **使用者統計：**
   ```sql
   -- 總註冊使用者數
   SELECT COUNT(*) FROM USERS;
   
   -- 活躍使用者數（最近30天有登入）
   SELECT COUNT(*) FROM USERS 
   WHERE last_login >= NOW() - INTERVAL '30 days';
   
   -- 依地區分布
   SELECT region, COUNT(*) as count 
   FROM USERS 
   GROUP BY region;
   
   -- 依性別分布
   SELECT gender, COUNT(*) as count 
   FROM USERS 
   GROUP BY gender;
   ```

2. **專案統計：**
   ```sql
   -- 各狀態專案數量
   SELECT status, COUNT(*) as count 
   FROM PROJECT 
   GROUP BY status;
   
   -- 總專案數
   SELECT COUNT(*) FROM PROJECT;
   
   -- 活躍專案數（狀態為 A）
   SELECT COUNT(*) FROM PROJECT WHERE status = 'A';
   
   -- 已完成專案數（狀態為 F）
   SELECT COUNT(*) FROM PROJECT WHERE status = 'F';
   ```

3. **熱門翻跳歌曲排行：**
   ```sql
   SELECT 
       s.song_id,
       s.title,
       COUNT(DISTINCT p.p_id) as project_count
   FROM KPOP_SONGS s
   JOIN PROJECT p ON s.song_id = p.song_id
   GROUP BY s.song_id, s.title
   ORDER BY project_count DESC
   LIMIT 10;
   ```

4. **地區分布統計：**
   ```sql
   -- 從練習地點推斷地區
   SELECT 
       CASE 
           WHEN practice_location LIKE '%雙連%' OR practice_location LIKE '%台北%' OR practice_location LIKE '%新北%' THEN '雙北'
           WHEN practice_location LIKE '%台中%' THEN '台中'
           WHEN practice_location LIKE '%高雄%' THEN '高雄'
           WHEN practice_location LIKE '%桃園%' THEN '桃園'
           WHEN practice_location LIKE '%新竹%' THEN '新竹'
           WHEN practice_location LIKE '%台南%' THEN '台南'
           ELSE '其他'
       END as region,
       COUNT(*) as project_count
   FROM PROJECT
   GROUP BY region
   ORDER BY project_count DESC;
   ```

5. **人數規模統計：**
   ```sql
   SELECT 
       target_cnt,
       COUNT(*) as project_count
   FROM PROJECT
   GROUP BY target_cnt
   ORDER BY target_cnt;
   ```

6. **專案完成率：**
   ```sql
   -- 總專案數
   SELECT COUNT(*) as total FROM PROJECT;
   
   -- 已完成專案數
   SELECT COUNT(*) as completed FROM PROJECT WHERE status = 'F';
   
   -- 完成率 = completed / total * 100
   ```

7. **專案完成時間分析：**
   ```sql
   -- 計算專案從建立到完成的時間（需要記錄完成時間）
   -- 如果沒有完成時間欄位，可能需要新增
   SELECT 
       AVG(EXTRACT(EPOCH FROM (update_at - create_at)) / 86400) as avg_days
   FROM PROJECT
   WHERE status = 'F';
   ```

**視覺化建議：**
- 使用圖表庫（如 Chart.js 或 Recharts）
- 顯示圓餅圖（地區分布、狀態分布）
- 顯示長條圖（熱門歌曲、人數規模）
- 顯示折線圖（時間趨勢）

---

## 檔案結構

```
src/
├── app/
│   ├── admin/
│   │   ├── page.tsx                    # 管理員首頁（儀表板）
│   │   ├── layout.tsx                  # 管理員頁面佈局（包含 AdminNav）
│   │   ├── groups/
│   │   │   ├── page.tsx                # 團體列表
│   │   │   ├── create/
│   │   │   │   └── page.tsx            # 新增團體
│   │   │   └── [id]/
│   │   │       ├── page.tsx            # 團體詳情
│   │   │       └── edit/
│   │   │           └── page.tsx        # 編輯團體
│   │   ├── songs/
│   │   │   ├── page.tsx                # 歌曲列表
│   │   │   ├── create/
│   │   │   │   └── page.tsx            # 新增歌曲
│   │   │   └── [id]/
│   │   │       ├── page.tsx            # 歌曲詳情
│   │   │       └── edit/
│   │   │           └── page.tsx        # 編輯歌曲
│   │   ├── users/
│   │   │   ├── page.tsx                # 使用者列表
│   │   │   └── [id]/
│   │   │       └── page.tsx            # 使用者詳情
│   │   ├── projects/
│   │   │   ├── page.tsx                # 專案列表
│   │   │   └── [id]/
│   │   │       └── page.tsx            # 專案詳情
│   │   └── statistics/
│   │       └── page.tsx                # 統計數據
│   └── auth/
│       └── page.tsx                    # 修改登入邏輯
├── components/
│   └── AdminNav.tsx                    # 管理員導航組件
└── hooks/
    ├── useAdminAuth.ts                  # 管理員權限檢查 Hook
    └── useUserAuth.ts                   # 一般使用者權限檢查 Hook
```

---

## 功能詳細說明

### 1. 管理 Kpop 團體與歌曲資料庫

#### 團體管理功能

**CRUD 操作：**
- **Create（新增）：** 表單包含所有必要欄位，驗證後插入 KPOP_GROUPS 表
- **Read（查詢）：** 列表顯示所有團體，支援搜尋和篩選
- **Update（修改）：** 載入現有資料，允許修改所有欄位
- **Delete（刪除）：** 刪除前檢查外鍵約束，如有關聯則提示無法刪除

**外鍵約束處理：**
- 刪除團體前需檢查：
  - KPOP_IDOLS 表是否有關聯（ON DELETE SET NULL，可刪除）
  - SONG_GROUP 表是否有關聯（ON DELETE CASCADE，會自動刪除）
  - 建議：顯示警告訊息，列出相關歌曲和偶像

#### 歌曲管理功能

**CRUD 操作：**
- **Create（新增）：** 表單包含所有必要欄位，並可選擇關聯的團體和偶像
- **Read（查詢）：** 列表顯示所有歌曲，支援搜尋和篩選
- **Update（修改）：** 載入現有資料，可修改基本資訊和關聯
- **Delete（刪除）：** 刪除前檢查外鍵約束

**關聯管理：**
- **團體關聯（SONG_GROUP）：**
  - 新增時可選擇多個團體
  - 編輯時可新增/刪除團體關聯
- **偶像關聯（SONG_IDOL）：**
  - 新增時可選擇多個偶像
  - 編輯時可新增/刪除偶像關聯

**外鍵約束處理：**
- 刪除歌曲前需檢查：
  - PROJECT 表是否有關聯（ON DELETE SET NULL，可刪除）
  - SONG_GROUP 表（ON DELETE CASCADE，會自動刪除）
  - SONG_IDOL 表（ON DELETE CASCADE，會自動刪除）
  - VIDEO_DETAIL 表（ON DELETE SET NULL，可刪除）

### 2. 查詢使用者資訊與活動紀錄

**查詢範圍：**
- 所有使用者（不限狀態）
- 可查看停用（status = 'N'）的使用者

**顯示資訊：**
- 完整個人資料
- 所有發起和參與的專案
- 所有作品集
- 所有技能和社群連結
- 所有申請記錄（不限狀態）

**互動功能：**
- 可點擊專案連結查看專案詳情
- 可點擊作品集連結查看影片
- 可查看申請記錄的詳細資訊

### 3. 查詢專案完整資訊

**查詢範圍：**
- 所有專案（不限狀態）
- 可查看已刪除或完成的專案

**顯示資訊：**
- 完整專案基本資料
- 所有成員名單與位置分配（包括已填滿和空缺）
- 所有申請記錄（包括等待、接受、拒絕、取消）
- 完整練習時間表
- 專案進度資訊
- 最終成果（如果有）

**特殊功能：**
- 可查看所有申請記錄（一般使用者只能看到等待審核的）
- 可查看專案的完整歷史記錄

### 4. 查詢平台營運統計數據

**統計項目：**

1. **使用者統計：**
   - 總註冊數
   - 活躍使用者數（定義：最近30天有登入）
   - 地區分布（圓餅圖）
   - 性別分布（圓餅圖）
   - 註冊趨勢（折線圖，依時間）

2. **專案統計：**
   - 總專案數
   - 各狀態專案數（圓餅圖）
   - 專案建立趨勢（折線圖）
   - 專案完成率

3. **歌曲統計：**
   - 熱門翻跳歌曲 Top 10（長條圖）
   - 歌曲難度分布
   - 團體歌曲數量排行

4. **地區統計：**
   - 專案地區分布（圓餅圖）
   - 使用者地區分布（圓餅圖）

5. **規模統計：**
   - 專案人數規模分布（長條圖）
   - 平均專案人數

6. **完成率分析：**
   - 專案完成率
   - 平均完成時間
   - 完成時間分布

**視覺化建議：**
- 使用 Chart.js 或 Recharts
- 響應式設計，支援手機查看
- 可選擇時間範圍（最近7天、30天、90天、全部）

---

## 安全性考量

### 1. 權限檢查

**所有管理員頁面必須：**
- 檢查使用者是否已登入
- 檢查使用者角色是否為 'A'
- 非管理員訪問時導向首頁或顯示錯誤

**實作方式：**
- 在每個管理員頁面使用 `useAdminAuth` hook
- 或在 layout 中統一檢查

### 2. 資料驗證

**所有表單輸入必須：**
- 前端驗證（即時回饋）
- 後端驗證（Supabase 層級）
- 防止 SQL 注入（使用 Supabase 的參數化查詢）

### 3. 敏感操作確認

**重要操作需確認：**
- 刪除團體/歌曲：顯示確認對話框，列出影響範圍
- 刪除專案：顯示確認對話框
- 修改重要資料：顯示確認對話框

### 4. Row Level Security (RLS)

**建議在 Supabase 設定 RLS 政策：**
- 管理員可以讀取/寫入所有資料
- 一般使用者只能讀取/寫入自己的資料
- 專案資料依角色設定不同權限

**範例 RLS 政策：**
```sql
-- 管理員可以讀取所有使用者資料
CREATE POLICY "Admin can read all users"
ON USERS FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM USERS 
    WHERE u_id = auth.uid() AND role = 'A'
  )
);

-- 管理員可以更新所有使用者資料
CREATE POLICY "Admin can update all users"
ON USERS FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM USERS 
    WHERE u_id = auth.uid() AND role = 'A'
  )
);
```

---

## 實作優先順序

### 第一階段（核心功能）
1. ✅ 修改登入邏輯
2. ✅ 建立權限檢查機制
3. ✅ 建立管理員首頁
4. ✅ 建立管理員導航

### 第二階段（資料管理）
5. ✅ 實作團體管理（列表、新增、編輯）
6. ✅ 實作歌曲管理（列表、新增、編輯）

### 第三階段（查詢功能）
7. ✅ 實作用戶查詢功能
8. ✅ 實作專案查詢功能

### 第四階段（統計分析）
9. ✅ 實作統計數據功能
10. ✅ 加入圖表視覺化

### 第五階段（優化）
11. ✅ 加入搜尋和篩選功能
12. ✅ 加入分頁功能
13. ✅ 優化 UI/UX
14. ✅ 加入 RLS 政策

---

## 測試檢查清單

### 登入與權限
- [ ] 管理員可以登入並導向 /admin
- [ ] 一般使用者登入導向首頁
- [ ] 一般使用者無法訪問 /admin 頁面
- [ ] 管理員可以訪問一般使用者頁面（可選）

### 團體管理
- [ ] 可以新增團體
- [ ] 可以編輯團體
- [ ] 可以刪除團體（無關聯時）
- [ ] 刪除有關聯的團體時顯示警告
- [ ] 搜尋和篩選功能正常

### 歌曲管理
- [ ] 可以新增歌曲
- [ ] 可以編輯歌曲
- [ ] 可以管理團體/偶像關聯
- [ ] 可以刪除歌曲
- [ ] 搜尋和篩選功能正常

### 使用者查詢
- [ ] 可以查看所有使用者列表
- [ ] 可以查看使用者詳情
- [ ] 可以查看使用者的所有活動記錄
- [ ] 搜尋功能正常

### 專案查詢
- [ ] 可以查看所有專案列表
- [ ] 可以查看專案完整資訊
- [ ] 可以查看所有申請記錄
- [ ] 搜尋和篩選功能正常

### 統計數據
- [ ] 所有統計數據正確顯示
- [ ] 圖表正常顯示
- [ ] 時間範圍篩選功能正常

---

## 注意事項

1. **資料完整性：**
   - 刪除操作前務必檢查外鍵約束
   - 考慮使用軟刪除（標記為已刪除）而非直接刪除
   - 重要資料刪除前備份

2. **效能優化：**
   - 大量資料查詢時使用分頁
   - 複雜查詢考慮建立索引
   - 統計數據可考慮快取

3. **使用者體驗：**
   - 所有操作提供即時回饋
   - 錯誤訊息清楚明確
   - 載入狀態顯示

4. **維護性：**
   - 程式碼註解清楚
   - 函數職責單一
   - 可重用組件

---

## 後續擴充建議

1. **操作記錄：**
   - 記錄管理員的所有操作
   - 建立操作日誌表

2. **批次操作：**
   - 批次匯入團體/歌曲資料
   - 批次匯出資料

3. **進階統計：**
   - 使用者行為分析
   - 專案成功率分析
   - 熱門時段分析

4. **通知系統：**
   - 異常活動通知
   - 定期統計報告

---

## 完成標準

實作完成後應滿足以下條件：

1. ✅ 管理員可以登入並訪問管理頁面
2. ✅ 可以完整管理團體和歌曲資料
3. ✅ 可以查詢所有使用者和專案資訊
4. ✅ 可以查看平台統計數據
5. ✅ 所有功能都有適當的權限檢查
6. ✅ UI/UX 清晰易用
7. ✅ 錯誤處理完善

---

**文件版本：** 1.0  
**最後更新：** 2024-12-XX  
**維護者：** 開發團隊

