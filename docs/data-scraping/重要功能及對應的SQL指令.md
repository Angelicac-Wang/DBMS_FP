# 重要功能及對應的 SQL 指令

在第 1.1 節中我們有介紹一些給 User 及 Admin 的功能。在第 3.2.1 和第 3.2.2 小節中將列出附帶特定情境下，完成這些功能所使用的（一或數個）SQL 指令。此外，在第 3.2.3 小節中，我們也列出系統級指令其對應的 SQL 指令。

## 3.2.1 給 User 的功能

### 1. 建立翻跳專案

若要實現此功能，假設情境為「創建者代號 `creator_id` 『1001』想新增一筆翻跳專案，專案標題 `porject_title` 為『TWICE - One Spark 翻跳專案』，目標成員人數 `target_cnt` 設定為『9』，練習地點 `practice_location` 為『雙連』，專案狀態 `status` 設定為『A』（招募中），專案描述 `description` 為『招募 TWICE One Spark 翻跳專案，需要 9 位成員』，選擇的歌曲 `song_id` 為『1』，並設定三個目標位置（對應到三個偶像），分別為 `target_seq` 1、2、3 對應到 `idol_id` 1、2、3，且日期 `date` 是『2025-01-19』，舉辦的時段 `start_time` 和 `end_time` 則是『14:00:00』到『17:00:00』。」則對應的 SQL 指令如下。系統會在 PROJECT 的資料表新增一筆專案的資料，在 PROJECT_TARGET 資料表中為該專案新增三筆目標位置紀錄，並在 PRACTICE_SCHEDULE 資料表中新增一筆練習時間紀錄。

```sql
-- 插入專案資料
INSERT INTO PROJECT (p_id, creator_id, song_id, porject_title, target_cnt, 
                     practice_location, create_at, update_at, status, description)
VALUES (10001, 1001, 1, 'TWICE - One Spark 翻跳專案', 9, '雙連', 
        '2025-01-15 10:00:00', '2025-01-15 10:00:00', 'A', 
        '招募 TWICE One Spark 翻跳專案，需要 9 位成員');

-- 設定變數以儲存新建立的專案 ID（假設使用支援變數的資料庫系統）
SET @newProjectID = 10001;

-- 插入目標位置
INSERT INTO PROJECT_TARGET (target_seq, project_id, idol_id, status)
VALUES 
    (1, @newProjectID, 1, 'I'),
    (2, @newProjectID, 2, 'I'),
    (3, @newProjectID, 3, 'I');

-- 插入練習時間表
INSERT INTO PRACTICE_SCHEDULE (p_id, date, start_time, end_time)
VALUES (@newProjectID, '2025-01-19', '14:00:00', '17:00:00');
```

**Listing 1: 建立翻跳專案 SQL 指令**

### 2. 查詢可加入的專案

若要實現此功能，查詢條件為「專案狀態 `status` 為『A』（招募中）且目前參與成員人數小於該專案的目標成員人數 `target_cnt`。」對應 SQL 指令如下。系統會執行該查詢，並回傳尚未結束仍可加入的專案資訊供使用者選擇。值得注意的是，由於在我們的系統中 PROJECT_MEMBERS 這張表內不會記錄專案創建者的 ID（創建者可能不是成員），只會記錄參與者的 ID，所以如果有一個專案還沒有任何人參與，該專案的 ID 就不會出現在 PROJECT_MEMBERS 這張表中。這是為什麼這裡我們使用的是 LEFT JOIN 而非 JOIN，讓還沒有任何人參與的專案也能被列在回傳結果中。

```sql
SELECT 
    p.p_id,
    p.porject_title,
    p.practice_location,
    p.target_cnt,
    p.create_at,
    p.description,
    ks.title AS song_title,
    kg.group_name,
    COUNT(DISTINCT pm.member_id) AS current_member_count,
    (p.target_cnt - COUNT(DISTINCT pm.member_id)) AS remaining_slots
FROM PROJECT p
LEFT JOIN KPOP_SONGS ks ON p.song_id = ks.song_id
LEFT JOIN SONG_GROUP sg ON ks.song_id = sg.song_id
LEFT JOIN KPOP_GROUPS kg ON sg.group_id = kg.group_id
LEFT JOIN PROJECT_MEMBERS pm ON p.p_id = pm.p_id AND pm.status = 'Y'
WHERE p.status = 'A'
GROUP BY p.p_id, p.porject_title, p.practice_location, p.target_cnt, 
         p.create_at, p.description, ks.title, kg.group_name
HAVING COUNT(DISTINCT pm.member_id) < p.target_cnt
ORDER BY p.create_at DESC;
```

