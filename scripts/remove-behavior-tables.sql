-- 删除行为分析相关的表和视图
-- 这些数据已经迁移到 MongoDB

-- 删除视图
DROP VIEW IF EXISTS user_behavior_summary CASCADE;
DROP VIEW IF EXISTS daily_behavior_stats CASCADE;

-- 删除表（按依赖关系顺序）
DROP TABLE IF EXISTS behavior_aggregates CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS user_behavior_events CASCADE;

-- 验证删除
SELECT 
    table_name 
FROM 
    information_schema.tables 
WHERE 
    table_schema = 'public' 
    AND table_name IN ('user_behavior_events', 'user_sessions', 'behavior_aggregates');


