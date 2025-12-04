/**
 * Spotify 歌曲資料抓取腳本
 * 
 * 使用方法：
 * 1. 確保 .env.local 有 SPOTIFY_CLIENT_ID 和 SPOTIFY_CLIENT_SECRET
 * 2. 確保 .env.local 有 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY
 * 3. 執行: npx tsx scripts/fetch-spotify-songs.ts "搜尋關鍵字" [--limit=50]
 * 
 * 範例：
 * npx tsx scripts/fetch-spotify-songs.ts "kpop twice" --limit=20
 * npx tsx scripts/fetch-spotify-songs.ts "blackpink" --limit=10
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// 載入環境變數（從專案根目錄）
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
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
 * 獲取藝人的歌曲總數（通過分頁搜尋）
 */
async function getArtistTrackCount(artistName: string, artistId?: string): Promise<number> {
  const token = await getSpotifyAccessToken();

  // 使用 artist:"藝人名稱" 或 artist:id 來精確搜尋
  const query = artistId 
    ? `artist:${artistId}` 
    : `artist:"${artistName}"`;

  // 先搜尋一次，取得總數
  const searchParams = new URLSearchParams({
    q: query,
    type: 'track',
    limit: '1', // 只需要知道總數，不需要實際資料
    market: 'KR',
  });

  const res = await fetch(`https://api.spotify.com/v1/search?${searchParams}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Spotify track count search failed: ${text}`);
  }

  const data = (await res.json()) as { tracks: { total: number } };
  return data.tracks.total;
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
    market: 'KR', // 使用韓國市場，可能會有更多韓文資訊
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
 * 這可以過濾掉合作歌曲、翻唱、或其他藝人的歌曲
 */
