// API 路由：结束会话（使用 MongoDB）
import { NextRequest, NextResponse } from 'next/server';
import { getSessionsCollection } from '@/lib/mongodb-models';

export async function PUT(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId;
    const collection = await getSessionsCollection();

    // 查找会话
    const session = await collection.findOne({ session_id: sessionId });
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // 计算持续时间
    const startedAt = new Date(session.started_at);
    const endedAt = new Date();
    const durationSeconds = Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000);

    // 更新会话
    const result = await collection.updateOne(
      { session_id: sessionId },
      {
        $set: {
          ended_at: endedAt,
          duration_seconds: durationSeconds,
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({ 
      success: true, 
      data: {
        session_id: sessionId,
        ended_at: endedAt,
        duration_seconds: durationSeconds,
        modified: result.modifiedCount > 0
      }
    });
  } catch (error: any) {
    console.error('Failed to end session:', error);
    return NextResponse.json(
      { 
        error: 'Failed to end session', 
        details: error.message,
      },
      { status: 500 }
    );
  }
}


