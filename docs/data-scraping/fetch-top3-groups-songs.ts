/**
 * 從 girl-groups-batch1.json 中取出前三個女團，從 Spotify 抓取歌曲資訊
 * 
 * 使用方法：
 * 1. 確保 .env.local 有 SPOTIFY_CLIENT_ID 和 SPOTIFY_CLIENT_SECRET
 * 2. 確保 .env.local 有 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY
 * 3. 執行: npx tsx docs/data-scraping/fetch-top3-groups-songs.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

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

  const res = await fetch(`https://api.spotify.com/v1/search?${searchParams}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Spotify artist search failed: ${text}`);
  }

  const data = (await res.json()) as { artists: { items: SpotifyArtist[] } };
  return data.artists.items.length > 0 ? data.artists.items[0] : null;
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
      include_groups: 'album,single,compilation', // 包含專輯、單曲、合輯
      limit: limit.toString(),
      offset: offset.toString(),
      market: 'KR',
    });

    const res = await fetch(`https://api.spotify.com/v1/artists/${artistId}/albums?${searchParams}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to get artist albums: ${text}`);
    }

    const data = (await res.json()) as { items: Array<{ id: string; name: string; album_type: string }>; total: number };
    
    allAlbums.push(...data.items);
    
    // 第一次獲取時顯示總數
    if (offset === 0) {
      console.log(`   總共 ${data.total} 個專輯/單曲（已獲取 ${allAlbums.length} 個）...`);
    }
    
    // 判斷是否還有更多
    // 1. 如果已經獲取的數量 >= 總數，停止
    // 2. 如果這一頁返回的數量少於 limit，說明已經是最後一頁，停止
    // 3. 如果 offset + 返回的數量 >= 總數，停止
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
      // 繼續獲取下一頁
      offset += limit;
      await new Promise(resolve => setTimeout(resolve, 200)); // 避免 rate limit
    }
  }

  return allAlbums;
}

/**
 * 專輯中的簡化歌曲資訊（只包含 id 和基本資訊）
 */
interface AlbumTrack {
  id: string;
  name: string;
  artists: { name: string; id?: string }[];
  duration_ms?: number;
}

/**
 * 獲取專輯中的所有歌曲（返回簡化資訊，需要後續獲取完整資訊）
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

    const res = await fetch(`https://api.spotify.com/v1/albums/${albumId}/tracks?${searchParams}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

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
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  return allTracks;
}

/**
 * 獲取完整的歌曲資訊（包含專輯資訊）
 */
async function getTrackDetails(trackId: string): Promise<SpotifyTrack | null> {
  const token = await getSpotifyAccessToken();

  const res = await fetch(`https://api.spotify.com/v1/tracks/${trackId}?market=KR`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    return null;
  }

  return (await res.json()) as SpotifyTrack;
}

/**
 * 獲取藝人的所有歌曲（通過專輯）
 */