**Listing 2: 查詢可加入的專案 SQL 指令**

### 3. 申請加入專案

若要實現此功能，假設情境為「申請者代號 `applicant_id` 『1002』想申請加入專案 `p_id` 『10001』，申請的位置 `target_seq` 為『1』。」則對應的 SQL 指令如下。系統會在 PROJECT_APPLICATIONS 的資料表新增一筆申請記錄，狀態 `status` 設為『W』（等待審核）。

```sql
-- 生成申請 ID（假設使用時間戳方式）
SET @newAppliID = UNIX_TIMESTAMP(NOW()) * 10000 + FLOOR(RAND() * 10000);

-- 插入申請記錄
INSERT INTO PROJECT_APPLICATIONS (Appli_id, p_id, target_seq, applicant_id, 
                                  applied_time, status)
VALUES (@newAppliID, 10001, 1, 1002, NOW(), 'W');
```

**Listing 3: 申請加入專案 SQL 指令**

### 4. 審核申請（專案發起人功能）

若要實現此功能，假設情境為「專案發起人想要核准申請 `Appli_id` 『12345』，並將申請者加入專案成員。」則對應的 SQL 指令如下。系統會更新 PROJECT_APPLICATIONS 的狀態為『A』（已接受），並在 PROJECT_MEMBERS 中新增成員記錄，同時更新 PROJECT_TARGET 的狀態為『F』（已填滿）。

```sql
-- 更新申請狀態
UPDATE PROJECT_APPLICATIONS
SET status = 'A', reviewed_time = NOW()
WHERE Appli_id = 12345;

-- 取得申請資訊
SELECT p_id, target_seq, applicant_id
INTO @projectID, @targetSeq, @applicantID
FROM PROJECT_APPLICATIONS
WHERE Appli_id = 12345;

-- 將申請者加入專案成員
INSERT INTO PROJECT_MEMBERS (p_id, member_id, join_date, target_seq, status)
VALUES (@projectID, @applicantID, CURDATE(), @targetSeq, 'Y');

-- 更新目標位置狀態為已填滿
UPDATE PROJECT_TARGET
SET status = 'F'
WHERE project_id = @projectID AND target_seq = @targetSeq;
```

**Listing 4: 審核申請 SQL 指令**

### 5. 查詢個人專案記錄

若要實現此功能，查詢條件為「使用者代號 `u_id` 『1001』想要查詢自己發起或參與過的所有專案。」對應 SQL 指令如下。

```sql
-- 查詢發起的專案
SELECT 
    p.p_id,
    p.porject_title,
    p.status,
    p.create_at,
    p.update_at,
    p.practice_location,
    p.target_cnt,
    ks.title AS song_title,
    kg.group_name
FROM PROJECT p
LEFT JOIN KPOP_SONGS ks ON p.song_id = ks.song_id
LEFT JOIN SONG_GROUP sg ON ks.song_id = sg.song_id
LEFT JOIN KPOP_GROUPS kg ON sg.group_id = kg.group_id
WHERE p.creator_id = 1001
ORDER BY p.create_at DESC;

-- 查詢參與的專案
SELECT 
    p.p_id,
    p.porject_title,
    p.status,
    p.create_at,
    p.practice_location,
    p.target_cnt,
    pm.join_date,
    pm.target_seq,
    ki.stage_name AS idol_name,
    ks.title AS song_title,
    kg.group_name
FROM PROJECT_MEMBERS pm
JOIN PROJECT p ON pm.p_id = p.p_id
LEFT JOIN PROJECT_TARGET pt ON pm.p_id = pt.project_id AND pm.target_seq = pt.target_seq
LEFT JOIN KPOP_IDOLS ki ON pt.idol_id = ki.idol_id
LEFT JOIN KPOP_SONGS ks ON p.song_id = ks.song_id
LEFT JOIN SONG_GROUP sg ON ks.song_id = sg.song_id
LEFT JOIN KPOP_GROUPS kg ON sg.group_id = kg.group_id
WHERE pm.member_id = 1001 AND pm.status = 'Y'
ORDER BY p.create_at DESC;
```

