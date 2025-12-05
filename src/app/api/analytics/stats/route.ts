// API 路由：获取行为统计
import { NextRequest, NextResponse } from 'next/server';
import { getBehaviorStats } from '@/lib/behavior-analytics';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const startDate = searchParams.get('start_date') || undefined;
    const endDate = searchParams.get('end_date') || undefined;
    const userId = searchParams.get('user_id') 
      ? parseInt(searchParams.get('user_id')!) 
      : undefined;

    const { data, error } = await getBehaviorStats(startDate, endDate, userId);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to get stats', details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      stats: data
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Invalid request', details: error.message },
      { status: 400 }
    );
  }
}

