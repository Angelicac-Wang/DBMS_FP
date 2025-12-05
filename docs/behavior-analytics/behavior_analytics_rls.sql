-- 行为分析表的 Row Level Security (RLS) 策略
-- 在 Supabase SQL Editor 中执行此文件

-- 启用 RLS
ALTER TABLE USER_BEHAVIOR_EVENTS ENABLE ROW LEVEL SECURITY;
ALTER TABLE USER_SESSIONS ENABLE ROW LEVEL SECURITY;
ALTER TABLE BEHAVIOR_AGGREGATES ENABLE ROW LEVEL SECURITY;

-- USER_BEHAVIOR_EVENTS 表策略
-- 允许所有人插入事件（用于追踪）
CREATE POLICY "Allow insert for all users" ON USER_BEHAVIOR_EVENTS
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- 允许用户查看自己的事件
CREATE POLICY "Users can view their own events" ON USER_BEHAVIOR_EVENTS
  FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT u_id FROM USERS WHERE u_id = auth.uid()::bigint)
    OR user_id IS NULL
  );

-- 允许管理员查看所有事件
CREATE POLICY "Admins can view all events" ON USER_BEHAVIOR_EVENTS
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM USERS 
      WHERE u_id = auth.uid()::bigint 
      AND role = 'A'
    )
  );

-- USER_SESSIONS 表策略
-- 允许所有人插入会话
CREATE POLICY "Allow insert for all users" ON USER_SESSIONS
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- 允许用户查看和更新自己的会话
CREATE POLICY "Users can manage their own sessions" ON USER_SESSIONS
  FOR ALL
  TO authenticated
  USING (
    user_id = (SELECT u_id FROM USERS WHERE u_id = auth.uid()::bigint)
    OR user_id IS NULL
  )
  WITH CHECK (
    user_id = (SELECT u_id FROM USERS WHERE u_id = auth.uid()::bigint)
    OR user_id IS NULL
  );

-- 允许管理员查看所有会话
CREATE POLICY "Admins can view all sessions" ON USER_SESSIONS
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM USERS 
      WHERE u_id = auth.uid()::bigint 
      AND role = 'A'
    )
  );

-- BEHAVIOR_AGGREGATES 表策略
-- 允许所有人插入聚合数据
CREATE POLICY "Allow insert for all users" ON BEHAVIOR_AGGREGATES
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- 允许用户查看自己的聚合数据
CREATE POLICY "Users can view their own aggregates" ON BEHAVIOR_AGGREGATES
  FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT u_id FROM USERS WHERE u_id = auth.uid()::bigint)
    OR user_id IS NULL
  );

-- 允许管理员查看所有聚合数据
CREATE POLICY "Admins can view all aggregates" ON BEHAVIOR_AGGREGATES
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM USERS 
      WHERE u_id = auth.uid()::bigint 
      AND role = 'A'
    )
  );

-- 注意：如果你的 Supabase 使用不同的认证系统（不是标准的 auth.users），
-- 你可能需要调整上述策略中的 auth.uid() 部分。
-- 
-- 如果暂时不想使用 RLS，可以执行以下命令禁用：
-- ALTER TABLE USER_BEHAVIOR_EVENTS DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE USER_SESSIONS DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE BEHAVIOR_AGGREGATES DISABLE ROW LEVEL SECURITY;

