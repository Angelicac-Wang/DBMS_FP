// API 路由：记录行为事件
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { generateSessionId, parseUserAgent } from '@/lib/behavior-analytics';

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

    // 构建插入数据
    const insertData = {
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

    // 生成 event_id（如果表没有序列，需要手动生成）
    // 使用时间戳 + 随机数确保唯一性
    const nextEventId = Date.now() * 1000 + Math.floor(Math.random() * 1000);

    // 直接插入数据库
    // JSONB 字段需要明确转换
    const result = await pool.query(
      `INSERT INTO user_behavior_events (
        event_id, user_id, event_type, event_timestamp, session_id,
        page_url, referrer_url, user_agent, ip_address,
        event_data, metadata
      ) VALUES ($1, $2, $3, $4::timestamp, $5, $6, $7, $8, $9, $10::jsonb, $11::jsonb)
      RETURNING event_id`,
      [
        nextEventId,
        insertData.user_id,
        insertData.event_type,
        insertData.event_timestamp,
        insertData.session_id,
        insertData.page_url,
        insertData.referrer_url,
        insertData.user_agent,
        insertData.ip_address,
        JSON.stringify(insertData.event_data), // JSONB 需要 JSON 字符串
        JSON.stringify(insertData.metadata)   // JSONB 需要 JSON 字符串
      ]
    );

    return NextResponse.json({ 
      success: true, 
      event_id: result.rows[0]?.event_id,
      session_id: insertData.session_id,
      data: result.rows[0]
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

