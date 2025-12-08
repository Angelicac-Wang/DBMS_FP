// 行为数据分析工具函数
import type { 
  UserBehaviorEvent, 
  UserSession, 
  BehaviorQuery, 
  BehaviorStats,
  EventType 
} from '@/types/behavior';

/**
 * 记录用户行为事件
 */
export async function trackEvent(event: UserBehaviorEvent): Promise<{ data: any; error: any }> {
  try {
    const insertData = {
      user_id: event.user_id || null,
      event_type: event.event_type,
      event_timestamp: event.event_timestamp || new Date().toISOString(),
      session_id: event.session_id,
      page_url: event.page_url,
      referrer_url: event.referrer_url,
      user_agent: event.user_agent,
      ip_address: event.ip_address,
      event_data: event.event_data,
      metadata: event.metadata || {}
    };

    console.log('Attempting to insert event:', {
      event_type: event.event_type,
      user_id: event.user_id,
      session_id: event.session_id,
    });

    const response = await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(insertData),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('API insert error:', result);
      return { data: null, error: result };
    }

    console.log('Event inserted successfully:', result.data?.event_id);
    return { data: result.data, error: null };
  } catch (error: any) {
    console.error('Exception in trackEvent:', error);
    return { data: null, error: { message: error.message, stack: error.stack } };
  }
}

/**
 * 批量记录行为事件
 */
export async function trackEvents(events: UserBehaviorEvent[]): Promise<{ data: any; error: any }> {
  try {
    const eventsToInsert = events.map(event => ({
      user_id: event.user_id || null,
      event_type: event.event_type,
      event_timestamp: event.event_timestamp || new Date().toISOString(),
      session_id: event.session_id,
      page_url: event.page_url,
      referrer_url: event.referrer_url,
      user_agent: event.user_agent,
      ip_address: event.ip_address,
      event_data: event.event_data,
      metadata: event.metadata || {}
    }));

    const response = await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: eventsToInsert }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { data: null, error: result };
    }

    return { data: result.data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * 查询行为事件
 */
export async function queryEvents(query: BehaviorQuery = {}): Promise<{ data: any[] | null; error: any }> {
  try {
    const params = new URLSearchParams();
    
    if (query.user_id) params.append('user_id', query.user_id.toString());
    if (query.event_type) {
      if (Array.isArray(query.event_type)) {
        params.append('event_type', query.event_type.join(','));
      } else {
        params.append('event_type', query.event_type);
      }
    }
    if (query.start_date) params.append('start_date', query.start_date);
    if (query.end_date) params.append('end_date', query.end_date);
    if (query.session_id) params.append('session_id', query.session_id);
    if (query.order_by) params.append('order_by', query.order_by);
    if (query.order) params.append('order', query.order);
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.offset) params.append('offset', query.offset.toString());

    const response = await fetch(`/api/analytics/query?${params.toString()}`);
    const result = await response.json();

    if (!response.ok) {
      return { data: null, error: result };
    }

    return { data: result.events || null, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * 创建或更新用户会话
 */
export async function createOrUpdateSession(session: UserSession): Promise<{ data: any; error: any }> {
  try {
    const response = await fetch('/api/analytics/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: session.session_id,
        user_id: session.user_id || null,
        started_at: session.started_at || new Date().toISOString(),
        ended_at: session.ended_at,
        duration_seconds: session.duration_seconds,
        page_views: session.page_views || 0,
        events_count: session.events_count || 0,
        device_type: session.device_type,
        browser: session.browser,
        os: session.os,
        country: session.country,
        city: session.city,
        session_data: session.session_data || {}
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { data: null, error: result };
    }

    return { data: result.data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * 结束会话
 */
export async function endSession(sessionId: string): Promise<{ data: any; error: any }> {
  try {
    const response = await fetch(`/api/analytics/session/${sessionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    });

    const result = await response.json();

    if (!response.ok) {
      return { data: null, error: result };
    }

    return { data: result.data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * 获取行为统计
 */
export async function getBehaviorStats(
  startDate?: Date | string,
  endDate?: Date | string,
  userId?: number
): Promise<{ data: BehaviorStats | null; error: any }> {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate.toString());
    if (endDate) params.append('end_date', endDate.toString());
    if (userId) params.append('user_id', userId.toString());

    const response = await fetch(`/api/analytics/stats?${params.toString()}`);
    const result = await response.json();

    if (!response.ok) {
      return { data: null, error: result };
    }

    return { data: result, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * 使用 JSONB 查询（高级查询）
 */
export async function queryByEventData(
  key: string,
  value: any,
  additionalQuery?: BehaviorQuery
): Promise<{ data: any[] | null; error: any }> {
  try {
    const params = new URLSearchParams();
    params.append('event_data_key', key);
    params.append('event_data_value', value);
    
    if (additionalQuery?.user_id) params.append('user_id', additionalQuery.user_id.toString());
    if (additionalQuery?.start_date) params.append('start_date', additionalQuery.start_date);
    if (additionalQuery?.end_date) params.append('end_date', additionalQuery.end_date);

    const response = await fetch(`/api/analytics/query?${params.toString()}`);
    const result = await response.json();

    if (!response.ok) {
      return { data: null, error: result };
    }

    return { data: result.events || null, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * 生成唯一的会话 ID
 */
export function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 从 User-Agent 提取设备信息
 */
export function parseUserAgent(userAgent?: string): {
  device_type?: 'desktop' | 'mobile' | 'tablet';
  browser?: string;
  os?: string;
} {
  if (!userAgent) {
    return {};
  }

  const ua = userAgent.toLowerCase();
  
  // 检测设备类型
  let device_type: 'desktop' | 'mobile' | 'tablet' | undefined;
  if (/tablet|ipad|playbook|silk/.test(ua)) {
    device_type = 'tablet';
  } else if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/.test(ua)) {
    device_type = 'mobile';
  } else {
    device_type = 'desktop';
  }

  // 检测浏览器
  let browser: string | undefined;
  if (ua.includes('chrome') && !ua.includes('edg')) {
    browser = 'Chrome';
  } else if (ua.includes('firefox')) {
    browser = 'Firefox';
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browser = 'Safari';
  } else if (ua.includes('edg')) {
    browser = 'Edge';
  }

  // 检测操作系统
  let os: string | undefined;
  if (ua.includes('windows')) {
    os = 'Windows';
  } else if (ua.includes('mac')) {
    os = 'macOS';
  } else if (ua.includes('linux')) {
    os = 'Linux';
  } else if (ua.includes('android')) {
    os = 'Android';
  } else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) {
    os = 'iOS';
  }

  return { device_type, browser, os };
}


