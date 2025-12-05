-- 行为数据分析表结构
-- 使用 PostgreSQL JSONB 来存储灵活的行为数据（类似 NoSQL）

-- 用户行为事件表
CREATE TABLE IF NOT EXISTS USER_BEHAVIOR_EVENTS (
    event_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    event_type VARCHAR(50) NOT NULL,
    event_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    session_id VARCHAR(100),
    page_url VARCHAR(500),
    referrer_url VARCHAR(500),
    user_agent TEXT,
    ip_address VARCHAR(45),
    -- 使用 JSONB 存储灵活的事件数据
    event_data JSONB NOT NULL DEFAULT '{}',
    -- 元数据（设备、浏览器等信息）
    metadata JSONB DEFAULT '{}',
    -- 创建索引以优化查询
    CONSTRAINT fk_user FOREIGN KEY (user_id) 
        REFERENCES USERS(u_id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE
);

-- 创建索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_behavior_user_id ON USER_BEHAVIOR_EVENTS(user_id);
CREATE INDEX IF NOT EXISTS idx_behavior_event_type ON USER_BEHAVIOR_EVENTS(event_type);
CREATE INDEX IF NOT EXISTS idx_behavior_timestamp ON USER_BEHAVIOR_EVENTS(event_timestamp);
CREATE INDEX IF NOT EXISTS idx_behavior_session ON USER_BEHAVIOR_EVENTS(session_id);
-- JSONB 索引（GIN 索引用于高效查询 JSON 数据）
CREATE INDEX IF NOT EXISTS idx_behavior_event_data ON USER_BEHAVIOR_EVENTS USING GIN (event_data);
CREATE INDEX IF NOT EXISTS idx_behavior_metadata ON USER_BEHAVIOR_EVENTS USING GIN (metadata);

-- 用户会话表（用于追踪用户会话）
CREATE TABLE IF NOT EXISTS USER_SESSIONS (
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
        REFERENCES USERS(u_id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON USER_SESSIONS(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON USER_SESSIONS(started_at);

-- 行为聚合表（用于快速查询统计数据）
CREATE TABLE IF NOT EXISTS BEHAVIOR_AGGREGATES (
    aggregate_id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    user_id BIGINT,
    event_type VARCHAR(50) NOT NULL,
    count INT NOT NULL DEFAULT 0,
    -- 聚合数据
    aggregate_data JSONB DEFAULT '{}',
    last_updated TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(date, user_id, event_type),
    CONSTRAINT fk_aggregate_user FOREIGN KEY (user_id) 
        REFERENCES USERS(u_id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_aggregates_date ON BEHAVIOR_AGGREGATES(date);
CREATE INDEX IF NOT EXISTS idx_aggregates_user_date ON BEHAVIOR_AGGREGATES(user_id, date);
CREATE INDEX IF NOT EXISTS idx_aggregates_event_type ON BEHAVIOR_AGGREGATES(event_type);

-- 视图：每日行为统计
CREATE OR REPLACE VIEW daily_behavior_stats AS
SELECT 
    DATE(event_timestamp) as date,
    event_type,
    COUNT(*) as event_count,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT session_id) as unique_sessions
FROM USER_BEHAVIOR_EVENTS
GROUP BY DATE(event_timestamp), event_type;

-- 视图：用户行为摘要
CREATE OR REPLACE VIEW user_behavior_summary AS
SELECT 
    user_id,
    COUNT(*) as total_events,
    COUNT(DISTINCT event_type) as unique_event_types,
    COUNT(DISTINCT session_id) as total_sessions,
    MIN(event_timestamp) as first_event,
    MAX(event_timestamp) as last_event
FROM USER_BEHAVIOR_EVENTS
WHERE user_id IS NOT NULL
GROUP BY user_id;

