# MongoDB 迁移指南

本项目已将行为数据分析系统从 PostgreSQL JSONB 迁移到独立的 MongoDB 数据库。

## 📋 架构说明

### 数据库分离

- **PostgreSQL**：存储交易数据（用户、项目、申请等）
  - 数据库：`kpop_dance_db`
  - 用途：关系型数据，需要 ACID 事务保证

- **MongoDB**：存储行为分析数据（用户行为事件、会话等）
  - 数据库：`kpop_dance_analytics`
  - 用途：NoSQL 灵活存储，适合行为追踪和分析

## 🚀 快速开始

### 1. 安装 MongoDB

#### macOS
```bash
brew tap mongodb/brew
brew install mongodb/brew/mongodb-community
brew services start mongodb/brew/mongodb-community
```

#### Linux
```bash
# Ubuntu/Debian
sudo apt-get install -y mongodb

# 或使用官方仓库
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

#### Docker
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 2. 配置环境变量

在项目根目录创建或更新 `.env.local` 文件：

```env
# MongoDB 配置
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=kpop_dance_analytics

# PostgreSQL 配置（保持不变）
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kpop_dance_db
DB_USER=yu
DB_PASSWORD=your_password
```

### 3. 运行数据迁移（可选）

如果你有现有的 PostgreSQL 行为数据需要迁移：

```bash
npx tsx scripts/migrate-behavior-to-mongodb.ts
```

### 4. 创建 MongoDB 索引（推荐）

为了优化查询性能，建议创建索引：

**使用提供的脚本（推荐）**：

```bash
npx tsx scripts/create-mongodb-indexes.ts
```

**或使用 MongoDB shell**：

```bash
# 使用 MongoDB shell
mongosh kpop_dance_analytics

# 在 MongoDB shell 中执行
db.user_behavior_events.createIndex({ user_id: 1 })
db.user_behavior_events.createIndex({ event_type: 1 })
db.user_behavior_events.createIndex({ event_timestamp: -1 })
db.user_behavior_events.createIndex({ session_id: 1 })
db.user_behavior_events.createIndex({ "event_data.project_id": 1 })
db.user_behavior_events.createIndex({ "event_data.song_id": 1 })

db.user_sessions.createIndex({ session_id: 1 }, { unique: true })
db.user_sessions.createIndex({ user_id: 1 })
db.user_sessions.createIndex({ started_at: -1 })

db.behavior_aggregates.createIndex({ date: 1, user_id: 1, event_type: 1 }, { unique: true })
```

## 📊 数据结构

### 集合（Collections）

1. **user_behavior_events** - 用户行为事件
2. **user_sessions** - 用户会话
3. **behavior_aggregates** - 行为聚合数据

### 文档结构示例

#### 行为事件文档
```json
{
  "_id": ObjectId("..."),
  "event_id": 1234567890,
  "user_id": 123,
  "event_type": "project_view",
  "event_timestamp": ISODate("2024-01-01T12:00:00Z"),
  "session_id": "session-abc-123",
  "page_url": "/project/456",
  "event_data": {
    "project_id": 456,
    "project_title": "K-pop Dance Project"
  },
  "metadata": {
    "device_type": "desktop",
    "browser": "Chrome",
    "os": "macOS"
  },
  "createdAt": ISODate("2024-01-01T12:00:00Z")
}
```

## 🔧 API 端点

所有 API 端点保持不变，但底层已切换到 MongoDB：

- `POST /api/analytics/track` - 记录行为事件
- `GET /api/analytics/query` - 查询行为事件
- `GET /api/analytics/stats` - 获取行为统计
- `POST /api/analytics/session` - 创建/更新会话
- `PUT /api/analytics/session/[sessionId]` - 结束会话

## 📝 代码变更

### 新增文件

- `src/lib/mongodb.ts` - MongoDB 连接配置
- `src/lib/mongodb-models.ts` - MongoDB 数据模型
- `scripts/migrate-behavior-to-mongodb.ts` - 数据迁移脚本

### 修改文件

- `src/app/api/analytics/track/route.ts` - 使用 MongoDB
- `src/app/api/analytics/query/route.ts` - 使用 MongoDB
- `src/app/api/analytics/stats/route.ts` - 使用 MongoDB
- `src/app/api/analytics/session/route.ts` - 新增，使用 MongoDB
- `src/app/api/analytics/session/[sessionId]/route.ts` - 新增，使用 MongoDB

## ✅ 验证迁移

### 1. 检查 MongoDB 连接

```bash
# 启动开发服务器
npm run dev

# 查看控制台，应该看到：
# ✓ MongoDB 连接成功
```

### 2. 测试行为追踪

访问应用并执行一些操作，然后检查 MongoDB：

```bash
mongosh kpop_dance_analytics
db.user_behavior_events.find().limit(5).pretty()
```

### 3. 验证数据完整性

确保所有行为事件都正确存储：

```javascript
// 在 MongoDB shell 中
db.user_behavior_events.countDocuments()
db.user_sessions.countDocuments()
```

## 🐛 故障排除

### MongoDB 连接失败

1. 检查 MongoDB 是否运行：
   ```bash
   # macOS
   brew services list
   
   # Linux
   sudo systemctl status mongod
   ```

2. 检查连接字符串是否正确
3. 检查防火墙设置

### 数据迁移失败

1. 确保 PostgreSQL 和 MongoDB 都在运行
2. 检查数据库连接配置
3. 查看错误日志

### 查询性能慢

1. 确保已创建索引（见上方索引创建命令）
2. 使用 `explain()` 分析查询计划：
   ```javascript
   db.user_behavior_events.find({ user_id: 123 }).explain("executionStats")
   ```

## 📚 相关文档

- [MongoDB 官方文档](https://docs.mongodb.com/)
- [行为分析系统文档](./behavior-analytics/BEHAVIOR_ANALYTICS_README.md)

## 🔄 回滚方案

如果需要回滚到 PostgreSQL，可以：

1. 恢复原来的 API 路由文件（从 git 历史）
2. 从 MongoDB 导出数据并导入到 PostgreSQL（需要编写脚本）
3. 更新环境变量

建议在迁移前备份 PostgreSQL 数据。

