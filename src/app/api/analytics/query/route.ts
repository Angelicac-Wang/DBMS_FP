// API 路由：查询行为事件
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // 构建查询
    let query = 'SELECT * FROM user_behavior_events WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (searchParams.get('user_id')) {
      query += ` AND user_id = $${paramIndex++}`;
      params.push(parseInt(searchParams.get('user_id')!));
    }

    if (searchParams.get('event_type')) {
      const eventType = searchParams.get('event_type')!;
      if (eventType.includes(',')) {
        const types = eventType.split(',');
        query += ` AND event_type = ANY($${paramIndex++})`;
        params.push(types);
      } else {
        query += ` AND event_type = $${paramIndex++}`;
        params.push(eventType);
      }
    }

    if (searchParams.get('start_date')) {
      query += ` AND event_timestamp >= $${paramIndex++}`;
      params.push(searchParams.get('start_date')!);
    }

    if (searchParams.get('end_date')) {
      query += ` AND event_timestamp <= $${paramIndex++}`;
      params.push(searchParams.get('end_date')! + 'T23:59:59');
    }

    if (searchParams.get('session_id')) {
      query += ` AND session_id = $${paramIndex++}`;
      params.push(searchParams.get('session_id')!);
    }

    // 排序
    const orderBy = searchParams.get('order_by') || 'event_timestamp';
    const order = searchParams.get('order') || 'desc';
    query += ` ORDER BY ${orderBy} ${order.toUpperCase()}`;

    // 限制
    if (searchParams.get('limit')) {
      query += ` LIMIT $${paramIndex++}`;
      params.push(parseInt(searchParams.get('limit')!));
    }

    if (searchParams.get('offset')) {
      query += ` OFFSET $${paramIndex++}`;
      params.push(parseInt(searchParams.get('offset')!));
    }

    const result = await pool.query(query, params);

    return NextResponse.json({ 
      success: true, 
      events: result.rows,
      count: result.rows.length
    });
  } catch (error: any) {
    console.error('Error querying events:', error);
    return NextResponse.json(
      { error: 'Failed to query events', details: error.message },
      { status: 500 }
    );
  }
}

