// 行为数据分析工具函数
import { supabase } from './supabase';
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

    const { data, error } = await supabase
      .from('user_behavior_events')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', {
        error,
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
    } else {
      console.log('Event inserted successfully:', data?.event_id);
    }

    return { data, error };
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

    const { data, error } = await supabase
      .from('user_behavior_events')
      .insert(eventsToInsert)
      .select();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * 查询行为事件
 */
export async function queryEvents(query: BehaviorQuery = {}): Promise<{ data: any[] | null; error: any }> {
  try {
    let queryBuilder = supabase
      .from('user_behavior_events')
      .select('*');

    // 应用过滤条件
    if (query.user_id) {
      queryBuilder = queryBuilder.eq('user_id', query.user_id);
    }

    if (query.event_type) {
      if (Array.isArray(query.event_type)) {
        queryBuilder = queryBuilder.in('event_type', query.event_type);
      } else {
        queryBuilder = queryBuilder.eq('event_type', query.event_type);
      }
    }

    if (query.start_date) {
      queryBuilder = queryBuilder.gte('event_timestamp', query.start_date);
    }

    if (query.end_date) {
      queryBuilder = queryBuilder.lte('event_timestamp', query.end_date);
    }

    if (query.session_id) {
      queryBuilder = queryBuilder.eq('session_id', query.session_id);
    }

    // 排序
    const orderBy = query.order_by || 'event_timestamp';
    const order = query.order || 'desc';
    queryBuilder = queryBuilder.order(orderBy, { ascending: order === 'asc' });

    // 分页
    if (query.limit) {
      queryBuilder = queryBuilder.limit(query.limit);
    }
    if (query.offset) {
      queryBuilder = queryBuilder.range(query.offset, query.offset + (query.limit || 100) - 1);
    }

    const { data, error } = await queryBuilder;

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * 创建或更新用户会话
 */
export async function createOrUpdateSession(session: UserSession): Promise<{ data: any; error: any }> {
  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .upsert({
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
      }, {
        onConflict: 'session_id'
      })
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * 结束会话
 */
export async function endSession(sessionId: string): Promise<{ data: any; error: any }> {
  try {
    // 获取会话开始时间
    const { data: session } = await supabase
      .from('user_sessions')
      .select('started_at')
      .eq('session_id', sessionId)
      .single();

    if (!session) {
      return { data: null, error: { message: 'Session not found' } };
    }

    const startedAt = new Date(session.started_at);
    const endedAt = new Date();
    const durationSeconds = Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000);

    const { data, error } = await supabase
      .from('user_sessions')
      .update({
        ended_at: endedAt.toISOString(),
        duration_seconds: durationSeconds
      })
      .eq('session_id', sessionId)
      .select()
      .single();

    return { data, error };
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
    let queryBuilder = supabase
      .from('user_behavior_events')
      .select('event_type, event_timestamp, user_id');

    if (startDate) {
      queryBuilder = queryBuilder.gte('event_timestamp', startDate);
    }
    if (endDate) {
      queryBuilder = queryBuilder.lte('event_timestamp', endDate);
    }
    if (userId) {
      queryBuilder = queryBuilder.eq('user_id', userId);
    }

    const { data: events, error } = await queryBuilder;

    if (error) {
      return { data: null, error };
    }

    if (!events) {
      return {
        data: {
          total_events: 0,
          unique_users: 0,
          unique_sessions: 0,
          events_by_type: {},
          events_by_date: []
        },
        error: null
      };
    }

    // 计算统计
    const totalEvents = events.length;
    const uniqueUsers = new Set(events.map(e => e.user_id).filter(Boolean)).size;
    const uniqueSessions = new Set(events.map(e => e.session_id).filter(Boolean)).size;

    // 按类型统计
    const eventsByType: Record<string, number> = {};
    events.forEach(event => {
      eventsByType[event.event_type] = (eventsByType[event.event_type] || 0) + 1;
    });

    // 按日期统计
    const eventsByDateMap = new Map<string, number>();
    events.forEach(event => {
      const date = new Date(event.event_timestamp).toISOString().split('T')[0];
      eventsByDateMap.set(date, (eventsByDateMap.get(date) || 0) + 1);
    });

    const eventsByDate = Array.from(eventsByDateMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      data: {
        total_events: totalEvents,
        unique_users: uniqueUsers,
        unique_sessions: uniqueSessions,
        events_by_type: eventsByType,
        events_by_date: eventsByDate
      },
      error: null
    };
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
    let queryBuilder = supabase
      .from('user_behavior_events')
      .select('*');

    // JSONB 查询
    queryBuilder = queryBuilder.eq(`event_data->>${key}`, value);

    // 应用其他查询条件
    if (additionalQuery?.user_id) {
      queryBuilder = queryBuilder.eq('user_id', additionalQuery.user_id);
    }
    if (additionalQuery?.start_date) {
      queryBuilder = queryBuilder.gte('event_timestamp', additionalQuery.start_date);
    }
    if (additionalQuery?.end_date) {
      queryBuilder = queryBuilder.lte('event_timestamp', additionalQuery.end_date);
    }

    const { data, error } = await queryBuilder;

    return { data, error };
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

