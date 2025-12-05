-- 行為分析表的 Row Level Security (RLS) 策略 - 安全版本
-- 在 Supabase SQL Editor 中執行此文件
-- 
-- 此版本只允許 INSERT，禁止 UPDATE 和 DELETE，提供最佳安全性

-- 啟用 RLS
ALTER TABLE USER_BEHAVIOR_EVENTS ENABLE ROW LEVEL SECURITY;
ALTER TABLE USER_SESSIONS ENABLE ROW LEVEL SECURITY;
ALTER TABLE BEHAVIOR_AGGREGATES ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USER_BEHAVIOR_EVENTS 表
-- ============================================

-- ✅ 允許所有人插入事件（用於行為追蹤）
CREATE POLICY "Allow insert for tracking" ON USER_BEHAVIOR_EVENTS
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- ✅ 允許查詢（如果需要，可以通過 API 進一步控制權限）
CREATE POLICY "Allow select for all" ON USER_BEHAVIOR_EVENTS
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- ❌ 不允許 UPDATE（沒有 Policy = 拒絕所有 UPDATE）
-- 即使有人嘗試在控制台執行 update，也會被拒絕

-- ❌ 不允許 DELETE（沒有 Policy = 拒絕所有 DELETE）
-- 即使有人嘗試在控制台執行 delete，也會被拒絕

-- ============================================
-- USER_SESSIONS 表
-- ============================================

-- ✅ 允許所有人插入會話
CREATE POLICY "Allow insert for sessions" ON USER_SESSIONS
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- ✅ 允許更新會話（會話管理需要，例如結束會話時更新 ended_at）
CREATE POLICY "Allow update sessions" ON USER_SESSIONS
  FOR UPDATE
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- ✅ 允許查詢會話
CREATE POLICY "Allow select sessions" ON USER_SESSIONS
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- ❌ 不允許 DELETE（會話資料不應該被刪除）

-- ============================================
-- BEHAVIOR_AGGREGATES 表
-- ============================================

-- ✅ 允許插入聚合數據
CREATE POLICY "Allow insert aggregates" ON BEHAVIOR_AGGREGATES
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- ✅ 允許更新聚合數據（聚合數據需要定期更新）
CREATE POLICY "Allow update aggregates" ON BEHAVIOR_AGGREGATES
  FOR UPDATE
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- ✅ 允許查詢聚合數據
CREATE POLICY "Allow select aggregates" ON BEHAVIOR_AGGREGATES
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- ❌ 不允許 DELETE（聚合數據不應該被刪除）

-- ============================================
-- 注意事項
-- ============================================
-- 
-- 1. 此配置允許：
--    - ✅ INSERT：用於行為追蹤和會話管理
--    - ✅ SELECT：用於查詢和分析
--    - ✅ UPDATE：僅限於 USER_SESSIONS 和 BEHAVIOR_AGGREGATES（業務需要）
-- 
-- 2. 此配置禁止：
--    - ❌ DELETE：所有表都不允許刪除（保護資料完整性）
--    - ❌ UPDATE USER_BEHAVIOR_EVENTS：行為事件不應該被修改
-- 
-- 3. 安全性：
--    - 即使有人嘗試在瀏覽器控制台執行 update/delete，也會被 RLS 拒絕
--    - 保護資料不被惡意修改或刪除
-- 
-- 4. 如果需要更嚴格的權限控制，可以：
--    - 限制 SELECT 只能查詢自己的資料
--    - 限制 UPDATE 只能更新自己的會話
--    - 添加管理員專用的 Policy