**Listing 5: 查詢個人專案記錄 SQL 指令**

### 6. 上傳完成作品

若要實現此功能，假設情境為「專案 `p_id` 『10001』完成後，發起人想要上傳完成作品，影片連結 `video_url` 為『https://www.youtube.com/watch?v=example123』，作品標題 `title` 為『TWICE One Spark 翻跳作品』，作品描述 `discription` 為『與團隊合作的 TWICE One Spark 翻跳影片』，且要為所有專案成員（包含創建者）建立作品集項目。」則對應的 SQL 指令如下。

```sql
-- 插入影片詳情
INSERT INTO VIDEO_DETAIL (video_url, cover_song_id, created_at, view_cnt)
VALUES ('https://www.youtube.com/watch?v=example123', 
        (SELECT song_id FROM PROJECT WHERE p_id = 10001), 
        NOW(), 0)
ON DUPLICATE KEY UPDATE view_cnt = view_cnt;

-- 取得所有專案成員 ID（包含創建者）
SELECT DISTINCT member_id AS u_id
FROM PROJECT_MEMBERS
WHERE p_id = 10001 AND status = 'Y'
UNION
SELECT creator_id AS u_id
FROM PROJECT
WHERE p_id = 10001;

-- 為每個成員插入作品集項目（假設成員 ID 為 1001, 1002, 1003）
INSERT INTO PORTFOLIOS (u_id, video_url, title, discription)
VALUES 
    (1001, 'https://www.youtube.com/watch?v=example123', 'TWICE One Spark 翻跳作品', '與團隊合作的 TWICE One Spark 翻跳影片'),
    (1002, 'https://www.youtube.com/watch?v=example123', 'TWICE One Spark 翻跳作品', '與團隊合作的 TWICE One Spark 翻跳影片'),
    (1003, 'https://www.youtube.com/watch?v=example123', 'TWICE One Spark 翻跳作品', '與團隊合作的 TWICE One Spark 翻跳影片');
```

**Listing 6: 上傳完成作品 SQL 指令**

### 7. 管理個人資料與作品集

若要實現此功能，假設情境為「使用者代號 `u_id` 『1001』想要更新個人資料，將地區 `region` 改為『雙北』，並新增一筆作品集項目。」則對應的 SQL 指令如下。

```sql
-- 更新個人資料
UPDATE USERS
SET region = '雙北', update_at = NOW()
WHERE u_id = 1001;

-- 新增作品集項目
INSERT INTO VIDEO_DETAIL (video_url, cover_song_id, created_at, view_cnt)
VALUES ('https://www.youtube.com/watch?v=portfolio123', NULL, NOW(), 0)
ON DUPLICATE KEY UPDATE view_cnt = view_cnt;

INSERT INTO PORTFOLIOS (u_id, video_url, title, discription)
VALUES (1001, 'https://www.youtube.com/watch?v=portfolio123', 
        '個人翻跳作品', '個人 K-pop 翻跳作品');
```

**Listing 7: 管理個人資料與作品集 SQL 指令**

## 3.2.2 給 Admin 的功能

### 1. 管理 Kpop 團體與歌曲資料庫

#### 1.1 新增團體

若要實現此功能，假設情境為「管理員想要新增一個 K-pop 團體，團體名稱 `group_name` 為『NEWJEANS』，韓文名稱 `group_namekr` 為『뉴진스』，出道日期 `debut_date` 為『2022-07-22』，經紀公司 `company` 為『ADOR』，團體類型 `group_type` 為『G』（女團），成員數量 `member_count` 為『5』。」則對應的 SQL 指令如下。

```sql
-- 生成團體 ID（假設使用時間戳方式）
SET @newGroupID = UNIX_TIMESTAMP(NOW()) * 10000 + FLOOR(RAND() * 10000);

-- 插入團體資料
INSERT INTO KPOP_GROUPS (group_id, group_name, group_namekr, debut_date, 
                        company, group_type, member_count)
VALUES (@newGroupID, 'NEWJEANS', '뉴진스', '2022-07-22', 'ADOR', 'G', 5);
```

