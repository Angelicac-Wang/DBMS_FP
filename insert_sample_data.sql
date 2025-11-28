-- 插入測試資料
-- 注意：請按照順序執行，因為有外鍵約束

-- 1. KPOP_GROUPS (K-pop 團體)
INSERT INTO KPOP_GROUPS (group_id, group_name, group_namekr, debut_date, company, group_type, member_count, logo_image, discription) VALUES
(1, 'TWICE', '트와이스', '2015-10-20', 'JYP Entertainment', 'G', 9, 'https://example.com/twice_logo.jpg', 'JYP Entertainment旗下九人女子團體'),
(2, 'Aespa', '에스파', '2020-11-17', 'SM Entertainment', 'G', 4, 'https://example.com/aespa_logo.jpg', 'SM Entertainment旗下四人女子團體'),
(3, 'BLACKPINK', '블랙핑크', '2016-08-08', 'YG Entertainment', 'G', 4, 'https://example.com/blackpink_logo.jpg', 'YG Entertainment旗下四人女子團體');

-- 2. KPOP_IDOLS (K-pop 偶像)
INSERT INTO KPOP_IDOLS (idol_id, group_id, nationality, stage_name, stage_name_kr, debut_date) VALUES
-- TWICE 成員
(1, 1, 'South Korea', 'Nayeon', '나연', '2015-10-20'),
(2, 1, 'South Korea', 'Jeongyeon', '정연', '2015-10-20'),
(3, 1, 'Japan', 'Momo', '모모', '2015-10-20'),
(4, 1, 'South Korea', 'Sana', '사나', '2015-10-20'),
(5, 1, 'Japan', 'Mina', '미나', '2015-10-20'),
(6, 1, 'South Korea', 'Dahyun', '다현', '2015-10-20'),
(7, 1, 'South Korea', 'Chaeyoung', '채영', '2015-10-20'),
(8, 1, 'South Korea', 'Tzuyu', '쯔위', '2015-10-20'),
(9, 1, 'South Korea', 'Jihyo', '지효', '2015-10-20'),
-- Aespa 成員
(10, 2, 'South Korea', 'Karina', '카리나', '2020-11-17'),
(11, 2, 'China', 'Winter', '윈터', '2020-11-17'),
(12, 2, 'South Korea', 'Giselle', '지젤', '2020-11-17'),
(13, 2, 'China', 'Ningning', '닝닝', '2020-11-17'),
-- BLACKPINK 成員
(14, 3, 'Thailand', 'Lisa', '리사', '2016-08-08'),
(15, 3, 'South Korea', 'Jennie', '제니', '2016-08-08'),
(16, 3, 'New Zealand', 'Rosé', '로제', '2016-08-08'),
(17, 3, 'South Korea', 'Jisoo', '지수', '2016-08-08');

-- 3. USERS (用戶)
INSERT INTO USERS (u_id, name, email, password, birthdate, gender, region, phone, status, create_at, last_login, role) VALUES
(1001, '王小明', 'wang@example.com', 'password123', '1998-05-15', 'B', '雙北', '0912345678', 'A', '2024-01-15 10:00:00', '2024-12-01 09:00:00', 'U'),
(1002, '李小美', 'li@example.com', 'password456', '2000-03-20', 'G', '雙北', '0923456789', 'A', '2024-02-10 14:30:00', '2024-12-01 10:30:00', 'U'),
(1003, '張小華', 'zhang@example.com', 'password789', '1999-08-12', 'G', '台中', '0934567890', 'A', '2024-03-05 16:45:00', '2024-12-01 11:15:00', 'U'),
(1004, '陳小強', 'chen@example.com', 'password101', '1997-11-08', 'B', '雙北', '0945678901', 'A', '2024-03-20 09:00:00', '2024-12-01 08:30:00', 'U'),
(1005, '林小雅', 'lin@example.com', 'password202', '2001-02-14', 'G', '雙北', '0956789012', 'A', '2024-04-01 11:00:00', '2024-12-01 09:45:00', 'U'),
(1006, '黃小雯', 'huang@example.com', 'password303', '1999-07-22', 'G', '雙北', '0967890123', 'A', '2024-04-15 13:00:00', '2024-12-01 10:00:00', 'U'),
(1007, '吳小傑', 'wu@example.com', 'password404', '1998-09-30', 'B', '雙北', '0978901234', 'A', '2024-05-01 15:00:00', '2024-12-01 11:00:00', 'U');

