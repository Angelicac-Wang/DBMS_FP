-- 清理過期申請
-- 將超過 30 天未審核的申請記錄狀態改為 'C'（已取消）
-- 
-- 使用方式：
-- psql -U your_username -d kpop_dance_db -f scripts/clean-expired-applications.sql

-- 先查看有多少筆過期申請
SELECT COUNT(*) as expired_count
FROM project_applications
WHERE status = 'W'
  AND applied_time < NOW() - INTERVAL '30 days';

-- 更新過期申請的狀態
UPDATE project_applications
SET status = 'C', reviewed_time = NOW()
WHERE status = 'W'
  AND applied_time < NOW() - INTERVAL '30 days';

-- 查看清理後的統計
SELECT 
  COUNT(*) FILTER (WHERE status = 'W') as waiting,
  COUNT(*) FILTER (WHERE status = 'C') as cancelled,
  COUNT(*) FILTER (WHERE status = 'A') as accepted,
  COUNT(*) FILTER (WHERE status = 'R') as rejected,
  COUNT(*) as total
FROM project_applications;


