import { NextRequest, NextResponse } from 'next/server';
import { getYouTubeVideoStats } from '@/lib/youtube';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
): Promise<NextResponse> {
  const { videoId } = await params;

  if (!videoId) {
    return NextResponse.json({ error: 'Missing videoId' }, { status: 400 });
  }

  try {
    const stats = await getYouTubeVideoStats(videoId);

    if (!stats) {
      return NextResponse.json(
        { error: 'Failed to fetch video stats' },
        { status: 404 }
      );
    }

    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch YouTube video stats' },
      { status: 500 }
    );
  }
}

