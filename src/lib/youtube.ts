interface YouTubeVideoResponse {
  items?: Array<{
    id: string;
    statistics?: {
      viewCount?: string;
      likeCount?: string;
      commentCount?: string;
    };
    snippet?: {
      title?: string;
      description?: string;
      thumbnails?: {
        default?: { url: string };
        medium?: { url: string };
        high?: { url: string };
        standard?: { url: string };
        maxres?: { url: string };
      };
    };
  }>;
  error?: {
    message: string;
    code: number;
  };
}

export async function getYouTubeVideoStats(videoId: string): Promise<{ viewCount: number; title?: string } | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    console.warn('YOUTUBE_API_KEY not configured');
    return null;
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${encodeURIComponent(videoId)}&key=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error('YouTube API error:', response.status, response.statusText);
      return null;
    }

    const data = (await response.json()) as YouTubeVideoResponse;

    if (data.error) {
      console.error('YouTube API error:', data.error.message);
      return null;
    }

    if (!data.items || data.items.length === 0) {
      return null;
    }

    const video = data.items[0];
    const viewCount = video.statistics?.viewCount
      ? parseInt(video.statistics.viewCount, 10)
      : 0;

    return {
      viewCount,
      title: video.snippet?.title,
    };
  } catch (error) {
    console.error('Error fetching YouTube video stats:', error);
    return null;
  }
}

export function extractYoutubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
  return match ? match[1] : null;
}



