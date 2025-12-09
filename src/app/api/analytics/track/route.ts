// API 路由：记录行为事件（使用 MongoDB）
import { NextRequest, NextResponse } from 'next/server';
import { getBehaviorEventsCollection } from '@/lib/mongodb-models';
import { behaviorEventToDocument } from '@/lib/mongodb-models';
import { generateSessionId, parseUserAgent } from '@/lib/behavior-analytics';
import type { UserBehaviorEvent } from '@/types/behavior';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 处理批量事件
    if (body.events && Array.isArray(body.events)) {
      const collection = await getBehaviorEventsCollection();
      const events = body.events.map((event: any) => {
        const userAgent = request.headers.get('user-agent') || '';
        const referer = request.headers.get('referer') || '';
        const ipAddress = request.headers.get('x-forwarded-for') || 
                          request.headers.get('x-real-ip') || 
                          'unknown';
        const deviceInfo = parseUserAgent(userAgent);

        const eventData: UserBehaviorEvent = {
          user_id: event.user_id || null,
          event_type: event.event_type,
          event_timestamp: event.event_timestamp || new Date().toISOString(),
          session_id: event.session_id || generateSessionId(),
          page_url: event.page_url || request.url,
          referrer_url: event.referrer_url || referer,
          user_agent: userAgent,
          ip_address: ipAddress,
          event_data: event.event_data || {},
          metadata: {
            ...deviceInfo,
            ...event.metadata
          }
        };

        return behaviorEventToDocument(eventData);
      });

      const result = await collection.insertMany(events);
      return NextResponse.json({ 
        success: true, 
        inserted_count: result.insertedCount,
        inserted_ids: Object.values(result.insertedIds)
      });
    }

    // 处理单个事件
    const userAgent = request.headers.get('user-agent') || '';
    const referer = request.headers.get('referer') || '';
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';

    // 解析设备信息
    const deviceInfo = parseUserAgent(userAgent);

    // 构建事件数据
    const eventData: UserBehaviorEvent = {
      user_id: body.user_id || null,
      event_type: body.event_type,
      event_timestamp: body.event_timestamp || new Date().toISOString(),
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

    // 转换为 MongoDB 文档并插入
    const collection = await getBehaviorEventsCollection();
    const document = behaviorEventToDocument(eventData);
    const result = await collection.insertOne(document);

    return NextResponse.json({ 
      success: true, 
      event_id: result.insertedId.toString(),
      session_id: eventData.session_id,
      data: {
        _id: result.insertedId,
        ...document
      }
    });
  } catch (error: any) {
    console.error('Failed to track event:', error);
    return NextResponse.json(
      { 
        error: 'Failed to track event', 
        details: error.message,
        message: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

