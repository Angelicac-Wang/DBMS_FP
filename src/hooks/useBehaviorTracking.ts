// React Hook：用于在组件中追踪用户行为
import { useCallback, useRef } from 'react';
import { generateSessionId } from '@/lib/behavior-analytics';
import type { EventType } from '@/types/behavior';

// 在客户端存储会话 ID
let sessionId: string | null = null;

export function getSessionId(): string {
  if (!sessionId) {
    sessionId = generateSessionId();
  }
  return sessionId;
}

export function useBehaviorTracking() {
  const sessionIdRef = useRef<string>(getSessionId());

  // 获取用户 ID
  const getUserId = (): number | null => {
    if (typeof window === 'undefined') return null;
    const userId = localStorage.getItem('userId');
    return userId ? parseInt(userId, 10) : null;
  };

  // 追踪页面浏览
  const trackPageView = useCallback(async (pagePath: string, pageTitle?: string) => {
    try {
      const response = await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: getUserId(),
          event_type: 'page_view',
          session_id: sessionIdRef.current,
          page_url: window.location.href,
          referrer_url: document.referrer,
          event_data: {
            page_path: pagePath,
            page_title: pageTitle || document.title,
          },
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        // 只在开发环境显示错误
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to track page view:', result);
        }
      } else {
        // 只在开发环境显示成功日志
        if (process.env.NODE_ENV === 'development') {
          console.log('Page view tracked successfully');
        }
      }
    } catch (error) {
      // 静默处理错误，避免影响用户体验
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to track page view:', error);
      }
    }
  }, []);

  // 追踪自定义事件
  const trackEvent = useCallback(async (
    eventType: EventType,
    eventData?: Record<string, any>
  ) => {
    try {
      const response = await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: getUserId(),
          event_type: eventType,
          session_id: sessionIdRef.current,
          page_url: window.location.href,
          event_data: eventData || {},
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('Failed to track event:', result);
      } else {
        console.log('Event tracked successfully:', result);
      }
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }, []);

  // 追踪点击事件
  const trackClick = useCallback(async (
    elementId: string,
    elementText?: string,
    additionalData?: Record<string, any>
  ) => {
    await trackEvent('click', {
      element_id: elementId,
      element_text: elementText,
      ...additionalData,
    });
  }, [trackEvent]);

  // 追踪项目查看
  const trackProjectView = useCallback(async (
    projectId: number,
    projectTitle?: string,
    songId?: number
  ) => {
    await trackEvent('project_view', {
      project_id: projectId,
      project_title: projectTitle,
      song_id: songId,
    });
  }, [trackEvent]);

  // 追踪搜索
  const trackSearch = useCallback(async (
    query: string,
    resultsCount?: number,
    filters?: Record<string, any>
  ) => {
    await trackEvent('search', {
      query,
      results_count: resultsCount,
      filters,
    });
  }, [trackEvent]);

  return {
    trackPageView,
    trackEvent,
    trackClick,
    trackProjectView,
    trackSearch,
    sessionId: sessionIdRef.current,
  };
}

