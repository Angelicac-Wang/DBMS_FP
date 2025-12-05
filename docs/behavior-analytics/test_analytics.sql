-- 測試行為追蹤資料是否正常插入
-- 在 Supabase SQL Editor 中執行此文件來檢查

-- 1. 檢查表是否存在
SELECT 
  table_name,
  rowsecurity as rls_enabled
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('USER_BEHAVIOR_EVENTS', 'user_behavior_events');

-- 2. 檢查 RLS 狀態
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('user_behavior_events', 'USER_BEHAVIOR_EVENTS');

-- 3. 檢查現有的 Policy
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('user_behavior_events', 'USER_BEHAVIOR_EVENTS');

-- 4. 嘗試手動插入測試資料（檢查是否有 RLS 阻止）
INSERT INTO USER_BEHAVIOR_EVENTS (
  event_type,
  event_data,
  session_id
) VALUES (
  'test',
  '{"test": true}'::jsonb,
  'test-session-' || NOW()::text
) RETURNING event_id, event_type, event_timestamp;

-- 5. 查看最近的資料
SELECT 
  event_id,
  user_id,
  event_type,
  event_timestamp,
  session_id,
  event_data
FROM USER_BEHAVIOR_EVENTS
ORDER BY event_timestamp DESC
LIMIT 10;

-- 6. 統計各事件類型的數量
SELECT 
  event_type,
  COUNT(*) as count
FROM USER_BEHAVIOR_EVENTS
GROUP BY event_type
ORDER BY count DESC;