-- 4. KPOP_SONGS (K-pop 歌曲)
INSERT INTO KPOP_SONGS (song_id, title, title_kr, release_date, duration, difficulty_level, spotify_url, youtube_original_url) VALUES
(1, 'One Spark', '원 스파크', '2024-02-23', 210, 7, 'https://open.spotify.com/track/one-spark', 'https://www.youtube.com/watch?v=one-spark'),
(2, 'Rich man', '리치맨', '2024-05-27', 195, 8, 'https://open.spotify.com/track/rich-man', 'https://www.youtube.com/watch?v=rich-man'),
(3, 'Jump', '점프', '2024-06-28', 185, 6, 'https://open.spotify.com/track/jump', 'https://www.youtube.com/watch?v=jump');

-- 5. SONG_GROUP (歌曲與團體關聯)
INSERT INTO SONG_GROUP (song_id, group_id) VALUES
(1, 1),  -- TWICE - One Spark
(2, 2),  -- Aespa - Rich man
(3, 3);  -- BLACKPINK - Jump

-- 6. SONG_IDOL (歌曲與偶像關聯)
INSERT INTO SONG_IDOL (song_id, idol_id) VALUES
-- TWICE - One Spark (所有成員)
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9),
-- Aespa - Rich man (所有成員)
(2, 10), (2, 11), (2, 12), (2, 13),
-- BLACKPINK - Jump (所有成員)
(3, 14), (3, 15), (3, 16), (3, 17);

-- 7. USER_SKILLS (用戶技能)
INSERT INTO USER_SKILLS (u_id, skill_type, proficiency_level, years_of_experience, discription) VALUES
(1001, '舞蹈', 85, 5, '擅長K-pop舞蹈，特別是TWICE和BLACKPINK的歌曲'),
(1001, '編舞', 70, 3, '有編舞經驗，曾參與多個翻跳專案'),
(1002, '舞蹈', 90, 6, '專業舞者，專精於女團舞蹈'),
(1002, '拍攝', 75, 4, '熟悉舞蹈影片拍攝和後製'),
(1003, '舞蹈', 80, 4, '擅長Aespa和NewJeans的舞蹈風格'),
(1003, '音樂', 65, 2, '了解K-pop音樂結構和節拍'),
(1004, '舞蹈', 75, 4, '專注於TWICE舞蹈風格'),
(1005, '舞蹈', 82, 5, '擅長多種K-pop團體舞蹈'),
(1006, '舞蹈', 78, 3, '熱愛K-pop舞蹈翻跳'),
(1007, '舞蹈', 80, 4, '有豐富的團體舞蹈經驗');

-- 8. USER_SOCIAL_LINK (用戶社群連結)
INSERT INTO USER_SOCIAL_LINK (url, u_id, platform, follower_cnt) VALUES
('https://www.instagram.com/wang_dancer', 1001, 'Instagram', 5000),
('https://www.youtube.com/@wang_dancer', 1001, 'YouTube', 12000),
('https://www.instagram.com/li_dancer', 1002, 'Instagram', 8000),
('https://www.tiktok.com/@li_dancer', 1002, 'TikTok', 15000),
('https://www.instagram.com/zhang_dancer', 1003, 'Instagram', 3000),
('https://www.youtube.com/@zhang_dancer', 1003, 'YouTube', 6000),
('https://www.instagram.com/chen_dancer', 1004, 'Instagram', 4000),
('https://www.instagram.com/lin_dancer', 1005, 'Instagram', 3500),
('https://www.instagram.com/huang_dancer', 1006, 'Instagram', 2800),
('https://www.instagram.com/wu_dancer', 1007, 'Instagram', 3200);

