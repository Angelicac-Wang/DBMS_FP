# 行为数据分析系统 - 快速开始

## 5 分钟快速设置

### 步骤 1: 创建数据库表

在 Supabase Dashboard → SQL Editor 中执行：

```sql
-- 复制并执行 behavior_analytics_schema.sql 中的所有内容
```

### 步骤 2: 在页面中使用

```tsx
// app/project/[id]/page.tsx
'use client';

import { useBehaviorTracking } from '@/hooks/useBehaviorTracking';
import { useEffect } from 'react';

export default function ProjectPage({ params }: { params: { id: string } }) {
  const { trackProjectView, trackClick } = useBehaviorTracking();
  const projectId = parseInt(params.id);

  useEffect(() => {
    // 自动追踪项目查看
    trackProjectView(projectId);
  }, [projectId, trackProjectView]);

  const handleApply = () => {
    trackClick('apply-button', 'Apply to Project', {
      project_id: projectId,
    });
    // 你的业务逻辑...
  };

  return (
    <div>
      <h1>Project {projectId}</h1>
      <button onClick={handleApply}>Apply</button>
    </div>
  );
}
```

### 步骤 3: 查看数据

在 Supabase Dashboard → Table Editor → `USER_BEHAVIOR_EVENTS` 查看记录的事件。

## 常用场景

### 追踪搜索

```tsx
const { trackSearch } = useBehaviorTracking();

const handleSearch = (query: string) => {
  const results = performSearch(query);
  trackSearch(query, results.length);
};
```

### 追踪视频播放

```tsx
const { trackEvent } = useBehaviorTracking();

const handleVideoPlay = () => {
  trackEvent('video_play', {
    video_url: videoUrl,
    video_duration: duration,
  });
};
```

### 查询用户行为

```typescript
import { queryEvents } from '@/lib/behavior-analytics';

// 获取用户的所有项目查看
const { data: events } = await queryEvents({
  user_id: 123,
  event_type: 'project_view',
  limit: 50,
});
```

## 下一步

查看 [BEHAVIOR_ANALYTICS_README.md](./BEHAVIOR_ANALYTICS_README.md) 获取完整文档。