function filterTracksByArtist(tracks: SpotifyTrack[], targetArtistId: string, targetArtistName: string): SpotifyTrack[] {
  return tracks.filter(track => {
    if (!track.artists || track.artists.length === 0) {
      return false;
    }
    
    // 只檢查主要藝人（artists[0]），這是 Spotify 的標準做法
    // 主要藝人通常是歌曲的擁有者/發行者
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
 * @param query 搜尋查詢字串（可以是藝人名稱或一般關鍵字）
 * @param artistId 可選的藝人 ID（如果提供，會使用 artist:ID 語法）
 * @param maxTracks 最大抓取數量（可選）
 * @param filterByArtist 是否要過濾只保留目標藝人的歌曲（用於藝人模式）
 * @param targetArtistName 目標藝人名稱（用於過濾）
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
    // 1. 如果已經達到總數，停止
    // 2. 如果已經達到最大限制，停止
    // 3. 如果這一頁返回的數量少於 limit，說明已經是最後一頁，停止
    // 4. 如果已經抓取的數量 >= 總數，停止
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
 * 韓文 Unicode 範圍：
 * - 韓文音節: \uAC00-\uD7A3
 * - 韓文字母: \u1100-\u11FF
 * - 韓文相容字母: \u3130-\u318F
 */
function extractKoreanText(text: string): string | null {
  // 匹配韓文字元的正則表達式
  const koreanRegex = /[\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]+/g;
  const matches = text.match(koreanRegex);
  
  if (matches && matches.length > 0) {
    // 返回所有韓文片段的組合（去除空格）
    return matches.join(' ').trim();
  }
  
  return null;
}

/**
 * 從歌曲名稱中移除藝人名稱
 * 處理格式如："TWICE - 歌名" 或 "歌名 - TWICE"
 */
function removeArtistNameFromTitle(trackName: string, artists: { name: string }[]): string {
  let cleanedName = trackName;
  
  // 取得所有藝人名稱
  const artistNames = artists.map(a => a.name);
  
  // 嘗試移除藝人名稱（處理不同的分隔符號）
  for (const artistName of artistNames) {
    // 處理 "藝人 - 歌名" 格式
    const pattern1 = new RegExp(`^${escapeRegex(artistName)}\\s*[-–—]\\s*`, 'i');
    cleanedName = cleanedName.replace(pattern1, '');
    
    // 處理 "歌名 - 藝人" 格式
    const pattern2 = new RegExp(`\\s*[-–—]\\s*${escapeRegex(artistName)}$`, 'i');
    cleanedName = cleanedName.replace(pattern2, '');
    
    // 處理 "藝人: 歌名" 或 "藝人：歌名" 格式
    const pattern3 = new RegExp(`^${escapeRegex(artistName)}\\s*[:：]\\s*`, 'i');
    cleanedName = cleanedName.replace(pattern3, '');
  }
  
  return cleanedName.trim();
}

/**
 * 轉義正則表達式特殊字元
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 從歌曲名稱中分離英文和韓文，並移除藝人名稱
 */
function parseSongName(name: string, artists: { name: string }[]): { title: string; titleKr: string } {
  // 先移除藝人名稱
  const nameWithoutArtist = removeArtistNameFromTitle(name, artists);
  
  // 嘗試提取韓文部分
  const koreanText = extractKoreanText(nameWithoutArtist);
  
  // 移除韓文部分，得到英文部分
  let englishText = nameWithoutArtist.replace(/[\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]+/g, ' ').trim();
  
  // 清理多餘的空格和分隔符號
  englishText = englishText.replace(/\s*[-–—]\s*/g, ' ').replace(/\s+/g, ' ').trim();
  
  if (koreanText) {
    // 如果有韓文，使用韓文作為 title_kr，英文作為 title
    return {
      title: englishText || nameWithoutArtist, // 如果沒有英文，就用移除藝人後的名稱
      titleKr: koreanText,
    };
  } else {
    // 如果沒有韓文，兩個都用移除藝人後的名稱
    return {
      title: nameWithoutArtist || name, // 如果移除後為空，就用原名
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
    // 只有年份，補上 01-01
    releaseDate = `${releaseDate}-01-01`;
  } else if (releaseDate.length === 7) {
    // 只有年月，補上 01
    releaseDate = `${releaseDate}-01`;
  }

  // 從歌曲名稱中分離英文和韓文，並移除藝人名稱
  const { title, titleKr } = parseSongName(track.name, track.artists);

  // youtube_original_url 必填但 Spotify 沒有
  // 先用一個 placeholder，之後需要手動補上真正的 YouTube MV 連結
  // 格式: https://www.youtube.com/watch?v=VIDEO_ID
  const youtubeUrl = 'https://www.youtube.com'; // 需要手動更新為實際的 MV 連結

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
  // 查詢目前最大的 song_id
  const { data, error } = await supabase
    .from('kpop_songs')
    .select('song_id')
    .order('song_id', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 是 "not found"，這是正常的（表是空的）
    console.error('查詢 song_id 時發生錯誤:', error);
    return Date.now(); // 如果查詢失敗，用 timestamp
  }

  if (data && data.song_id) {
    return data.song_id + 1;
  }

  // 如果表是空的，從 1 開始
  return 1;
}

/**
 * 檢查歌曲是否已存在（用 spotify_url 判斷）
 */
async function songExists(spotifyUrl: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('kpop_songs')
    .select('song_id')
    .eq('spotify_url', spotifyUrl)
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('檢查歌曲是否存在時發生錯誤:', error);
    return false;
  }

  return !!data;
}

/**
 * 插入歌曲到資料庫
 */
async function insertSong(song: KpopSongRow): Promise<boolean> {
  // 檢查是否已存在
  const exists = await songExists(song.spotify_url);
  if (exists) {
    console.log(`  ⚠️  歌曲已存在，跳過: ${song.title}`);
    return false;
  }

  const { error } = await supabase.from('kpop_songs').insert(song);

  if (error) {
    console.error(`  ❌ 插入失敗: ${song.title}`, error);
    return false;
  }

  return true;
}

/**
 * 主函數
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('使用方法:');
    console.log('  1. 搜尋歌曲: npx tsx scripts/fetch-spotify-songs.ts "搜尋關鍵字" [--limit=50]');
    console.log('  2. 查詢藝人歌曲: npx tsx scripts/fetch-spotify-songs.ts "藝人名稱" --artist [--limit=全部]');
    console.log('');
    console.log('範例:');
    console.log('  npx tsx scripts/fetch-spotify-songs.ts "kpop twice" --limit=20');
    console.log('  npx tsx scripts/fetch-spotify-songs.ts "TWICE" --artist');
    console.log('  npx tsx scripts/fetch-spotify-songs.ts "BLACKPINK" --artist --limit=30');
    process.exit(1);
  }

  const query = args[0];
  const isArtistMode = args.includes('--artist');
  const limitArg = args.find(arg => arg.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : (isArtistMode ? undefined : 50);

  try {
    let tracks: SpotifyTrack[] = [];
    let artistInfo: SpotifyArtist | null = null;
    let totalTracks = 0;

    if (isArtistMode) {
      // 藝人模式：先查詢藝人資訊和歌曲總數
      console.log(`🎤 查詢藝人: "${query}"\n`);

      // 搜尋藝人
      artistInfo = await searchSpotifyArtist(query);
      if (!artistInfo) {
        console.log(`❌ 找不到藝人: "${query}"`);
        console.log('提示: 請確認藝人名稱是否正確，或嘗試使用英文名稱');
        return;
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

      // 獲取歌曲總數
      console.log('\n📊 查詢歌曲總數...');
      totalTracks = await getArtistTrackCount(query, artistInfo.id);
      console.log(`✅ 該藝人在 Spotify 上共有 ${totalTracks.toLocaleString()} 首歌曲\n`);

      if (totalTracks === 0) {
        console.log('該藝人沒有歌曲');
        return;
      }

      // 詢問要抓取多少首
      // 在藝人模式下，啟用過濾功能，只保留主要藝人是目標藝人的歌曲
      if (limit !== undefined) {
        console.log(`📥 將抓取前 ${limit} 首歌曲（只保留 ${artistInfo.name} 的歌曲）...\n`);
        tracks = await getAllArtistTracks(query, artistInfo.id, limit, true, artistInfo.name);
      } else {
        console.log(`📥 將抓取全部 ${totalTracks} 首歌曲（只保留 ${artistInfo.name} 的歌曲，這可能需要一些時間）...\n`);
        tracks = await getAllArtistTracks(query, artistInfo.id, undefined, true, artistInfo.name);
      }

      console.log(`✅ 成功取得 ${tracks.length} 首歌曲\n`);
    } else {
      // 一般搜尋模式（原有功能）
      console.log(`🔍 搜尋 Spotify: "${query}" (限制 ${limit} 首)\n`);
      const firstPage = await searchSpotifyTracks(query, Math.min(limit, 50), 0);
      totalTracks = firstPage.total;
      
      // 如果總數超過第一頁的限制（50首），需要分頁抓取
      if (totalTracks > 50) {
        const targetCount = Math.min(limit, totalTracks);
        console.log(`📥 總共 ${totalTracks} 首符合條件，需要分頁抓取前 ${targetCount} 首...\n`);
        tracks = await getAllArtistTracks(query, undefined, targetCount);
        console.log(`✅ 成功取得 ${tracks.length} 首歌曲\n`);
      } else {
        // 總數不超過 50，直接使用第一頁結果
        tracks = firstPage.tracks;
        console.log(`✅ 找到 ${tracks.length} 首歌曲\n`);
      }
    }

    if (tracks.length === 0) {
      console.log('沒有找到任何歌曲');
      return;
    }

    // 顯示搜尋結果
    console.log('📋 搜尋結果:');
    tracks.forEach((track, index) => {
      const artists = track.artists.map(a => a.name).join(', ');
      const duration = Math.floor(track.duration_ms / 1000);
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      const { title, titleKr } = parseSongName(track.name, track.artists);
      const hasKorean = extractKoreanText(track.name) !== null;
      const koreanIndicator = hasKorean ? '🇰🇷' : '⚠️  (無韓文)';
      
      // 顯示原始名稱和清理後的名稱（如果不同）
      const displayName = title !== track.name ? `${title} (原始: ${track.name})` : track.name;
      console.log(
        `  ${index + 1}. ${displayName} - ${artists} (${minutes}:${seconds.toString().padStart(2, '0')}) ${koreanIndicator}`
      );
      if (hasKorean && titleKr !== title) {
        console.log(`      → 韓文: ${titleKr}`);
      }
    });

    console.log('\n💾 開始匯入資料庫...\n');

    // 取得起始 song_id
    let currentSongId = await getNextSongId();
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    // 匯入每首歌曲
    for (const track of tracks) {
      try {
        const song = convertToKpopSong(track, currentSongId);
        const inserted = await insertSong(song);

        if (inserted) {
          const hasKorean = extractKoreanText(track.name) !== null;
          const koreanIndicator = hasKorean ? '🇰🇷' : '⚠️';
          if (hasKorean && song.title_kr !== song.title) {
            console.log(`  ✅ [${currentSongId}] ${song.title} ${koreanIndicator} (韓文: ${song.title_kr})`);
          } else {
            console.log(`  ✅ [${currentSongId}] ${song.title} ${koreanIndicator}`);
          }
          currentSongId++;
          successCount++;
        } else {
          skipCount++;
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

    if (successCount > 0) {
      // 統計有多少首有韓文、多少首沒有
      const songsWithKorean = tracks.filter(t => extractKoreanText(t.name) !== null).length;
      const songsWithoutKorean = tracks.length - songsWithKorean;
      
      console.log('\n📊 匯入統計:');
      if (isArtistMode && artistInfo) {
        console.log(`  🎤 藝人: ${artistInfo.name}`);
        if (totalTracks > tracks.length) {
          console.log(`  📈 Spotify 總歌曲數: ${totalTracks.toLocaleString()} 首`);
          console.log(`  📥 本次匯入: ${successCount} 首`);
          console.log(`  💡 提示: 還有 ${(totalTracks - tracks.length).toLocaleString()} 首未匯入，可以再次執行腳本匯入更多`);
        }
      }
      
      console.log('\n⚠️  注意:');
      if (songsWithoutKorean > 0) {
        console.log(`  - ${songsWithoutKorean} 首歌曲沒有韓文歌名（標示為 ⚠️），請手動更新 title_kr`);
      }
      if (songsWithKorean > 0) {
        console.log(`  - ${songsWithKorean} 首歌曲已自動提取韓文歌名（標示為 🇰🇷）`);
      }
      console.log('  - youtube_original_url 目前為 placeholder，請手動補上 YouTube MV 連結');
      console.log('  - difficulty_level 預設為 5，請根據實際情況調整');
    }
  } catch (error) {
    console.error('❌ 發生錯誤:', error);
    process.exit(1);
  }
}

main();