-- 9. VIDEO_DETAIL (影片詳情)
INSERT INTO VIDEO_DETAIL (video_url, cover_song_id, created_at, view_cnt) VALUES
('https://www.youtube.com/watch?v=cover1', 1, '2024-10-01 12:00:00', 50000),
('https://www.youtube.com/watch?v=cover2', 2, '2024-10-05 15:30:00', 35000),
('https://www.youtube.com/watch?v=cover3', 3, '2024-10-10 18:00:00', 42000);

-- 10. PORTFOLIOS (作品集)
INSERT INTO PORTFOLIOS (u_id, video_url, title, discription) VALUES
(1001, 'https://www.youtube.com/watch?v=cover1', 'TWICE翻跳作品', '與舞團合作的TWICE One Spark翻跳影片'),
(1002, 'https://www.youtube.com/watch?v=cover2', 'Aespa翻跳', '個人Aespa Rich man翻跳作品'),
(1003, 'https://www.youtube.com/watch?v=cover3', 'BLACKPINK翻跳', 'BLACKPINK Jump翻跳影片，展現個人風格');

-- 11. PROJECT (專案)
INSERT INTO PROJECT (p_id, creator_id, song_id, porject_title, target_cnt, practice_location, performance_location, create_at, update_at, status, discription) VALUES
(1, 1001, 1, 'TWICE - One Spark', 9, '雙連', '2025-10-25(五) 14:00 信義區微風廣場', '2024-09-01 10:00:00', '2024-10-15 09:00:00', 'A', '招募TWICE One Spark翻跳專案，需要9位成員，目前缺Sana和Mina位置'),
(2, 1002, 2, 'Aespa - Rich man', 4, '台中火車站', '2025-10-27(日) 10:00 台中歌劇院前廣場', '2024-09-05 14:00:00', '2024-10-20 10:00:00', 'A', 'Aespa Rich man翻跳專案，需要4位成員，目前缺Winter和Karina位置'),
(3, 1003, 3, 'BLACKPINK - Jump', 4, '台北車站', '2025-10-26(六) 13:00 西門町紅樓', '2024-09-10 16:00:00', '2024-10-18 11:00:00', 'A', 'BLACKPINK Jump翻跳專案，需要4位成員，目前缺Jennie和Rosé位置');

-- 12. PRACTICE_SCHEDULE (練習時間表)
INSERT INTO PRACTICE_SCHEDULE (p_id, date, start_time, end_time) VALUES
-- TWICE 專案練習時間
(1, '2025-10-15', '19:00:00', '21:00:00'),
(1, '2025-10-17', '19:00:00', '22:00:00'),
(1, '2025-10-20', '14:00:00', '17:00:00'),
-- Aespa 專案練習時間
(2, '2025-10-16', '18:30:00', '21:30:00'),
(2, '2025-10-18', '18:30:00', '21:00:00'),
(2, '2025-10-22', '19:00:00', '22:00:00'),
(2, '2025-10-24', '19:00:00', '21:00:00'),
-- BLACKPINK 專案練習時間
(3, '2025-10-14', '20:00:00', '22:30:00'),
(3, '2025-10-16', '20:00:00', '22:00:00'),
(3, '2025-10-19', '15:00:00', '18:00:00');

