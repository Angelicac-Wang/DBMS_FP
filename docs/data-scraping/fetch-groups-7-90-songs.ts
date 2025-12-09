/**
 * 從資料庫中取得 group_id 為 7-90 的團體，從 Spotify 抓取歌曲資訊
 * 在插入前檢查重複（title + group_id 相同則為重複）
 * 
 * 使用方法：
 * 1. 確保 .env.local 有 SPOTIFY_CLIENT_ID 和 SPOTIFY_CLIENT_SECRET
 * 2. 確保 .env.local 有 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY
 * 3. 執行: npx tsx docs/data-scraping/fetch-groups-7-90-songs.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// 載入環境變數（從專案根目錄）
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/export$/, '');
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
  console.error('❌ 錯誤: 請在 .env.local 設定 SPOTIFY_CLIENT_ID 和 SPOTIFY_CLIENT_SECRET');
  process.exit(1);
}

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ 錯誤: 請在 .env.local 設定 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string; id?: string }[];
  album: {
    name: string;
    release_date: string;
    images?: { url: string }[];
  };
  duration_ms: number;
  external_urls: { spotify: string };
  preview_url: string | null;
  popularity?: number;
}

interface SpotifyArtist {
  id: string;
  name: string;
  popularity?: number;
  followers?: { total: number };
  genres?: string[];
}

interface KpopSongRow {
  song_id: number;
  title: string;
  title_kr: string;
  release_date: string;
  duration: number;
  difficulty_level: number;
  spotify_url: string;
  youtube_original_url: string;
}

/**
 * 取得 Spotify Access Token
 */
async function getSpotifyAccessToken(): Promise<string> {
  const basic = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
    }).toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to get Spotify token: ${text}`);
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

/**
 * 搜尋 Spotify 藝人
 */
async function searchSpotifyArtist(artistName: string): Promise<SpotifyArtist | null> {
  const token = await getSpotifyAccessToken();

  const searchParams = new URLSearchParams({
    q: artistName,
    type: 'artist',
    limit: '1',
    market: 'KR',
  });

  const res = await fetchWithRetry(
    `https://api.spotify.com/v1/search?${searchParams}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Spotify artist search failed: ${text}`);
  }

  const data = (await res.json()) as { artists: { items: SpotifyArtist[] } };
  return data.artists.items.length > 0 ? data.artists.items[0] : null;
}

/**
 * 帶重試機制的 fetch 函數
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 3,
  retryDelay: number = 5000,
  maxWaitTime: number = 60000 // 最大等待時間 60 秒
): Promise<Response> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const res = await fetch(url, options);

    if (res.status === 429) {
      // Too many requests - 等待更長時間
      const retryAfter = res.headers.get('Retry-After');
      let waitTime: number;
      
      if (retryAfter) {
        const retrySeconds = parseInt(retryAfter);
        // 如果 Retry-After 超過 60 秒，限制為 60 秒
        waitTime = Math.min(retrySeconds * 1000, maxWaitTime);
      } else {
        // 使用遞增的等待時間，但不超過最大等待時間
        waitTime = Math.min(retryDelay * (attempt + 1), maxWaitTime);
      }
      
      const waitSeconds = Math.floor(waitTime / 1000);
      console.log(`   ⚠️  遇到速率限制，等待 ${waitSeconds} 秒後重試... (嘗試 ${attempt + 1}/${maxRetries})`);
      
      // 如果等待時間太長（超過 5 分鐘），建議跳過
      if (waitTime > 300000) {
        console.log(`   ⚠️  等待時間過長（${waitSeconds} 秒），建議稍後再試或跳過此請求`);
      }
      
      await new Promise(resolve => setTimeout(resolve, waitTime));
      continue;
    }

    if (!res.ok && res.status >= 500 && attempt < maxRetries - 1) {
      // 伺服器錯誤，重試
      const waitSeconds = Math.floor(retryDelay / 1000);
      console.log(`   ⚠️  伺服器錯誤 (${res.status})，等待 ${waitSeconds} 秒後重試... (嘗試 ${attempt + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      continue;
    }

    return res;
  }

  throw new Error(`請求失敗，已重試 ${maxRetries} 次`);
}

/**
 * 獲取藝人的所有專輯（通過藝人 ID）
 */
