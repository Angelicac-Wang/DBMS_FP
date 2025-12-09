// API 路由：创建或更新用户会话（使用 MongoDB）
import { NextRequest, NextResponse } from 'next/server';
import { getSessionsCollection, sessionToDocument } from '@/lib/mongodb-models';
import type { UserSession } from '@/types/behavior';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const collection = await getSessionsCollection();

    const sessionData: UserSession = {
      session_id: body.session_id,
      user_id: body.user_id || null,
      started_at: body.started_at || new Date().toISOString(),
      ended_at: body.ended_at,
      duration_seconds: body.duration_seconds,
      page_views: body.page_views || 0,
      events_count: body.events_count || 0,
      device_type: body.device_type,
      browser: body.browser,
      os: body.os,
      country: body.country,
      city: body.city,
      session_data: body.session_data || {}
    };

    // 转换为 MongoDB 文档
    const document = sessionToDocument(sessionData);

    // 使用 upsert 操作（如果存在则更新，不存在则创建）
    const result = await collection.updateOne(
      { session_id: sessionData.session_id },
      { 
        $set: {
          ...document,
          updatedAt: new Date()
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    return NextResponse.json({ 
      success: true, 
      data: {
        session_id: sessionData.session_id,
        upserted: result.upsertedCount > 0,
        modified: result.modifiedCount > 0
      }
    });
  } catch (error: any) {
    console.error('Failed to create/update session:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create/update session', 
        details: error.message,
      },
      { status: 500 }
    );
  }
}

