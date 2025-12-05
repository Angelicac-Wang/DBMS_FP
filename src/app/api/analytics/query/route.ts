// API 路由：查询行为事件
import { NextRequest, NextResponse } from 'next/server';
import { queryEvents } from '@/lib/behavior-analytics';
import type { BehaviorQuery } from '@/types/behavior';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const query: BehaviorQuery = {};

    // 解析查询参数
    if (searchParams.get('user_id')) {
      query.user_id = parseInt(searchParams.get('user_id')!);
    }

    if (searchParams.get('event_type')) {
      const eventType = searchParams.get('event_type')!;
      query.event_type = eventType.includes(',') 
        ? eventType.split(',') as any
        : eventType as any;
    }

    if (searchParams.get('start_date')) {
      query.start_date = searchParams.get('start_date')!;
    }

    if (searchParams.get('end_date')) {
      query.end_date = searchParams.get('end_date')!;
    }

    if (searchParams.get('session_id')) {
      query.session_id = searchParams.get('session_id')!;
    }

    if (searchParams.get('limit')) {
      query.limit = parseInt(searchParams.get('limit')!);
    }

    if (searchParams.get('offset')) {
      query.offset = parseInt(searchParams.get('offset')!);
    }

    if (searchParams.get('order_by')) {
      query.order_by = searchParams.get('order_by') as 'event_timestamp' | 'event_type';
    }

    if (searchParams.get('order')) {
      query.order = searchParams.get('order') as 'asc' | 'desc';
    }

    const { data, error } = await queryEvents(query);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to query events', details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      events: data,
      count: data?.length || 0
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Invalid request', details: error.message },
      { status: 400 }
    );
  }
}