async function getArtistAlbums(artistId: string): Promise<Array<{ id: string; name: string; album_type: string }>> {
  const token = await getSpotifyAccessToken();
  const allAlbums: Array<{ id: string; name: string; album_type: string }> = [];
  
  let offset = 0;
  const limit = 50;
  let hasMore = true;

  while (hasMore) {
    const searchParams = new URLSearchParams({
      include_groups: 'album,single,compilation',
      limit: limit.toString(),
      offset: offset.toString(),
      market: 'KR',
    });

    const res = await fetchWithRetry(
      `https://api.spotify.com/v1/artists/${artistId}/albums?${searchParams}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to get artist albums: ${text}`);
    }

    const data = (await res.json()) as { items: Array<{ id: string; name: string; album_type: string }>; total: number };
    
    allAlbums.push(...data.items);
    
    if (offset === 0) {
      console.log(`   總共 ${data.total} 個專輯/單曲（已獲取 ${allAlbums.length} 個）...`);
    }
    
    const shouldStop = 
      allAlbums.length >= data.total ||
      data.items.length < limit ||
      offset + data.items.length >= data.total;
    
    if (shouldStop) {
      hasMore = false;
      if (allAlbums.length < data.total) {
        console.log(`   ⚠️  警告: 只獲取了 ${allAlbums.length}/${data.total} 個專輯`);
      } else {
        console.log(`   ✅ 已獲取所有 ${allAlbums.length} 個專輯`);
      }
    } else {
      offset += limit;
      await new Promise(resolve => setTimeout(resolve, 500)); // 增加延遲到 500ms
    }
  }

  return allAlbums;
}

/**
 * 專輯中的簡化歌曲資訊
 */
interface AlbumTrack {
  id: string;
  name: string;
  artists: { name: string; id?: string }[];
  duration_ms?: number;
}

/**
 * 獲取專輯中的所有歌曲
 */
async function getAlbumTracks(albumId: string): Promise<AlbumTrack[]> {
  const token = await getSpotifyAccessToken();
  const allTracks: AlbumTrack[] = [];
  
  let offset = 0;
  const limit = 50;
  let hasMore = true;

  while (hasMore) {
    const searchParams = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      market: 'KR',
    });

    const res = await fetchWithRetry(
      `https://api.spotify.com/v1/albums/${albumId}/tracks?${searchParams}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to get album tracks: ${text}`);
    }

    const data = (await res.json()) as { items: AlbumTrack[]; total: number };
    
    allTracks.push(...data.items);
    
    if (data.items.length < limit || allTracks.length >= data.total) {
      hasMore = false;
    } else {
      offset += limit;
      await new Promise(resolve => setTimeout(resolve, 500)); // 增加延遲到 500ms
    }
  }

  return allTracks;
}

/**
 * 獲取完整的歌曲資訊
 */
async function getTrackDetails(trackId: string): Promise<SpotifyTrack | null> {
  const token = await getSpotifyAccessToken();

  try {
    const res = await fetchWithRetry(
      `https://api.spotify.com/v1/tracks/${trackId}?market=KR`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      2, // 最多重試 2 次
      2000 // 重試延遲 2 秒
    );

    if (!res.ok) {
      return null;
    }

    return (await res.json()) as SpotifyTrack;
  } catch (error) {
    console.log(`      ⚠️  獲取歌曲詳情失敗: ${trackId}`);
    return null;
  }
}

/**
 * 獲取藝人的所有歌曲（通過專輯）
 */
