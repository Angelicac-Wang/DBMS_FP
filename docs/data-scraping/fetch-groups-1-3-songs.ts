/**
 * 從資料庫中取得 group_id 為 1, 2, 3 的團體，從 Spotify 抓取歌曲資訊
 * 
 * 使用方法：
 * 1. 確保 .env.local 有 SPOTIFY_CLIENT_ID 和 SPOTIFY_CLIENT_SECRET
 * 2. 確保 .env.local 有 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY
 * 3. 執行: npx tsx docs/data-scraping/fetch-groups-1-3-songs.ts
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
      include_groups: 'album,single,compilation',
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
      await new Promise(resolve => setTimeout(resolve, 200));
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
 * 獲取完整的歌曲資訊
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
          
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
      
      console.log(`      ✅ 從此專輯取得 ${tracks.length} 首歌曲（總計: ${allTracks.length} 首）`);
      
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
 * 從資料庫取得 group_id 為 1, 2, 3 的團體資訊
 */
async function getGroupsByIds(groupIds: number[]): Promise<Array<{ group_id: number; group_name: string }>> {
  const { data, error } = await supabase
    .from('kpop_groups')
    .select('group_id, group_name')
    .in('group_id', groupIds)
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
  const existingSongId = await getSongIdBySpotifyUrl(song.spotify_url);
  if (existingSongId) {
    console.log(`  ⚠️  歌曲已存在 (song_id: ${existingSongId})，跳過: ${song.title}`);
    return existingSongId;
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
 * 主函數
 */
async function main() {
  try {
    // 從資料庫取得 group_id 為 1, 2, 3 的團體
    console.log('📋 從資料庫讀取 group_id 為 1, 2, 3 的團體...\n');
    const groups = await getGroupsByIds([1, 2, 3]);
    
    if (groups.length === 0) {
      console.error('❌ 找不到 group_id 為 1, 2, 3 的團體');
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
    let totalErrorCount = 0;

    // 處理每個團體
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🎤 [${i + 1}/${groups.length}] 處理團體: ${group.group_name} (ID: ${group.group_id})`);
      console.log(`${'='.repeat(60)}\n`);

      try {
        // 搜尋藝人
        const artistInfo = await searchSpotifyArtist(group.group_name);
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
        console.log(`  ⚠️  跳過（已存在）: ${skipCount} 首`);
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
          console.log('\n⏳ 等待 2 秒後處理下一個團體...\n');
          await new Promise(resolve => setTimeout(resolve, 2000));
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




