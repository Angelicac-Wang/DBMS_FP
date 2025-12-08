-- 效能優化 Indexes
-- 根據 API 查詢模式建立的索引

-- ============================================
-- Users 表 - 管理後台查詢優化
-- ============================================

-- 用於按 region 篩選使用者
CREATE INDEX IF NOT EXISTS idx_users_region ON users(region) WHERE region IS NOT NULL;

-- 用於按 status 篩選使用者
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- 用於按 gender 篩選使用者
CREATE INDEX IF NOT EXISTS idx_users_gender ON users(gender) WHERE gender IS NOT NULL;

-- 用於搜尋使用者名稱（支援 LIKE 查詢）
CREATE INDEX IF NOT EXISTS idx_users_name_trgm ON users USING gin(name gin_trgm_ops);

-- 用於搜尋使用者 email（支援 LIKE 查詢）
CREATE INDEX IF NOT EXISTS idx_users_email_trgm ON users USING gin(email gin_trgm_ops);

-- 複合索引：status + region（常見的組合查詢）
CREATE INDEX IF NOT EXISTS idx_users_status_region ON users(status, region) WHERE region IS NOT NULL;

-- ============================================
-- Projects 表 - 專案查詢優化
-- ============================================

-- 用於按 creator_id 查詢專案（找使用者的所有專案）
CREATE INDEX IF NOT EXISTS idx_project_creator_id ON project(creator_id);

-- 用於按 song_id 查詢專案（找使用某首歌的所有專案）
CREATE INDEX IF NOT EXISTS idx_project_song_id ON project(song_id) WHERE song_id IS NOT NULL;

-- 用於按 status 篩選專案
CREATE INDEX IF NOT EXISTS idx_project_status ON project(status);

-- 用於按創建時間排序
CREATE INDEX IF NOT EXISTS idx_project_create_at ON project(create_at DESC);

-- 複合索引：status + create_at（常見的組合查詢）
CREATE INDEX IF NOT EXISTS idx_project_status_create_at ON project(status, create_at DESC);

-- 用於搜尋專案標題
CREATE INDEX IF NOT EXISTS idx_project_title_trgm ON project USING gin(porject_title gin_trgm_ops);

-- ============================================
-- Songs 表 - 歌曲查詢優化
-- ============================================

-- 用於按 title 搜尋歌曲
CREATE INDEX IF NOT EXISTS idx_songs_title_trgm ON kpop_songs USING gin(title gin_trgm_ops);

-- 用於按發行日期排序
CREATE INDEX IF NOT EXISTS idx_songs_release_date ON kpop_songs(release_date DESC);

-- ============================================
-- Groups 表 - 團體查詢優化
-- ============================================

-- 用於搜尋團體名稱
CREATE INDEX IF NOT EXISTS idx_groups_name_trgm ON kpop_groups USING gin(group_name gin_trgm_ops);

-- 用於按 group_type 篩選
CREATE INDEX IF NOT EXISTS idx_groups_type ON kpop_groups(group_type);

-- 用於按出道日期排序
CREATE INDEX IF NOT EXISTS idx_groups_debut_date ON kpop_groups(debut_date DESC);

-- ============================================
-- Idols 表 - 偶像查詢優化
-- ============================================

-- 用於搜尋偶像藝名
CREATE INDEX IF NOT EXISTS idx_idols_stage_name_trgm ON kpop_idols USING gin(stage_name gin_trgm_ops);

-- 注意：kpop_idols 沒有 group_id 欄位
-- 團體和偶像的關係透過 group_idol 表來建立
-- group_idol 表已經有複合主鍵 (group_id, idol_id)，不需要額外索引

-- ============================================
-- 關聯表索引優化
-- ============================================

-- song_group 表 - 反向查詢（從 group_id 找歌曲）
CREATE INDEX IF NOT EXISTS idx_song_group_group_id ON song_group(group_id);

-- song_idol 表 - 反向查詢（從 idol_id 找歌曲）
CREATE INDEX IF NOT EXISTS idx_song_idol_idol_id ON song_idol(idol_id);

-- project_target 表 - 按 project_id 查詢目標
CREATE INDEX IF NOT EXISTS idx_project_target_project_id ON project_target(project_id);

-- project_target 表 - 按 idol_id 查詢（找偶像參與的專案）
CREATE INDEX IF NOT EXISTS idx_project_target_idol_id ON project_target(idol_id) WHERE idol_id IS NOT NULL;

-- project_applications 表 - 按 p_id 查詢申請
CREATE INDEX IF NOT EXISTS idx_applications_p_id ON project_applications(p_id);

-- project_applications 表 - 按 applicant_id 查詢（找使用者的所有申請）
CREATE INDEX IF NOT EXISTS idx_applications_applicant_id ON project_applications(applicant_id);

-- project_applications 表 - 按 status 篩選
CREATE INDEX IF NOT EXISTS idx_applications_status ON project_applications(status);

-- project_members 表 - 按 member_id 查詢（找使用者參與的專案）
CREATE INDEX IF NOT EXISTS idx_members_member_id ON project_members(member_id);

-- practice_schedule 表 - 按日期排序
CREATE INDEX IF NOT EXISTS idx_schedule_date ON practice_schedule(date);

-- ============================================
-- 啟用 pg_trgm 擴展（用於模糊搜尋）
-- ============================================
-- 注意：如果 gin_trgm_ops 索引建立失敗，需要先執行：
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 分析表以更新統計資訊
ANALYZE users;
ANALYZE project;
ANALYZE kpop_songs;
ANALYZE kpop_groups;
ANALYZE kpop_idols;
ANALYZE song_group;
ANALYZE song_idol;
ANALYZE project_target;
ANALYZE project_applications;
ANALYZE project_members;
ANALYZE practice_schedule;