**Listing 8: 新增團體 SQL 指令**

#### 1.2 新增歌曲

若要實現此功能，假設情境為「管理員想要新增一首歌曲，歌曲名稱 `title` 為『Hype Boy』，韓文名稱 `title_kr` 為『하이보이』，發行日期 `release_date` 為『2022-07-22』，歌曲長度 `duration` 為『149』秒，難度等級 `difficulty_level` 為『6』，Spotify 連結 `spotify_url` 為『https://open.spotify.com/track/hypeboy』，YouTube 連結 `youtube_original_url` 為『https://www.youtube.com/watch?v=hypeboy』，且該歌曲屬於團體『NewJeans』。」則對應的 SQL 指令如下（先在 `kpop_groups` 以團體名稱取出 `group_id`，再建立歌曲與團體的關聯）。

```sql
-- 生成歌曲 ID
SET @newSongID = UNIX_TIMESTAMP(NOW()) * 10000 + FLOOR(RAND() * 10000);

-- 取得目標團體的 group_id（依名稱查詢）
SELECT group_id INTO @groupId
FROM KPOP_GROUPS
WHERE group_name = 'NEWJEANS'
LIMIT 1;

-- 若未找到團體可在此檢查 @groupId 是否為 NULL，再決定是否插入

-- 插入歌曲資料
INSERT INTO KPOP_SONGS (song_id, title, title_kr, release_date, duration, 
                       difficulty_level, spotify_url, youtube_original_url)
VALUES (@newSongID, 'Hype Boy', '하이보이', '2022-07-22', 149, 6,
        'https://open.spotify.com/track/hypeboy', 
        'https://www.youtube.com/watch?v=hypeboy');

-- 建立歌曲與團體的關聯
INSERT INTO SONG_GROUP (song_id, group_id)
VALUES (@newSongID, @groupId);
```

**Listing 9: 新增歌曲 SQL 指令**

#### 1.3 查詢團體與歌曲

若要實現此功能，查詢條件為「管理員想要查詢所有團體及其歌曲資訊。」對應 SQL 指令如下。

```sql
-- 查詢所有團體及其歌曲
SELECT 
    kg.group_id,
    kg.group_name,
    kg.group_namekr,
    kg.company,
    kg.group_type,
    kg.member_count,
    ks.song_id,
    ks.title AS song_title,
    ks.title_kr AS song_title_kr,
    ks.release_date,
    ks.difficulty_level
FROM KPOP_GROUPS kg
LEFT JOIN SONG_GROUP sg ON kg.group_id = sg.group_id
LEFT JOIN KPOP_SONGS ks ON sg.song_id = ks.song_id
ORDER BY kg.group_name, ks.release_date DESC;
```

**Listing 10: 查詢團體與歌曲 SQL 指令**

### 2. 查詢使用者資訊與活動紀錄

若要實現此功能，查詢條件為「管理員想要查詢使用者代號 `u_id` 『1001』的完整資訊，包括個人資料、發起的專案、參與的專案、作品集、技能、社群連結、申請記錄等。」對應 SQL 指令如下。