async function getAllArtistTracksViaAlbums(artistId: string, artistName: string): Promise<SpotifyTrack[]> {
  console.log(`   開始獲取 ${artistName} 的所有專輯...`);
  
  // 1. 獲取所有專輯
  const albums = await getArtistAlbums(artistId);
  console.log(`   ✅ 找到 ${albums.length} 個專輯/單曲`);
  
  if (albums.length === 0) {
    return [];
  }

  // 2. 對每個專輯獲取歌曲
  const allTracks: SpotifyTrack[] = [];
  const trackIds = new Set<string>(); // 用於去重

  for (let i = 0; i < albums.length; i++) {
    const album = albums[i];
    console.log(`   [${i + 1}/${albums.length}] 處理專輯: ${album.name} (${album.album_type})`);
    
    try {
      const tracks = await getAlbumTracks(album.id);
      
      // 獲取每首歌曲的完整資訊
      for (const track of tracks) {
        if (!track.id) {
          console.log(`      ⚠️  跳過沒有 ID 的歌曲: ${track.name}`);
          continue;
        }
        
        if (!trackIds.has(track.id)) {
          trackIds.add(track.id);
          
          // 獲取完整歌曲資訊（包含專輯資訊）
          const fullTrack = await getTrackDetails(track.id);
          if (fullTrack) {
            // 確保主要藝人是目標藝人
            if (fullTrack.artists && fullTrack.artists.length > 0) {
              const mainArtist = fullTrack.artists[0];
              if (mainArtist.id === artistId || mainArtist.name.toLowerCase() === artistName.toLowerCase()) {
                allTracks.push(fullTrack);
              }
            }
          }
          
          await new Promise(resolve => setTimeout(resolve, 50)); // 避免 rate limit
        }
      }
      
      console.log(`      ✅ 從此專輯取得 ${tracks.length} 首歌曲（總計: ${allTracks.length} 首）`);
      
      // 在處理下一個專輯前稍作延遲
      if (i < albums.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    } catch (error) {
      console.error(`      ❌ 處理專輯時發生錯誤: ${album.name}`, error);
    }
  }

  return allTracks;
}

/**
 * 獲取藝人的歌曲總數（通過專輯方式）
 */
async function getArtistTrackCount(artistId: string): Promise<number> {
  const albums = await getArtistAlbums(artistId);
  let totalTracks = 0;
  
  for (const album of albums) {
    const tracks = await getAlbumTracks(album.id);
    totalTracks += tracks.length;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return totalTracks;
}

/**
 * 搜尋 Spotify 歌曲（支援分頁）
 */
async function searchSpotifyTracks(
  query: string, 
  limit: number = 50, 
  offset: number = 0
): Promise<{ tracks: SpotifyTrack[]; total: number }> {
  const token = await getSpotifyAccessToken();

  // 使用 KR 市場來獲取更多韓文資訊
  const searchParams = new URLSearchParams({
    q: query,
    type: 'track',
    limit: limit.toString(),
    offset: offset.toString(),
    market: 'KR',
  });

  const res = await fetch(`https://api.spotify.com/v1/search?${searchParams}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Spotify search failed: ${text}`);
  }

  const data = (await res.json()) as { tracks: { items: SpotifyTrack[]; total: number } };
  return {
    tracks: data.tracks.items,
    total: data.tracks.total,
  };
}

/**
 * 過濾歌曲，只保留主要藝人是目標藝人的歌曲
 */
function filterTracksByArtist(tracks: SpotifyTrack[], targetArtistId: string, targetArtistName: string): SpotifyTrack[] {
  return tracks.filter(track => {
    if (!track.artists || track.artists.length === 0) {
      return false;
    }
    
    // 只檢查主要藝人（artists[0]），這是 Spotify 的標準做法
    const mainArtist = track.artists[0];
    
    // 如果有 ID，優先使用 ID 比對（最精確）
    if (mainArtist.id && targetArtistId) {
      return mainArtist.id === targetArtistId;
    }
    
    // 否則使用名稱比對（不區分大小寫，去除多餘空格）
    const mainArtistName = mainArtist.name.trim().toLowerCase();
    const targetName = targetArtistName.trim().toLowerCase();
    
    return mainArtistName === targetName;
  });
}

/**
 * 獲取所有歌曲（自動處理分頁）
 */
async function getAllArtistTracks(
  query: string, 
  artistId?: string, 
  maxTracks?: number,
  filterByArtist: boolean = false,
  targetArtistName?: string
): Promise<SpotifyTrack[]> {
  const allTracks: SpotifyTrack[] = [];
  
  // 如果有 artistId，使用 artist:ID 語法；否則使用原始查詢
  const searchQuery = artistId 
    ? `artist:${artistId}` 
    : query;

  let offset = 0;
  const limit = 50; // Spotify API 每頁最多 50 首
  let total = 0;
  let hasMore = true;
  let filteredCount = 0;

  console.log(`   開始分頁抓取（每頁 ${limit} 首）...`);

  while (hasMore) {
    const result = await searchSpotifyTracks(searchQuery, limit, offset);
    let fetchedTracks = result.tracks;
    
    // 如果需要過濾，只保留目標藝人的歌曲
    if (filterByArtist && artistId && targetArtistName) {
      const beforeFilter = fetchedTracks.length;
      fetchedTracks = filterTracksByArtist(fetchedTracks, artistId, targetArtistName);
      filteredCount += (beforeFilter - fetchedTracks.length);
      
      if (filteredCount > 0 && fetchedTracks.length === 0) {
        // 如果這一頁全部被過濾掉，繼續下一頁
        offset += limit;
        await new Promise(resolve => setTimeout(resolve, 200));
        continue;
      }
    }
    
    const fetchedCount = fetchedTracks.length;
    allTracks.push(...fetchedTracks);
    
    // 第一次取得總數
    if (total === 0) {
      total = result.total;
      if (filterByArtist) {
        console.log(`   總共 ${total} 首（將過濾只保留 ${targetArtistName} 的歌曲）...`);
      } else {
        console.log(`   總共 ${total} 首，已抓取 ${allTracks.length} 首...`);
      }
    } else {
      if (filterByArtist && filteredCount > 0) {
        console.log(`   已抓取 ${allTracks.length} 首（已過濾 ${filteredCount} 首非目標藝人的歌曲）...`);
      } else {
        console.log(`   已抓取 ${allTracks.length}/${total} 首...`);
      }
    }

    // 判斷是否還有更多
    const shouldStop = 
      allTracks.length >= total ||
      (maxTracks && allTracks.length >= maxTracks) ||
      result.tracks.length < limit ||
      offset + result.tracks.length >= total;

    if (shouldStop) {
      hasMore = false;
      if (filterByArtist && filteredCount > 0) {
        console.log(`   ✅ 分頁抓取完成，共 ${allTracks.length} 首（已過濾 ${filteredCount} 首非目標藝人的歌曲）`);
      } else {
        console.log(`   ✅ 分頁抓取完成，共 ${allTracks.length} 首`);
      }
    } else {
      offset += limit;
      // 避免 API rate limit
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  // 如果設定了最大數量，只返回前 maxTracks 首
  if (maxTracks && allTracks.length > maxTracks) {
    return allTracks.slice(0, maxTracks);
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

  // 取得主要藝人名稱
  const mainArtist = artists[0].name.trim();
  
  // 處理各種格式
  // 1. "藝人 - 歌名"
  // 2. "歌名 - 藝人"
  // 3. "藝人: 歌名"
  // 4. "歌名 (藝人)"
  let cleaned = trackName;
  
  // 移除 "藝人 - " 或 " - 藝人"
  cleaned = cleaned.replace(new RegExp(`^${mainArtist}\\s*-\\s*`, 'i'), '');
  cleaned = cleaned.replace(new RegExp(`\\s*-\\s*${mainArtist}$`, 'i'), '');
  
  // 移除 "藝人: "
  cleaned = cleaned.replace(new RegExp(`^${mainArtist}\\s*:\\s*`, 'i'), '');
  
  // 移除 " (藝人)" 或 "(藝人)"
  cleaned = cleaned.replace(new RegExp(`\\s*\\(${mainArtist}\\)`, 'i'), '');
  
  return cleaned.trim() || trackName; // 如果移除後為空，返回原名
}

/**
 * 解析歌曲名稱，分離英文和韓文
 */
function parseSongName(name: string, artists: { name: string }[]): { title: string; titleKr: string } {
  // 先移除藝人名稱
  const nameWithoutArtist = removeArtistNameFromTitle(name, artists);
  
  // 提取韓文
  const koreanText = extractKoreanText(nameWithoutArtist);
  
  if (koreanText) {
    // 如果有韓文，先找出所有包含韓文的括號及其內容
    // 匹配各種括號類型：() [] {} （）【】
    const koreanBracketPattern = /[\(\[\{（【][^\)\]\}）】]*[\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]+[^\(\[\{（【]*[\)\]\}）】]/g;
    
    // 移除包含韓文的括號及其內容
    let englishText = nameWithoutArtist.replace(koreanBracketPattern, '').trim();
    
    // 移除所有韓文字元
    englishText = englishText.replace(/[\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]+/g, '').trim();
    
    // 移除空的括號（可能只剩下括號了）
    englishText = englishText.replace(/[\(\[\{（【]\s*[\)\]\}）】]/g, '').trim();
    
    // 清理多餘的符號和空格（包括開頭和結尾的 - : 空格等）
    englishText = englishText.replace(/^[-:\s]+|[-:\s]+$/g, '').trim();
    
    // 移除多餘的空格（多個連續空格變成一個）
    englishText = englishText.replace(/\s+/g, ' ').trim();
    
    return {
      title: englishText || koreanText, // 如果英文為空，就用韓文
      titleKr: koreanText,
    };
  } else {
    // 如果沒有韓文，兩個都用移除藝人後的名稱
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
  // 計算 duration (秒)
  const duration = Math.floor(track.duration_ms / 1000);

  // 格式化 release_date (Spotify 可能是 YYYY-MM-DD 或 YYYY-MM 或 YYYY)
  let releaseDate = track.album.release_date;
  if (releaseDate.length === 4) {
    releaseDate = `${releaseDate}-01-01`;
  } else if (releaseDate.length === 7) {
    releaseDate = `${releaseDate}-01`;
  }

  // 從歌曲名稱中分離英文和韓文，並移除藝人名稱
  const { title, titleKr } = parseSongName(track.name, track.artists);

  // youtube_original_url 必填但 Spotify 沒有
  const youtubeUrl = 'https://www.youtube.com';

  // difficulty_level 給預設值 5（中等難度）
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
 * 根據團體名稱查找 group_id
 */
async function getGroupIdByName(groupName: string): Promise<number | null> {
  // 先嘗試精確匹配
  let { data, error } = await supabase
    .from('kpop_groups')
    .select('group_id')
    .eq('group_name', groupName)
    .limit(1)
    .single();

  if (!error && data) {
    return data.group_id;
  }

  // 如果精確匹配失敗，嘗試不區分大小寫
  const { data: allGroups } = await supabase
    .from('kpop_groups')
    .select('group_id, group_name');

  if (allGroups) {
    const matched = allGroups.find(
      g => g.group_name.toLowerCase() === groupName.toLowerCase()
    );
    if (matched) {
      return matched.group_id;
    }
  }

  console.log(`  ⚠️  找不到團體: "${groupName}"`);
  return null;
}

/**
 * 插入歌曲到資料庫，返回 song_id
 */
async function insertSong(song: KpopSongRow): Promise<number | null> {
  // 檢查是否已存在
  const existingSongId = await getSongIdBySpotifyUrl(song.spotify_url);
  if (existingSongId) {
    console.log(`  ⚠️  歌曲已存在 (song_id: ${existingSongId})，跳過: ${song.title}`);
    return existingSongId; // 返回已存在的 song_id
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
  // 先檢查是否已存在
  const { data: existing } = await supabase
    .from('song_group')
    .select('song_id, group_id')
    .eq('song_id', songId)
    .eq('group_id', groupId)
    .limit(1)
    .single();

  if (existing) {
    // 關聯已存在，跳過
    return false;
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
 * 從 JSON 檔案讀取前三個女團
 */
function getTop3Groups(): string[] {
  const jsonPath = path.resolve(process.cwd(), 'docs/data-scraping/girl-groups-batch1.json');
  
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`找不到檔案: ${jsonPath}`);
  }

  const fileContent = fs.readFileSync(jsonPath, 'utf-8');
  const groupsData = JSON.parse(fileContent);

  // 取得前三個女團的 key（去掉 " MEMBERS" 後綴）
  const groupKeys = Object.keys(groupsData).slice(0, 3);
  const groupNames = groupKeys.map(key => key.replace(/\s+MEMBERS$/, ''));

  return groupNames;
}

/**
 * 主函數
 */
async function main() {
  try {
    // 取得前三個女團名稱
    console.log('📋 讀取前三個女團...\n');
    const groupNames = getTop3Groups();
    console.log(`✅ 找到前三個女團: ${groupNames.join(', ')}\n`);

    // 取得起始 song_id
    let currentSongId = await getNextSongId();
    let totalSuccessCount = 0;
    let totalSkipCount = 0;
    let totalErrorCount = 0;

    // 處理每個女團
    for (let i = 0; i < groupNames.length; i++) {
      const groupName = groupNames[i];
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🎤 [${i + 1}/3] 處理女團: ${groupName}`);
      console.log(`${'='.repeat(60)}\n`);

      try {
        // 搜尋藝人
        const artistInfo = await searchSpotifyArtist(groupName);
        if (!artistInfo) {
          console.log(`❌ 找不到藝人: "${groupName}"`);
          console.log('   跳過此女團\n');
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

        // 使用新的方法：通過專輯獲取所有歌曲
        console.log('\n📥 開始獲取所有歌曲（通過專輯）...\n');
        const tracks = await getAllArtistTracksViaAlbums(artistInfo.id, artistInfo.name);

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

        console.log('\n💾 開始匯入資料庫...\n');

        // 先查找團體的 group_id
        const groupId = await getGroupIdByName(groupName);
        if (!groupId) {
          console.log(`  ⚠️  找不到團體 "${groupName}" 的 group_id，將跳過建立關聯`);
        } else {
          console.log(`  ✅ 找到團體 "${groupName}" 的 group_id: ${groupId}\n`);
        }

        let successCount = 0;
        let skipCount = 0;
        let errorCount = 0;
        let relationCount = 0;

        // 匯入每首歌曲
        for (const track of tracks) {
          try {
            const song = convertToKpopSong(track, currentSongId);
            const songId = await insertSong(song);

            if (songId) {
              // 歌曲插入成功或已存在，建立與團體的關聯
              if (groupId) {
                const relationInserted = await insertSongGroup(songId, groupId);
                if (relationInserted) {
                  relationCount++;
                }
              }

              // 檢查是否是新插入的（通過檢查 song_id 是否等於 currentSongId）
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

            // 避免 API rate limit，稍微延遲
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.error(`  ❌ 處理歌曲時發生錯誤: ${track.name}`, error);
            errorCount++;
          }
        }

        console.log('\n📊 匯入結果:');
        console.log(`  ✅ 成功: ${successCount} 首`);
        console.log(`  ⚠️  跳過（已存在）: ${skipCount} 首`);
        console.log(`  ❌ 錯誤: ${errorCount} 首`);
        if (groupId) {
          console.log(`  🔗 建立團體關聯: ${relationCount} 個`);
        }

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

        // 在處理下一個女團前稍作延遲
        if (i < groupNames.length - 1) {
          console.log('\n⏳ 等待 2 秒後處理下一個女團...\n');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`❌ 處理女團 "${groupName}" 時發生錯誤:`, error);
        totalErrorCount++;
      }
    }

    // 顯示總體結果
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 總體匯入結果');
    console.log(`${'='.repeat(60)}`);
    console.log(`  ✅ 成功: ${totalSuccessCount} 首`);
    console.log(`  ⚠️  跳過（已存在）: ${totalSkipCount} 首`);
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

