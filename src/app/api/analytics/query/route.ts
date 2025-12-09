// API 路由：查询行为事件（使用 MongoDB）
import { NextRequest, NextResponse } from 'next/server';
import { getBehaviorEventsCollection, documentToBehaviorEvent } from '@/lib/mongodb-models';
import type { BehaviorEventDocument } from '@/lib/mongodb-models';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const collection = await getBehaviorEventsCollection();
    
    // 构建 MongoDB 查询过滤器
    const filter: any = {};

    if (searchParams.get('user_id')) {
      filter.user_id = parseInt(searchParams.get('user_id')!);
    }

    if (searchParams.get('event_type')) {
      const eventType = searchParams.get('event_type')!;
      if (eventType.includes(',')) {
        filter.event_type = { $in: eventType.split(',') };
      } else {
        filter.event_type = eventType;
      }
    }

    if (searchParams.get('start_date')) {
      filter.event_timestamp = { 
        ...filter.event_timestamp,
        $gte: new Date(searchParams.get('start_date')!)
      };
    }

    if (searchParams.get('end_date')) {
      const endDate = new Date(searchParams.get('end_date')!);
      endDate.setHours(23, 59, 59, 999);
      filter.event_timestamp = {
        ...filter.event_timestamp,
        $lte: endDate
      };
    }

    if (searchParams.get('session_id')) {
      filter.session_id = searchParams.get('session_id')!;
    }

    // JSONB 查询支持（event_data 字段）
    if (searchParams.get('event_data_key') && searchParams.get('event_data_value')) {
      const key = searchParams.get('event_data_key')!;
      const value = searchParams.get('event_data_value')!;
      filter[`event_data.${key}`] = value;
    }

    // 构建排序选项
    const orderBy = searchParams.get('order_by') || 'event_timestamp';
    const order = searchParams.get('order') || 'desc';
    const sort: any = {};
    sort[orderBy] = order === 'asc' ? 1 : -1;

    // 构建查询选项
    const options: any = { sort };
    
    if (searchParams.get('limit')) {
      options.limit = parseInt(searchParams.get('limit')!);
    }

    if (searchParams.get('offset')) {
      options.skip = parseInt(searchParams.get('offset')!);
    }

    // 执行查询
    const cursor = collection.find(filter, options);
    const documents = await cursor.toArray();

    // 转换为 UserBehaviorEvent 格式
    const events = documents.map((doc: BehaviorEventDocument) => 
      documentToBehaviorEvent(doc)
    );

    return NextResponse.json({ 
      success: true, 
      events,
      count: events.length
    });
  } catch (error: any) {
    console.error('Error querying events:', error);
    return NextResponse.json(
      { error: 'Failed to query events', details: error.message },
      { status: 500 }
    );
  }
}

