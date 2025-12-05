# 行为数据分析系统 - 实现总结

## 📦 已创建的文件

### 数据库相关
- ✅ `behavior_analytics_schema.sql` - 数据库表结构和索引

### TypeScript 类型定义
- ✅ `src/types/behavior.ts` - 完整的类型定义

### 核心功能
- ✅ `src/lib/behavior-analytics.ts` - 行为追踪工具函数
- ✅ `src/hooks/useBehaviorTracking.ts` - React Hook 用于组件中追踪

### API 路由
- ✅ `src/app/api/analytics/track/route.ts` - 记录事件 API
- ✅ `src/app/api/analytics/query/route.ts` - 查询事件 API
- ✅ `src/app/api/analytics/stats/route.ts` - 获取统计 API

### 组件
- ✅ `src/components/BehaviorTracker.tsx` - 行为追踪包装组件

### 文档
- ✅ `BEHAVIOR_ANALYTICS_README.md` - 完整使用文档
- ✅ `BEHAVIOR_ANALYTICS_QUICKSTART.md` - 快速开始指南

## 🎯 核心特性

### 1. NoSQL 风格的灵活存储
使用 PostgreSQL 的 JSONB 数据类型，可以存储任意结构的数据：

```typescript
event_data: {
  project_id: 123,
  custom_field: "any value",
  nested: { data: "here" }
}
```

### 2. 高性能查询
- GIN 索引优化 JSONB 查询
- 多字段索引支持快速过滤
- 聚合表支持快速统计

### 3. 完整的类型安全
所有函数都有完整的 TypeScript 类型定义。

### 4. 易于使用
- React Hook 集成
- 简单的 API 调用
- 自动会话管理

## 🚀 使用流程

### 第一步：设置数据库
```sql
-- 在 Supabase SQL Editor 执行
-- behavior_analytics_schema.sql
```

### 第二步：在组件中使用
```tsx
import { useBehaviorTracking } from '@/hooks/useBehaviorTracking';

const { trackProjectView, trackClick } = useBehaviorTracking();
```

### 第三步：追踪事件
```tsx
trackProjectView(projectId, projectTitle);
trackClick('button-id', 'Button Text');
```

## 📊 数据模型

### USER_BEHAVIOR_EVENTS
存储所有用户行为事件，使用 JSONB 存储灵活的事件数据。

### USER_SESSIONS
追踪用户会话，记录会话开始/结束时间和统计信息。

### BEHAVIOR_AGGREGATES
预计算的聚合数据，用于快速查询统计信息。

## 🔍 查询示例

### 基础查询
```typescript
const { data } = await queryEvents({
  user_id: 123,
  event_type: 'project_view',
  start_date: '2024-01-01',
  limit: 50,
});
```

### JSONB 查询
```typescript
// 查询特定项目 ID 的所有事件
const { data } = await queryByEventData('project_id', '456');
```

### 统计查询
```typescript
const { data: stats } = await getBehaviorStats(
  '2024-01-01',
  '2024-01-31',
  123 // 可选：特定用户
);
```

## 📈 支持的事件类型

- `page_view` - 页面浏览
- `click` - 点击
- `search` - 搜索
- `project_view` - 查看项目
- `project_apply` - 申请项目
- `project_create` - 创建项目
- `song_view` - 查看歌曲
- `group_view` - 查看团体
- `profile_view` - 查看个人资料
- `video_play` - 播放视频
- `video_pause` - 暂停视频
- `video_complete` - 视频完成
- `form_submit` - 提交表单
- `form_abandon` - 放弃表单
- `login` - 登录
- `logout` - 登出
- `signup` - 注册
- `error` - 错误
- `custom` - 自定义

## 🎨 优势

1. **无需额外服务** - 使用现有的 Supabase PostgreSQL
2. **灵活的数据结构** - JSONB 支持任意结构
3. **高性能** - 优化的索引和聚合表
4. **类型安全** - 完整的 TypeScript 支持
5. **易于集成** - React Hook 和 API 路由
6. **可扩展** - 易于添加新的事件类型和查询

## 📝 下一步

1. 执行 `behavior_analytics_schema.sql` 创建表
2. 在关键页面添加行为追踪
3. 创建分析仪表板查看数据
4. 根据业务需求添加自定义事件类型

## 🔗 相关文档

- [完整文档](./BEHAVIOR_ANALYTICS_README.md)
- [快速开始](./BEHAVIOR_ANALYTICS_QUICKSTART.md)