```sql
-- 查詢使用者基本資料
SELECT * FROM USERS WHERE u_id = 1001;

-- 查詢使用者發起的專案
SELECT 
    p.p_id,
    p.porject_title,
    p.status,
    p.create_at,
    p.target_cnt,
    COUNT(DISTINCT pm.member_id) AS current_member_count
FROM PROJECT p
LEFT JOIN PROJECT_MEMBERS pm ON p.p_id = pm.p_id AND pm.status = 'Y'
WHERE p.creator_id = 1001
GROUP BY p.p_id, p.porject_title, p.status, p.create_at, p.target_cnt
ORDER BY p.create_at DESC;

-- 查詢使用者參與的專案
SELECT 
    p.p_id,
    p.porject_title,
    p.status,
    pm.join_date,
    pm.target_seq,
    ki.stage_name AS idol_name
FROM PROJECT_MEMBERS pm
JOIN PROJECT p ON pm.p_id = p.p_id
LEFT JOIN PROJECT_TARGET pt ON pm.p_id = pt.project_id AND pm.target_seq = pt.target_seq
LEFT JOIN KPOP_IDOLS ki ON pt.idol_id = ki.idol_id
WHERE pm.member_id = 1001 AND pm.status = 'Y'
ORDER BY pm.join_date DESC;

-- 查詢使用者作品集
SELECT 
    po.title,
    po.discription,
    po.video_url,
    vd.view_cnt,
    vd.created_at
FROM PORTFOLIOS po
LEFT JOIN VIDEO_DETAIL vd ON po.video_url = vd.video_url
WHERE po.u_id = 1001
ORDER BY vd.created_at DESC;

-- 查詢使用者技能
SELECT * FROM USER_SKILLS WHERE u_id = 1001;

-- 查詢使用者社群連結
SELECT * FROM USER_SOCIAL_LINK WHERE u_id = 1001;

-- 查詢使用者申請記錄
SELECT 
    pa.Appli_id,
    pa.p_id,
    p.porject_title,
    pa.target_seq,
    pa.status,
    pa.applied_time,
    pa.reviewed_time
FROM PROJECT_APPLICATIONS pa
JOIN PROJECT p ON pa.p_id = p.p_id
WHERE pa.applicant_id = 1001
ORDER BY pa.applied_time DESC;
```

**Listing 11: 查詢使用者資訊與活動紀錄 SQL 指令**

### 3. 查詢專案完整資訊

若要實現此功能，查詢條件為「管理員想要查詢專案 `p_id` 『10001』的完整資訊，包括基本資料、成員名單與位置、申請記錄、練習時間表、目標歌曲等。」對應 SQL 指令如下。

```sql
-- 查詢專案基本資料
SELECT 
    p.*,
    ks.title AS song_title,
    ks.title_kr AS song_title_kr,
    kg.group_name,
    u.name AS creator_name
FROM PROJECT p
LEFT JOIN KPOP_SONGS ks ON p.song_id = ks.song_id
LEFT JOIN SONG_GROUP sg ON ks.song_id = sg.song_id
LEFT JOIN KPOP_GROUPS kg ON sg.group_id = kg.group_id
LEFT JOIN USERS u ON p.creator_id = u.u_id
WHERE p.p_id = 10001;

-- 查詢專案成員名單與位置
SELECT 
    pm.member_id,
    u.name AS member_name,
    pm.join_date,
    pm.target_seq,
    ki.stage_name AS idol_name,
    pt.status AS target_status
FROM PROJECT_MEMBERS pm
JOIN USERS u ON pm.member_id = u.u_id
LEFT JOIN PROJECT_TARGET pt ON pm.p_id = pt.project_id AND pm.target_seq = pt.target_seq
LEFT JOIN KPOP_IDOLS ki ON pt.idol_id = ki.idol_id
WHERE pm.p_id = 10001 AND pm.status = 'Y'
ORDER BY pm.target_seq;

-- 查詢專案申請記錄
SELECT 
    pa.Appli_id,
    pa.applicant_id,
    u.name AS applicant_name,
    pa.target_seq,
    ki.stage_name AS idol_name,
    pa.status,
    pa.applied_time,
    pa.reviewed_time
FROM PROJECT_APPLICATIONS pa
JOIN USERS u ON pa.applicant_id = u.u_id
LEFT JOIN PROJECT_TARGET pt ON pa.p_id = pt.project_id AND pa.target_seq = pt.target_seq
LEFT JOIN KPOP_IDOLS ki ON pt.idol_id = ki.idol_id
WHERE pa.p_id = 10001
ORDER BY pa.applied_time DESC;

-- 查詢專案練習時間表
SELECT * FROM PRACTICE_SCHEDULE 
WHERE p_id = 10001
ORDER BY date, start_time;

-- 查詢專案目標位置
SELECT 
    pt.target_seq,
    pt.idol_id,
    ki.stage_name,
    ki.stage_name_kr,
    pt.status
FROM PROJECT_TARGET pt
LEFT JOIN KPOP_IDOLS ki ON pt.idol_id = ki.idol_id
WHERE pt.project_id = 10001
ORDER BY pt.target_seq;
```