async function getAllArtistTracksViaAlbums(artistId: string, artistName: string): Promise<SpotifyTrack[]> {
  console.log(`   開始獲取 ${artistName} 的所有專輯...`);
  
  const albums = await getArtistAlbums(artistId);
  console.log(`   ✅ 找到 ${albums.length} 個專輯/單曲`);
  
  if (albums.length === 0) {
    return [];
  }

  const allTracks: SpotifyTrack[] = [];
  const trackIds = new Set<string>();

  for (let i = 0; i < albums.length; i++) {
    const album = albums[i];
    console.log(`   [${i + 1}/${albums.length}] 處理專輯: ${album.name} (${album.album_type})`);
    
    try {
      const tracks = await getAlbumTracks(album.id);
      
      for (const track of tracks) {
        if (!track.id) {
          console.log(`      ⚠️  跳過沒有 ID 的歌曲: ${track.name}`);
          continue;
        }
        
        if (!trackIds.has(track.id)) {
          trackIds.add(track.id);
          
          const fullTrack = await getTrackDetails(track.id);
          if (fullTrack) {
            if (fullTrack.artists && fullTrack.artists.length > 0) {
              const mainArtist = fullTrack.artists[0];
              if (mainArtist.id === artistId || mainArtist.name.toLowerCase() === artistName.toLowerCase()) {
                allTracks.push(fullTrack);
              }
            }
          }
          
          await new Promise(resolve => setTimeout(resolve, 200)); // 增加延遲到 200ms
        }
      }
      
      console.log(`      ✅ 從此專輯取得 ${tracks.length} 首歌曲（總計: ${allTracks.length} 首）`);
      
      if (i < albums.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 增加延遲到 1 秒
      }
    } catch (error) {
      console.error(`      ❌ 處理專輯時發生錯誤: ${album.name}`, error);
    }
  }

  return allTracks;
}

/**
 * 提取字串中的韓文部分
 */
function extractKoreanText(text: string): string | null {
  const koreanRegex = /[\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]+/g;
  const matches = text.match(koreanRegex);
  
  if (matches && matches.length > 0) {
    return matches.join(' ').trim();
  }
  
  return null;
}

/**
 * 從歌曲名稱中移除藝人名稱
 */
function removeArtistNameFromTitle(trackName: string, artists: { name: string }[]): string {
  if (!artists || artists.length === 0) {
    return trackName;
  }

  const mainArtist = artists[0].name.trim();
  let cleaned = trackName;
  
  cleaned = cleaned.replace(new RegExp(`^${mainArtist}\\s*-\\s*`, 'i'), '');
  cleaned = cleaned.replace(new RegExp(`\\s*-\\s*${mainArtist}$`, 'i'), '');
  cleaned = cleaned.replace(new RegExp(`^${mainArtist}\\s*:\\s*`, 'i'), '');
  cleaned = cleaned.replace(new RegExp(`\\s*\\(${mainArtist}\\)`, 'i'), '');
  
  return cleaned.trim() || trackName;
}

/**
 * 解析歌曲名稱，分離英文和韓文
 */
function parseSongName(name: string, artists: { name: string }[]): { title: string; titleKr: string } {
  const nameWithoutArtist = removeArtistNameFromTitle(name, artists);
  const koreanText = extractKoreanText(nameWithoutArtist);
  
  if (koreanText) {
    const koreanBracketPattern = /[\(\[\{（【][^\)\]\}）】]*[\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]+[^\(\[\{（【]*[\)\]\}）】]/g;
    
    let englishText = nameWithoutArtist.replace(koreanBracketPattern, '').trim();
    englishText = englishText.replace(/[\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]+/g, '').trim();
    englishText = englishText.replace(/[\(\[\{（【]\s*[\)\]\}）】]/g, '').trim();
    englishText = englishText.replace(/^[-:\s]+|[-:\s]+$/g, '').trim();
    englishText = englishText.replace(/\s+/g, ' ').trim();
    
    return {
      title: englishText || koreanText,
      titleKr: koreanText,
    };
  } else {
    return {
      title: nameWithoutArtist || name,
      titleKr: nameWithoutArtist || name,
    };
  }
}

/**
 * 轉換 Spotify Track 為 KPOP_SONGS 格式
 */
function convertToKpopSong(track: SpotifyTrack, songId: number): KpopSongRow {
  const duration = Math.floor(track.duration_ms / 1000);

  let releaseDate = track.album.release_date;
  if (releaseDate.length === 4) {
    releaseDate = `${releaseDate}-01-01`;
  } else if (releaseDate.length === 7) {
    releaseDate = `${releaseDate}-01`;
  }

  const { title, titleKr } = parseSongName(track.name, track.artists);

  const youtubeUrl = 'https://www.youtube.com';
  const difficultyLevel = 5;

  return {
    song_id: songId,
    title,
    title_kr: titleKr,
    release_date: releaseDate,
    duration,
    difficulty_level: difficultyLevel,
    spotify_url: track.external_urls.spotify,
    youtube_original_url: youtubeUrl,
  };
}

