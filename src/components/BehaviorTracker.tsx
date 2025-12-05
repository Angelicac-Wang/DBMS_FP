// 行为追踪组件示例
'use client';

import { useBehaviorTracking } from '@/hooks/useBehaviorTracking';
import { useEffect } from 'react';

interface BehaviorTrackerProps {
  pagePath: string;
  pageTitle?: string;
  userId?: number;
  children: React.ReactNode;
}

/**
 * 行为追踪包装组件
 * 自动追踪页面浏览，并提供追踪功能给子组件
 */
export default function BehaviorTracker({
  pagePath,
  pageTitle,
  userId,
  children,
}: BehaviorTrackerProps) {
  const { trackPageView } = useBehaviorTracking();

  useEffect(() => {
    // 页面加载时自动追踪
    trackPageView(pagePath, pageTitle);
  }, [pagePath, pageTitle, trackPageView]);

  return <>{children}</>;
}