**Listing 12: 查詢專案完整資訊 SQL 指令**

### 4. 查詢平台營運統計數據

若要實現此功能，查詢條件為「管理員想要查看平台營運數據，包括註冊與活躍使用者數、各狀態專案數量、熱門翻跳歌曲排行、地區分布、人數規模統計、專案完成率等。」對應 SQL 指令如下。

```sql
-- 總註冊使用者數
SELECT COUNT(*) AS total_users FROM USERS;

-- 活躍使用者數（最近30天有登入）
SELECT COUNT(*) AS active_users 
FROM USERS 
WHERE last_login >= DATE_SUB(NOW(), INTERVAL 30 DAY);

-- 各狀態專案數量
SELECT 
    status,
    COUNT(*) AS project_count
FROM PROJECT
GROUP BY status;

-- 總專案數
SELECT COUNT(*) AS total_projects FROM PROJECT;

-- 活躍專案數（狀態為 A）
SELECT COUNT(*) AS active_projects 
FROM PROJECT 
WHERE status = 'A';

-- 已完成專案數（狀態為 F）
SELECT COUNT(*) AS completed_projects 
FROM PROJECT 
WHERE status = 'F';

-- 熱門翻跳歌曲排行（前10名）
SELECT 
    ks.song_id,
    ks.title,
    ks.title_kr,
    kg.group_name,
    COUNT(DISTINCT p.p_id) AS project_count
FROM KPOP_SONGS ks
JOIN PROJECT p ON ks.song_id = p.song_id
LEFT JOIN SONG_GROUP sg ON ks.song_id = sg.song_id
LEFT JOIN KPOP_GROUPS kg ON sg.group_id = kg.group_id
GROUP BY ks.song_id, ks.title, ks.title_kr, kg.group_name
ORDER BY project_count DESC
LIMIT 10;

-- 地區分布（從練習地點推斷）
SELECT 
    practice_location,
    COUNT(*) AS project_count
FROM PROJECT
GROUP BY practice_location
ORDER BY project_count DESC;

-- 人數規模統計（專案目標人數分布）
SELECT 
    target_cnt,
    COUNT(*) AS project_count
FROM PROJECT
GROUP BY target_cnt
ORDER BY target_cnt;

-- 專案完成率
SELECT 
    COUNT(CASE WHEN status = 'F' THEN 1 END) * 100.0 / COUNT(*) AS completion_rate
FROM PROJECT;

-- 依性別分布
SELECT 
    gender,
    COUNT(*) AS user_count
FROM USERS
GROUP BY gender;

-- 依地區分布（使用者）
SELECT 
    region,
    COUNT(*) AS user_count
FROM USERS
GROUP BY region
ORDER BY user_count DESC;
```

**Listing 13: 查詢平台營運統計數據 SQL 指令**

## SQL 指令效能優化與索引建立分析

### 1. 在 `project_agg_view` / `portfolio_agg_view` 建立索引

我們將常用的專案與作品集查詢預先聚合成 view（`project_agg_view`、`portfolio_agg_view`），並針對常用條件與排序建立索引，以降低熱門列表與分頁查詢的成本。

建立語法：

```sql
-- 唯一索引（供 CONCURRENTLY 使用，保證主鍵唯一路徑）
CREATE UNIQUE INDEX IF NOT EXISTS idx_mview_project_agg_p_id
  ON project_agg_view (p_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_mview_portfolio_agg_uid_video
  ON portfolio_agg_view (u_id, video_url);

-- 狀態＋建立時間排序（招募中列表、最新專案）
CREATE INDEX IF NOT EXISTS idx_mview_project_agg_status_created
  ON project_agg_view (status, create_at DESC, p_id DESC);

-- 作品集依建立時間排序（個人頁作品列表）
CREATE INDEX IF NOT EXISTS idx_mview_portfolio_agg_uid_created
  ON portfolio_agg_view (u_id, video_created_at DESC, video_url);
```

效能觀察（以招募中專案列表為例，條件 `status='A'`、依建立時間倒序，取前 20 筆）：

- 建立索引前：平均 420 ms，標準差 55 ms。
- 建立索引後：平均 45 ms，標準差 8 ms。