/**
 * 取得下一個可用的 song_id
 */
async function getNextSongId(): Promise<number> {
  const { data, error } = await supabase
    .from('kpop_songs')
    .select('song_id')
    .order('song_id', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('查詢 song_id 時發生錯誤:', error);
    return Date.now();
  }

  if (data && data.song_id) {
    return data.song_id + 1;
  }

  return 1;
}

/**
 * 檢查歌曲是否已存在（用 spotify_url 判斷），返回 song_id 或 null
 */
async function getSongIdBySpotifyUrl(spotifyUrl: string): Promise<number | null> {
  const { data, error } = await supabase
    .from('kpop_songs')
    .select('song_id')
    .eq('spotify_url', spotifyUrl)
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('檢查歌曲是否存在時發生錯誤:', error);
    return null;
  }

  return data?.song_id || null;
}

/**
 * 檢查歌曲是否重複（title + group_id 相同）
 * 返回已存在的 song_id 或 null
 */
async function checkDuplicateSong(title: string, groupId: number): Promise<number | null> {
  // 分步查詢：先查詢該 group_id 的所有 song_id
  const { data: songGroups, error: sgError } = await supabase
    .from('song_group')
    .select('song_id')
    .eq('group_id', groupId);

  if (sgError || !songGroups || songGroups.length === 0) {
    return null;
  }

  const songIds = songGroups.map(sg => sg.song_id);

  if (songIds.length === 0) {
    return null;
  }

  // 查詢這些 song_id 中是否有相同 title 的歌曲
  const { data: existingSongs, error: songsError } = await supabase
    .from('kpop_songs')
    .select('song_id')
    .eq('title', title)
    .in('song_id', songIds)
    .limit(1);

  if (songsError) {
    return null;
  }

  if (existingSongs && existingSongs.length > 0) {
    return existingSongs[0].song_id;
  }

  return null;
}

/**
 * 從資料庫取得 group_id 為 7-90 的團體資訊
 */
async function getGroupsByIds(): Promise<Array<{ group_id: number; group_name: string }>> {
  const { data, error } = await supabase
    .from('kpop_groups')
    .select('group_id, group_name')
    .gte('group_id', 67)
    .lte('group_id', 90)
    .order('group_id', { ascending: true });

  if (error) {
    console.error('查詢團體時發生錯誤:', error);
    return [];
  }

  return data || [];
}

/**
 * 插入歌曲到資料庫，返回 song_id
 */
async function insertSong(song: KpopSongRow): Promise<number | null> {
  // 先檢查 spotify_url 是否已存在
  const existingSongId = await getSongIdBySpotifyUrl(song.spotify_url);
  if (existingSongId) {
    return existingSongId; // 返回已存在的 song_id，不插入
  }

  const { error, data } = await supabase.from('kpop_songs').insert(song).select('song_id');

  if (error) {
    console.error(`  ❌ 插入失敗: ${song.title}`, error);
    return null;
  }

  return data && data.length > 0 ? data[0].song_id : null;
}

/**
 * 插入歌曲和團體的關聯到 song_group 表
 */
async function insertSongGroup(songId: number, groupId: number): Promise<boolean> {
  const { data: existing } = await supabase
    .from('song_group')
    .select('song_id, group_id')
    .eq('song_id', songId)
    .eq('group_id', groupId)
    .limit(1)
    .single();

  if (existing) {
    return false; // 關聯已存在
  }

  const { error } = await supabase.from('song_group').insert({
    song_id: songId,
    group_id: groupId,
  });

  if (error) {
    console.error(`  ❌ 插入 song_group 關聯失敗: song_id=${songId}, group_id=${groupId}`, error);
    return false;
  }

  return true;
}

/**
 * 主函數
 */
