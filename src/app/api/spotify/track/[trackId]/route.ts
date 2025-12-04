import { NextRequest, NextResponse } from 'next/server';

interface SpotifyTrackResponse {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images?: { url: string; height: number; width: number }[];
    release_date?: string;
  };
  duration_ms: number;
  preview_url: string | null;
  external_urls?: { spotify?: string };
  popularity?: number;
  explicit?: boolean;
}

async function getSpotifyAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET environment variables');
    throw new Error('Spotify credentials not configured');
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
    }).toString(),
    // Next.js route handlers run on the server; no need for additional options
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Failed to obtain Spotify access token:', text);
    throw new Error('Failed to obtain Spotify access token');
  }

  const data = (await res.json()) as { access_token: string; token_type: string; expires_in: number };
  return data.access_token;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ trackId: string }> }
): Promise<NextResponse> {
  const { trackId } = await params;

  if (!trackId) {
    return NextResponse.json({ error: 'Missing trackId' }, { status: 400 });
  }

  try {
    const token = await getSpotifyAccessToken();

    const res = await fetch(`https://api.spotify.com/v1/tracks/${encodeURIComponent(trackId)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 404) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    if (!res.ok) {
      const text = await res.text();
      console.error('Spotify tracks API error:', text);
      return NextResponse.json({ error: 'Spotify API error' }, { status: 500 });
    }

    const track = (await res.json()) as SpotifyTrackResponse;

    const image = track.album.images && track.album.images.length > 0
      ? track.album.images[0]
      : undefined;

    const normalized = {
      id: track.id,
      name: track.name,
      artists: track.artists.map((a) => a.name),
      albumName: track.album.name,
      albumImageUrl: image?.url ?? null,
      albumReleaseDate: track.album.release_date ?? null,
      durationMs: track.duration_ms,
      previewUrl: track.preview_url,
      spotifyUrl: track.external_urls?.spotify ?? null,
      popularity: track.popularity ?? null,
      explicit: track.explicit ?? null,
    };

    return NextResponse.json(normalized);
  } catch (error) {
    console.error('Error fetching Spotify track:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Spotify track' },
      { status: 500 }
    );
  }
}


