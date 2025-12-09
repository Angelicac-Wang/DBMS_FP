// API 路由：获取行为统计（使用 MongoDB）
import { NextRequest, NextResponse } from 'next/server';
import { getBehaviorEventsCollection } from '@/lib/mongodb-models';
import type { BehaviorStats } from '@/types/behavior';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const collection = await getBehaviorEventsCollection();
    
    // 构建查询过滤器
    const filter: any = {};
    
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const userId = searchParams.get('user_id');

    if (startDate) {
      filter.event_timestamp = { 
        ...filter.event_timestamp,
        $gte: new Date(startDate)
      };
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.event_timestamp = {
        ...filter.event_timestamp,
        $lte: end
      };
    }

    if (userId) {
      filter.user_id = parseInt(userId);
    }

    // 获取所有匹配的事件
    const events = await collection.find(filter).toArray();

    // 计算统计信息
    const totalEvents = events.length;
    const uniqueUsers = new Set(events.map(e => e.user_id).filter(Boolean)).size;
    const uniqueSessions = new Set(events.map(e => e.session_id).filter(Boolean)).size;

    // 按事件类型统计
    const eventsByType: Record<string, number> = {};
    events.forEach(event => {
      const type = event.event_type;
      eventsByType[type] = (eventsByType[type] || 0) + 1;
    });

    // 按日期统计
    const eventsByDateMap: Record<string, number> = {};
    events.forEach(event => {
      const date = new Date(event.event_timestamp).toISOString().split('T')[0];
      eventsByDateMap[date] = (eventsByDateMap[date] || 0) + 1;
    });

    const eventsByDate = Object.entries(eventsByDateMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const stats: BehaviorStats = {
      total_events: totalEvents,
      unique_users: uniqueUsers,
      unique_sessions: uniqueSessions,
      events_by_type: eventsByType,
      events_by_date: eventsByDate,
    };

    return NextResponse.json({ 
      success: true, 
      ...stats
    });
  } catch (error: any) {
    console.error('Error getting stats:', error);
    return NextResponse.json(
      { error: 'Failed to get stats', details: error.message },
      { status: 500 }
    );
  }
}