-- 13. PROJECT_TARGET (專案目標位置)
INSERT INTO PROJECT_TARGET (target_seq, project_id, idol_id, status) VALUES
-- TWICE 專案 (9個位置，其中2個空缺)
(1, 1, 1, 'F'),  -- Nayeon - 已填滿
(2, 1, 2, 'F'),  -- Jeongyeon - 已填滿
(3, 1, 3, 'F'),  -- Momo - 已填滿
(4, 1, 4, 'I'),  -- Sana - 空缺
(5, 1, 5, 'I'),  -- Mina - 空缺
(6, 1, 6, 'F'),  -- Dahyun - 已填滿
(7, 1, 7, 'F'),  -- Chaeyoung - 已填滿
(8, 1, 8, 'F'),  -- Tzuyu - 已填滿
(9, 1, 9, 'F'),  -- Jihyo - 已填滿
-- Aespa 專案 (4個位置，其中2個空缺)
(1, 2, 10, 'I'), -- Karina - 空缺
(2, 2, 11, 'I'), -- Winter - 空缺
(3, 2, 12, 'F'), -- Giselle - 已填滿
(4, 2, 13, 'F'), -- Ningning - 已填滿
-- BLACKPINK 專案 (4個位置，其中2個空缺)
(1, 3, 14, 'F'), -- Lisa - 已填滿
(2, 3, 15, 'I'), -- Jennie - 空缺
(3, 3, 16, 'I'), -- Rosé - 空缺
(4, 3, 17, 'F'); -- Jisoo - 已填滿

-- 14. PROJECT_MEMBERS (專案成員)
-- 注意：每個用戶在每個專案中只能有一個記錄（主鍵約束：p_id, member_id）
INSERT INTO PROJECT_MEMBERS (p_id, member_id, join_date, target_seq, status) VALUES
-- TWICE 專案成員 (7位已加入，缺Sana和Mina)
(1, 1001, '2024-09-05', 1, 'Y'),  -- 創建者擔任 Nayeon
(1, 1002, '2024-09-10', 2, 'Y'),  -- 擔任 Jeongyeon
(1, 1003, '2024-09-12', 3, 'Y'),  -- 擔任 Momo
(1, 1004, '2024-09-15', 6, 'Y'),  -- 用戶1004擔任 Dahyun
(1, 1005, '2024-09-18', 7, 'Y'),  -- 用戶1005擔任 Chaeyoung
(1, 1006, '2024-09-20', 8, 'Y'),  -- 用戶1006擔任 Tzuyu
(1, 1007, '2024-09-22', 9, 'Y'),  -- 用戶1007擔任 Jihyo
-- Aespa 專案成員 (2位已加入，缺Karina和Winter)
(2, 1002, '2024-09-08', 3, 'Y'),  -- 創建者擔任 Giselle
(2, 1003, '2024-09-12', 4, 'Y'),  -- 擔任 Ningning
-- BLACKPINK 專案成員 (2位已加入，缺Jennie和Rosé)
(3, 1003, '2024-09-15', 1, 'Y'),  -- 創建者擔任 Lisa
(3, 1001, '2024-09-20', 4, 'Y');  -- 擔任 Jisoo

-- 15. PROJECT_APPLICATIONS (專案申請)
INSERT INTO PROJECT_APPLICATIONS (Appli_id, p_id, target_seq, applicant_id, applied_time, reviewed_time, status) VALUES
(1, 1, 4, 1002, '2024-10-01 10:00:00', '2024-10-02 14:00:00', 'R'),  -- 申請Sana位置但被拒絕
(2, 1, 5, 1003, '2024-10-03 11:00:00', NULL, 'W'),  -- 申請Mina位置，等待審核
(3, 2, 1, 1001, '2024-10-05 09:00:00', NULL, 'W'),  -- 申請Karina位置，等待審核
(4, 2, 2, 1002, '2024-10-06 15:00:00', '2024-10-07 10:00:00', 'A'),  -- 申請Winter位置，已接受
(5, 3, 2, 1001, '2024-10-08 12:00:00', NULL, 'W'),  -- 申請Jennie位置，等待審核
(6, 3, 3, 1002, '2024-10-10 16:00:00', '2024-10-11 11:00:00', 'C');  -- 申請Rosé位置，已取消

