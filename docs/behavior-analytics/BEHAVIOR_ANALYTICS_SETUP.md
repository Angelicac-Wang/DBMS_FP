# 行为追踪系统设置完成指南

## ✅ 已完成的工作

1. ✅ **数据库表结构** - `behavior_analytics_schema.sql` 已执行
2. ✅ **代码集成** - 已在主页面和项目卡片组件中添加追踪功能
3. ✅ **RLS 策略文件** - 已创建 `behavior_analytics_rls.sql`

## ⚠️ 还需要完成的步骤

### 1. 配置 RLS 策略（重要！）

在 Supabase SQL Editor 中执行 `behavior_analytics_rls.sql`：

```sql
-- 执行 behavior_analytics_rls.sql 中的所有 SQL 语句
```

**或者，如果你想暂时禁用 RLS 进行测试，可以执行：**

```sql
ALTER TABLE USER_BEHAVIOR_EVENTS DISABLE ROW LEVEL SECURITY;
ALTER TABLE USER_SESSIONS DISABLE ROW LEVEL SECURITY;
ALTER TABLE BEHAVIOR_AGGREGATES DISABLE ROW LEVEL SECURITY;
```

> ⚠️ **注意**：在生产环境中，建议启用 RLS 并配置适当的策略。

### 2. 验证追踪功能

启动开发服务器并测试：

```bash
yarn dev
```

然后：
1. 访问首页 - 应该自动追踪 `page_view` 事件
2. 进行搜索 - 应该追踪 `search` 事件
3. 点击项目卡片 - 应该追踪 `project_view` 和 `click` 事件

### 3. 检查数据是否被记录

在 Supabase SQL Editor 中查询：

```sql
-- 查看最近的事件
SELECT * FROM USER_BEHAVIOR_EVENTS 
ORDER BY event_timestamp DESC 
LIMIT 10;

-- 查看每日统计
SELECT * FROM daily_behavior_stats 
ORDER BY date DESC 
LIMIT 10;
```

## 📊 当前已追踪的事件

### 主页面 (`src/app/page.tsx`)
- ✅ **页面浏览** (`page_view`) - 页面加载时自动追踪
- ✅ **搜索行为** (`search`) - 搜索或筛选时追踪

### 项目卡片 (`src/components/ProjectCard.tsx`)
- ✅ **项目查看** (`project_view`) - 点击"详情"按钮时追踪
- ✅ **按钮点击** (`click`) - 点击"详情"和"申請加入"按钮时追踪

## 🔧 如何添加更多追踪

### 在其他页面添加追踪

```tsx
'use client';

import { useBehaviorTracking } from '@/hooks/useBehaviorTracking';
import { useEffect } from 'react';

export default function MyPage() {
  const { trackPageView, trackClick } = useBehaviorTracking();

  useEffect(() => {
    // 追踪页面浏览
    trackPageView('/my-page', '我的页面');
  }, []);

  const handleButtonClick = () => {
    // 追踪按钮点击
    trackClick('my-button', '我的按钮');
    // 你的业务逻辑...
  };

  return (
    <div>
      <button onClick={handleButtonClick}>点击我</button>
    </div>
  );
}
```

### 追踪自定义事件

```tsx
const { trackEvent } = useBehaviorTracking();

// 追踪自定义事件
await trackEvent('custom', {
  action: 'something_happened',
  value: 123,
});
```

## 🐛 故障排除

### 事件没有被记录

1. **检查 RLS 策略**
   - 确认已执行 `behavior_analytics_rls.sql`
   - 或已禁用 RLS（仅用于测试）

2. **检查浏览器控制台**
   - 打开开发者工具（F12）
   - 查看 Console 标签是否有错误
   - 查看 Network 标签，检查 `/api/analytics/track` 请求是否成功

3. **检查 Supabase 连接**
   - 确认 `.env.local` 中的 Supabase 配置正确
   - 确认 Supabase 项目已启动

4. **检查数据库表**
   ```sql
   -- 确认表已创建
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_name IN ('USER_BEHAVIOR_EVENTS', 'USER_SESSIONS', 'BEHAVIOR_AGGREGATES');
   ```

### API 返回 500 错误

- 检查 Supabase 表名是否正确（注意大小写）
- 检查 RLS 策略是否允许插入
- 查看 Supabase Dashboard 的 Logs 查看详细错误

## 📝 下一步建议

1. **在其他关键页面添加追踪**
   - 项目详情页
   - 用户个人资料页
   - 申请页面

2. **创建分析仪表板**
   - 使用 `/api/analytics/stats` API
   - 显示用户行为统计

3. **优化追踪**
   - 添加更多事件类型
   - 追踪用户转化漏斗
   - 分析用户路径

## 📚 相关文档

- [完整使用文档](./BEHAVIOR_ANALYTICS_README.md)
- [快速开始指南](./BEHAVIOR_ANALYTICS_QUICKSTART.md)
- [实现总结](./BEHAVIOR_ANALYTICS_SUMMARY.md)

