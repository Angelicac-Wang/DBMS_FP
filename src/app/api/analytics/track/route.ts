// API 路由：记录行为事件
import { NextRequest, NextResponse } from 'next/server';
import { trackEvent, generateSessionId, parseUserAgent } from '@/lib/behavior-analytics';
import type { UserBehaviorEvent } from '@/types/behavior';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 获取请求信息
    const userAgent = request.headers.get('user-agent') || '';
    const referer = request.headers.get('referer') || '';
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';

    // 解析设备信息
    const deviceInfo = parseUserAgent(userAgent);

    // 构建事件对象
    const event: UserBehaviorEvent = {
      user_id: body.user_id || null,
      event_type: body.event_type,
      session_id: body.session_id || generateSessionId(),
      page_url: body.page_url || request.url,
      referrer_url: body.referrer_url || referer,
      user_agent: userAgent,
      ip_address: ipAddress,
      event_data: body.event_data || {},
      metadata: {
        ...deviceInfo,
        ...body.metadata
      }
    };

    const { data, error } = await trackEvent(event);

    if (error) {
      // 记录详细错误信息
      console.error('Failed to track event:', {
        error,
        event_type: event.event_type,
        user_id: event.user_id,
        session_id: event.session_id,
      });
      
      return NextResponse.json(
        { 
          error: 'Failed to track event', 
          details: error,
          message: error?.message || 'Unknown error',
          code: error?.code || 'UNKNOWN',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      event_id: data?.event_id,
      session_id: event.session_id 
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Invalid request', details: error.message },
      { status: 400 }
    );
  }
}

