# 行为数据分析系统使用指南

这是一个基于 Supabase PostgreSQL JSONB 的行为数据分析系统，可以像 NoSQL 数据库一样灵活存储和查询用户行为数据。

## 功能特点

- ✅ 使用 PostgreSQL JSONB 存储灵活的行为数据（类似 NoSQL）
- ✅ 支持多种事件类型（页面浏览、点击、搜索等）
- ✅ 会话追踪
- ✅ 行为统计和聚合
- ✅ 高性能索引优化
- ✅ TypeScript 类型支持
- ✅ React Hook 集成

## 安装步骤

### 1. 创建数据库表

在 Supabase SQL Editor 中执行 `behavior_analytics_schema.sql`：

```sql
-- 执行 behavior_analytics_schema.sql 中的所有 SQL 语句
```

### 2. 在 Supabase 中启用表访问

确保 Supabase 的 Row Level Security (RLS) 设置正确，或者暂时禁用 RLS 进行测试。

## 使用方法

### 在 React 组件中使用

```tsx
'use client';

import { useBehaviorTracking } from '@/hooks/useBehaviorTracking';
import { useEffect } from 'react';

export default function ProjectPage({ projectId }: { projectId: number }) {
  const { trackPageView, trackProjectView, trackClick } = useBehaviorTracking();

  useEffect(() => {
    // 追踪页面浏览
    trackPageView('/project/' + projectId, 'Project Details');
    
    // 追踪项目查看
    trackProjectView(projectId, 'Some Project Title', 123);
  }, [projectId]);

  const handleApplyClick = () => {
    // 追踪按钮点击
    trackClick('apply-button', 'Apply to Project', {
      project_id: projectId,
    });
    
    // 你的业务逻辑...
  };

  return (
    <div>
      <button onClick={handleApplyClick}>Apply</button>
    </div>
  );
}
```

### 直接使用 API

```typescript
// 记录事件
const response = await fetch('/api/analytics/track', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: 123, // 可选
    event_type: 'project_view',
    event_data: {
      project_id: 456,
      project_title: 'K-pop Dance Project',
      song_id: 789,
    },
  }),
});

// 查询事件
const queryResponse = await fetch(
  '/api/analytics/query?user_id=123&event_type=project_view&limit=10'
);
const { events } = await queryResponse.json();

// 获取统计
const statsResponse = await fetch(
  '/api/analytics/stats?start_date=2024-01-01&end_date=2024-01-31'
);
const { stats } = await statsResponse.json();
```

### 使用工具函数

```typescript
import { 
  trackEvent, 
  queryEvents, 
  getBehaviorStats 
} from '@/lib/behavior-analytics';

// 记录事件
await trackEvent({
  user_id: 123,
  event_type: 'click',
  event_data: {
    element_id: 'search-button',
    element_text: 'Search',
  },
});

// 查询事件
const { data: events } = await queryEvents({
  user_id: 123,
  event_type: 'project_view',
  start_date: '2024-01-01',
  end_date: '2024-01-31',
  limit: 50,
});

// 获取统计
const { data: stats } = await getBehaviorStats(
  '2024-01-01',
  '2024-01-31',
  123 // 可选：特定用户
);
```

## 支持的事件类型

- `page_view` - 页面浏览
- `click` - 点击事件
- `search` - 搜索
- `project_view` - 查看项目
- `project_apply` - 申请项目
- `project_create` - 创建项目
- `song_view` - 查看歌曲
- `group_view` - 查看团体
- `profile_view` - 查看个人资料
- `video_play` - 播放视频
- `video_pause` - 暂停视频
- `video_complete` - 视频播放完成
- `form_submit` - 提交表单
- `form_abandon` - 放弃表单
- `login` - 登录
- `logout` - 登出
- `signup` - 注册
- `error` - 错误
- `custom` - 自定义事件

## 数据结构

### 事件数据结构

```typescript
{
  event_id: number;
  user_id: number | null;
  event_type: string;
  event_timestamp: Date;
  session_id: string;
  page_url: string;
  referrer_url: string;
  user_agent: string;
  ip_address: string;
  event_data: {
    // 灵活的自定义数据
    [key: string]: any;
  };
  metadata: {
    device_type: 'desktop' | 'mobile' | 'tablet';
    browser: string;
    os: string;
    // 其他元数据...
  };
}
```

## 高级查询

### JSONB 查询示例

```sql
-- 查询特定项目 ID 的所有查看事件
SELECT * FROM USER_BEHAVIOR_EVENTS
WHERE event_data->>'project_id' = '456';

-- 查询包含特定搜索关键词的事件
SELECT * FROM USER_BEHAVIOR_EVENTS
WHERE event_data->>'query' LIKE '%k-pop%';

-- 使用 JSONB 操作符查询嵌套数据
SELECT * FROM USER_BEHAVIOR_EVENTS
WHERE event_data @> '{"project_id": 456}';
```

### 使用工具函数进行 JSONB 查询

```typescript
import { queryByEventData } from '@/lib/behavior-analytics';

// 查询特定项目 ID 的所有事件
const { data } = await queryByEventData('project_id', '456', {
  event_type: 'project_view',
  start_date: '2024-01-01',
});
```

## 统计视图

系统提供了两个预定义的视图：

1. **daily_behavior_stats** - 每日行为统计
2. **user_behavior_summary** - 用户行为摘要

```sql
-- 查看每日统计
SELECT * FROM daily_behavior_stats
WHERE date >= '2024-01-01'
ORDER BY date DESC;

-- 查看用户摘要
SELECT * FROM user_behavior_summary
WHERE user_id = 123;
```

## 性能优化

- ✅ 所有常用字段都有索引
- ✅ JSONB 字段使用 GIN 索引，支持高效查询
- ✅ 聚合表用于快速统计查询
- ✅ 支持分页查询

## 注意事项

1. **隐私保护**：确保遵守隐私法规，不要存储敏感信息
2. **数据清理**：定期清理旧数据以保持性能
3. **RLS 策略**：在生产环境中配置适当的 Row Level Security
4. **批量插入**：对于大量事件，使用 `trackEvents()` 进行批量插入

## 扩展功能

### 添加自定义事件类型

在 `src/types/behavior.ts` 中的 `EventType` 类型中添加新的事件类型。

### 添加自定义聚合

可以在 `BEHAVIOR_AGGREGATES` 表中存储预计算的聚合数据，以提高查询性能。

## 故障排除

### 事件没有被记录

1. 检查 Supabase 连接配置
2. 检查 RLS 策略
3. 查看浏览器控制台的错误信息
4. 检查网络请求是否成功

### 查询性能慢

1. 确保索引已创建
2. 使用聚合表而不是实时计算
3. 限制查询的时间范围
4. 使用分页

## 示例场景

### 场景 1：追踪项目详情页浏览

```tsx
useEffect(() => {
  trackProjectView(projectId, project.title, project.song_id);
}, [projectId]);
```

### 场景 2：追踪搜索行为

```tsx
const handleSearch = async (query: string) => {
  const results = await searchProjects(query);
  
  trackSearch(query, results.length, {
    filters: currentFilters,
  });
  
  // 显示结果...
};
```

### 场景 3：分析用户行为

```typescript
// 获取用户的所有项目查看事件
const { data: events } = await queryEvents({
  user_id: userId,
  event_type: 'project_view',
  order_by: 'event_timestamp',
  order: 'desc',
  limit: 100,
});

// 分析用户最常查看的项目类型
const projectIds = events?.map(e => e.event_data?.project_id) || [];
```