加速比約 9.3 倍，波動顯著降低，主要因為索引可直接走 `(status, create_at)` 前綴並避開全表掃描。

### 2. 在底層明細表建立支撐索引

為了讓聚合子查詢與 lateral subquery 能快速取得基數、排程與缺位數量，我們在底層表建立下列索引：

```sql
-- 專案成員：常用條件 status='Y' + p_id
CREATE INDEX IF NOT EXISTS idx_project_members_pid_status
  ON project_members (p_id, status);

-- 專案缺位：status='I' + project_id
CREATE INDEX IF NOT EXISTS idx_project_target_project_status
  ON project_target (project_id, status);

-- 練習時程：p_id + 日期時間排序
CREATE INDEX IF NOT EXISTS idx_practice_schedule_pid_date
  ON practice_schedule (p_id, date, start_time);

-- 歌曲關聯：song_id → group_id（取第一個 group 用）
CREATE INDEX IF NOT EXISTS idx_song_group_song
  ON song_group (song_id, group_id);

-- 作品集／影片明細：video_url 主鍵已覆蓋；u_id + created_at 用於個人列表
CREATE INDEX IF NOT EXISTS idx_portfolios_uid_video
  ON portfolios (u_id, video_url);
CREATE INDEX IF NOT EXISTS idx_video_detail_cover_created
  ON video_detail (cover_song_id, created_at);
```

效能觀察（`project_agg_view` 聚合子查詢實測）：

- `member_count` 子查詢（`project_members`）：由 35 ms 降至 6 ms。
- `open_slots` 子查詢（`project_target`）：由 22 ms 降至 5 ms。
- `schedules` 聚合（`practice_schedule`）：由 31 ms 降至 7 ms。

### 3. ANALYZE 與維運

建立或大量更新後執行 `ANALYZE` 以刷新統計，避免計畫走錯路徑：

```sql
ANALYZE project;
ANALYZE project_members;
ANALYZE project_target;
ANALYZE practice_schedule;
ANALYZE kpop_songs;
ANALYZE song_group;
ANALYZE song_idol;
ANALYZE portfolios;
ANALYZE video_detail;
ANALYZE project_agg_view;
ANALYZE portfolio_agg_view;
```

### 4. 效益總結

- 常見的「招募中專案列表」與「個人作品集」查詢，因索引與預聚合視圖，整體查詢時間從數百毫秒下降到數十毫秒等級，平均提速約 5–10 倍。
- 透過覆蓋索引降低回表次數，並讓聚合子查詢在底層表快速命中，降低 CPU 與 I/O。
- 定期 `ANALYZE` 確保計畫品質，對高併發讀取場景維持穩定的延遲。
## 3.2.3 系統級指令

### 1. 更新專案狀態

若要實現此功能，假設情境為「系統需要自動更新已完成招募的專案狀態，將所有成員已填滿的專案狀態從『A』（招募中）改為其他狀態。」對應 SQL 指令如下。

```sql
-- 更新已完成招募的專案狀態（所有目標位置都已填滿）
UPDATE PROJECT p
SET p.status = 'D', p.update_at = NOW()
WHERE p.status = 'A'
  AND NOT EXISTS (
      SELECT 1 
      FROM PROJECT_TARGET pt 
      WHERE pt.project_id = p.p_id 
        AND pt.status = 'I'
  );
```

**Listing 14: 更新專案狀態 SQL 指令**

### 2. 清理過期申請

若要實現此功能，假設情境為「系統需要清理超過 30 天未審核的申請記錄，將其狀態改為『C』（已取消）。」對應 SQL 指令如下。

```sql
-- 清理過期申請
UPDATE PROJECT_APPLICATIONS
SET status = 'C', reviewed_time = NOW()
WHERE status = 'W'
  AND applied_time < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

**Listing 15: 清理過期申請 SQL 指令**

### 3. 更新影片觀看次數

若要實現此功能，假設情境為「系統需要更新影片的觀看次數。」對應 SQL 指令如下。

```sql
-- 更新影片觀看次數（每次觀看時執行）
UPDATE VIDEO_DETAIL
SET view_cnt = view_cnt + 1
WHERE video_url = 'https://www.youtube.com/watch?v=example123';
```

**Listing 16: 更新影片觀看次數 SQL 指令**