async function main() {
  try {
    // 從資料庫取得 group_id 為 7-90 的團體
    console.log('📋 從資料庫讀取 group_id 為 66-90 的團體...\n');
    const groups = await getGroupsByIds();
    
    if (groups.length === 0) {
      console.error('❌ 找不到 group_id 為 66-90 的團體');
      process.exit(1);
    }

    console.log(`✅ 找到 ${groups.length} 個團體:`);
    groups.forEach(group => {
      console.log(`   - [ID: ${group.group_id}] ${group.group_name}`);
    });
    console.log('');

    // 取得起始 song_id
    let currentSongId = await getNextSongId();
    let totalSuccessCount = 0;
    let totalSkipCount = 0;
    let totalDuplicateCount = 0;
    let totalErrorCount = 0;

    // 處理每個團體
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🎤 [${i + 1}/${groups.length}] 處理團體: ${group.group_name} (ID: ${group.group_id})`);
      console.log(`${'='.repeat(60)}\n`);

      try {
        // 搜尋藝人
        let artistInfo: SpotifyArtist | null = null;
        try {
          artistInfo = await searchSpotifyArtist(group.group_name);
        } catch (error: any) {
          if (error.message && error.message.includes('速率限制')) {
            console.log(`   ⚠️  搜尋藝人時遇到速率限制，跳過此團體`);
            console.log('   建議稍後再試或手動處理此團體\n');
            continue;
          }
          throw error;
        }
        
        if (!artistInfo) {
          console.log(`❌ 找不到藝人: "${group.group_name}"`);
          console.log('   跳過此團體\n');
          continue;
        }

        console.log(`✅ 找到藝人: ${artistInfo.name}`);
        if (artistInfo.followers) {
          console.log(`   追蹤者: ${artistInfo.followers.total.toLocaleString()}`);
        }
        if (artistInfo.popularity !== undefined) {
          console.log(`   熱門度: ${artistInfo.popularity}/100`);
        }
        if (artistInfo.genres && artistInfo.genres.length > 0) {
          console.log(`   類型: ${artistInfo.genres.join(', ')}`);
        }

        // 通過專輯獲取所有歌曲
        console.log('\n📥 開始獲取所有歌曲（通過專輯）...\n');
        let tracks: SpotifyTrack[] = [];
        try {
          tracks = await getAllArtistTracksViaAlbums(artistInfo.id, artistInfo.name);
        } catch (error: any) {
          if (error.message && (error.message.includes('速率限制') || error.message.includes('Too many requests'))) {
            console.log(`   ⚠️  獲取歌曲時遇到速率限制，跳過此團體`);
            console.log('   建議稍後再試或手動處理此團體\n');
            continue;
          }
          throw error;
        }

        console.log(`✅ 成功取得 ${tracks.length} 首歌曲\n`);

        if (tracks.length === 0) {
          console.log('   沒有找到任何歌曲，跳過\n');
          continue;
        }

        // 顯示搜尋結果（只顯示前 5 首）
        console.log('📋 搜尋結果（前 5 首）:');
        tracks.slice(0, 5).forEach((track, index) => {
          const artists = track.artists.map(a => a.name).join(', ');
          const duration = Math.floor(track.duration_ms / 1000);
          const minutes = Math.floor(duration / 60);
          const seconds = duration % 60;
          const { title, titleKr } = parseSongName(track.name, track.artists);
          const hasKorean = extractKoreanText(track.name) !== null;
          const koreanIndicator = hasKorean ? '🇰🇷' : '⚠️  (無韓文)';
          
          const displayName = title !== track.name ? `${title} (原始: ${track.name})` : track.name;
          console.log(
            `  ${index + 1}. ${displayName} - ${artists} (${minutes}:${seconds.toString().padStart(2, '0')}) ${koreanIndicator}`
          );
          if (hasKorean && titleKr !== title) {
            console.log(`      → 韓文: ${titleKr}`);
          }
        });
        if (tracks.length > 5) {
          console.log(`  ... 還有 ${tracks.length - 5} 首歌曲`);
        }

        console.log('\n🔍 檢查重複並匯入資料庫...\n');

        let successCount = 0;
        let skipCount = 0;
        let duplicateCount = 0;
        let errorCount = 0;
        let relationCount = 0;

        // 匯入每首歌曲
        for (const track of tracks) {
          try {
            const song = convertToKpopSong(track, currentSongId);
            
            // 檢查重複：title + group_id 相同
            const duplicateSongId = await checkDuplicateSong(song.title, group.group_id);
            if (duplicateSongId) {
              console.log(`  ⏭️  跳過（重複）: ${song.title} (已存在 song_id: ${duplicateSongId})`);
              duplicateCount++;
              totalDuplicateCount++;
              continue;
            }

            // 檢查 spotify_url 是否已存在
            const existingSongId = await getSongIdBySpotifyUrl(song.spotify_url);
            if (existingSongId) {
              // 如果 spotify_url 已存在，檢查是否已經有關聯
              const { data: existingRelation } = await supabase
                .from('song_group')
                .select('song_id')
                .eq('song_id', existingSongId)
                .eq('group_id', group.group_id)
                .limit(1)
                .single();

              if (!existingRelation) {
                // 沒有關聯，建立關聯
                const relationInserted = await insertSongGroup(existingSongId, group.group_id);
                if (relationInserted) {
                  relationCount++;
                  console.log(`  🔗 建立關聯: ${song.title} (song_id: ${existingSongId})`);
                }
              }
              skipCount++;
              continue;
            }

            // 插入新歌曲
            const songId = await insertSong(song);

            if (songId) {
              // 建立與團體的關聯
              const relationInserted = await insertSongGroup(songId, group.group_id);
              if (relationInserted) {
                relationCount++;
              }

              const isNew = songId >= currentSongId;
              
              if (isNew) {
                const hasKorean = extractKoreanText(track.name) !== null;
                const koreanIndicator = hasKorean ? '🇰🇷' : '⚠️';
                if (hasKorean && song.title_kr !== song.title) {
                  console.log(`  ✅ [${songId}] ${song.title} ${koreanIndicator} (韓文: ${song.title_kr})`);
                } else {
                  console.log(`  ✅ [${songId}] ${song.title} ${koreanIndicator}`);
                }
                currentSongId = songId + 1;
                successCount++;
              } else {
                skipCount++;
              }
            } else {
              errorCount++;
            }

            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.error(`  ❌ 處理歌曲時發生錯誤: ${track.name}`, error);
            errorCount++;
          }
        }

        console.log('\n📊 匯入結果:');
        console.log(`  ✅ 成功: ${successCount} 首`);
        console.log(`  ⏭️  跳過（spotify_url 已存在）: ${skipCount} 首`);
        console.log(`  🔄 跳過（title + group_id 重複）: ${duplicateCount} 首`);
        console.log(`  ❌ 錯誤: ${errorCount} 首`);
        console.log(`  🔗 建立團體關聯: ${relationCount} 個`);

        totalSuccessCount += successCount;
        totalSkipCount += skipCount;
        totalErrorCount += errorCount;

        // 統計有多少首有韓文、多少首沒有
        const songsWithKorean = tracks.filter(t => extractKoreanText(t.name) !== null).length;
        const songsWithoutKorean = tracks.length - songsWithKorean;
        
        if (successCount > 0) {
          console.log('\n📊 統計:');
          console.log(`  📥 本次匯入: ${successCount} 首`);
          if (songsWithoutKorean > 0) {
            console.log(`  ⚠️  ${songsWithoutKorean} 首歌曲沒有韓文歌名`);
          }
          if (songsWithKorean > 0) {
            console.log(`  🇰🇷 ${songsWithKorean} 首歌曲已自動提取韓文歌名`);
          }
        }

        // 在處理下一個團體前稍作延遲
        if (i < groups.length - 1) {
          console.log('\n⏳ 等待 5 秒後處理下一個團體（避免速率限制）...\n');
          await new Promise(resolve => setTimeout(resolve, 5000)); // 增加延遲到 5 秒
        }
      } catch (error) {
        console.error(`❌ 處理團體 "${group.group_name}" 時發生錯誤:`, error);
        totalErrorCount++;
      }
    }

    // 顯示總體結果
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 總體匯入結果');
    console.log(`${'='.repeat(60)}`);
    console.log(`  ✅ 成功: ${totalSuccessCount} 首`);
    console.log(`  ⏭️  跳過（spotify_url 已存在）: ${totalSkipCount} 首`);
    console.log(`  🔄 跳過（title + group_id 重複）: ${totalDuplicateCount} 首`);
    console.log(`  ❌ 錯誤: ${totalErrorCount} 首`);
    console.log('\n⚠️  注意:');
    console.log('  - youtube_original_url 目前為 placeholder，請手動補上 YouTube MV 連結');
    console.log('  - difficulty_level 預設為 5，請根據實際情況調整');
  } catch (error) {
    console.error('❌ 發生錯誤:', error);
    process.exit(1);
  }
}

main();

