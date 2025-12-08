-- 移除 difficulty_level 字段的迁移脚本
-- 执行此脚本将从 kpop_songs 表中删除 difficulty_level 字段和相关索引

-- 1. 删除难度索引
DROP INDEX IF EXISTS idx_songs_difficulty;

-- 2. 删除难度字段的约束（如果有单独的约束）
-- 注意：CHECK 约束会随着字段一起删除，但为了安全起见，我们显式删除
ALTER TABLE kpop_songs DROP CONSTRAINT IF EXISTS kpop_songs_difficulty_level_check;

-- 3. 删除 difficulty_level 字段
ALTER TABLE kpop_songs DROP COLUMN IF EXISTS difficulty_level;

-- 完成迁移
-- 注意：此操作不可逆，请确保已备份数据库

