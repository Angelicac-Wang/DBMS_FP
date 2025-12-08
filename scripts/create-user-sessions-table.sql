-- 创建 user_sessions 表（如果不存在）
-- 用于追踪用户会话

CREATE TABLE IF NOT EXISTS user_sessions (
    session_id VARCHAR(100) PRIMARY KEY,
    user_id BIGINT,
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMP,
    duration_seconds INT,
    page_views INT DEFAULT 0,
    events_count INT DEFAULT 0,
    device_type VARCHAR(20),
    browser VARCHAR(50),
    os VARCHAR(50),
    country VARCHAR(50),
    city VARCHAR(100),
    -- 会话级别的数据
    session_data JSONB DEFAULT '{}',
    CONSTRAINT fk_session_user FOREIGN KEY (user_id) 
        REFERENCES users(u_id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON user_sessions(started_at);

-- 注释
COMMENT ON TABLE user_sessions IS '用户会话表，用于追踪用户会话信息';
COMMENT ON COLUMN user_sessions.session_id IS '会话 ID';
COMMENT ON COLUMN user_sessions.user_id IS '用户 ID';
COMMENT ON COLUMN user_sessions.started_at IS '会话开始时间';
COMMENT ON COLUMN user_sessions.ended_at IS '会话结束时间';
COMMENT ON COLUMN user_sessions.duration_seconds IS '会话持续时间（秒）';
COMMENT ON COLUMN user_sessions.page_views IS '页面浏览数';
COMMENT ON COLUMN user_sessions.events_count IS '事件数量';
COMMENT ON COLUMN user_sessions.device_type IS '设备类型';
COMMENT ON COLUMN user_sessions.browser IS '浏览器';
COMMENT ON COLUMN user_sessions.os IS '操作系统';
COMMENT ON COLUMN user_sessions.country IS '国家';
COMMENT ON COLUMN user_sessions.city IS '城市';
COMMENT ON COLUMN user_sessions.session_data IS '会话数据（JSONB）';

