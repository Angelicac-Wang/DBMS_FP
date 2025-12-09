/**
 * 檢查並修正 kpop_songs.youtube_original_url
 *
 * - 找出空值、placeholder、或無法解析 videoId 的 URL
 * - 嘗試重新搜尋 YouTube（使用「歌名 + 團體名」）取得合法連結
 * - 將各種格式 (watch/embed/shorts/youtu.be) 正規化為 watch URL
 *
 * 執行方式：
 *   npx tsx docs/data-scraping/fix-youtube-urls.ts
 *
 * 需要 .env.local 內有 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// 載入環境變數（從專案根目錄）
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/export$/, '');
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ 錯誤: 請在 .env.local 設定 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

type SongRow = {
  song_id: number;
  title: string;
  youtube_original_url: string | null;
};

type SongGroupRow = { song_id: number; group_id: number };
type GroupRow = { group_id: number; group_name: string };

function extractVideoId(url?: string | null): string | null {
  if (!url) return null;
  const match =
    url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/) ??
    url.match(/"videoId":"([\w-]{11})"/);
  return match ? match[1] : null;
}

function normalizeYoutubeUrl(url?: string | null): string | null {
  const videoId = extractVideoId(url);
  return videoId ? `https://www.youtube.com/watch?v=${videoId}` : null;
}

async function searchYouTube(query: string): Promise<string | null> {
  try {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    if (!response.ok) {
      console.error(`❌ YouTube 搜尋失敗: HTTP ${response.status}`);
      return null;
    }

    const html = await response.text();

    // 優先從 ytInitialData 解析，避免抓到廣告或非影片項目
    const ytInitialDataMatch = html.match(/ytInitialData"\s*:\s*({[\s\S]+?})\s*[,<]/);
    if (ytInitialDataMatch) {
      try {
        const ytInitialData = JSON.parse(ytInitialDataMatch[1]);
        const contents =
          ytInitialData?.contents?.twoColumnSearchResultsRenderer?.primaryContents
            ?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents;
        if (Array.isArray(contents)) {
          for (const item of contents) {
            const video = item?.videoRenderer;
            const videoId =
              video?.videoId ||
              video?.navigationEndpoint?.watchEndpoint?.videoId ||
              video?.inlinePlaybackEndpoint?.watchEndpoint?.videoId;
            const hasDuration = !!video?.lengthText || !!video?.thumbnailOverlays;
            if (videoId && hasDuration) {
              return `https://www.youtube.com/watch?v=${videoId}`;
            }
          }
        }
      } catch {
        // 若 JSON 解析失敗，改用 fallback
      }
    }

    // Fallback: 從 HTML 抓第一個 /watch?v=
    const watchMatch = html.match(/\/watch\?v=([\w-]{11})/);
    if (watchMatch && watchMatch[1]) {
      return `https://www.youtube.com/watch?v=${watchMatch[1]}`;
    }

    return null;
  } catch (error) {
    console.error(`❌ YouTube 搜尋錯誤 (${query}):`, error);
    return null;
  }
}

async function fetchMaps() {
  const [{ data: songGroups }, { data: groups }] = await Promise.all([
    supabase.from('song_group').select('song_id, group_id'),
    supabase.from('kpop_groups').select('group_id, group_name'),
  ]);

  const groupNameMap = new Map<number, string>();
  (groups || []).forEach((g: GroupRow) => groupNameMap.set(g.group_id, g.group_name));

  const songGroupMap = new Map<number, number>();
  (songGroups || []).forEach((sg: SongGroupRow) => {
    if (!songGroupMap.has(sg.song_id)) {
      songGroupMap.set(sg.song_id, sg.group_id);
    }
  });

  return { songGroupMap, groupNameMap };
}

async function fetchSongsInBatches(pageSize = 1000): Promise<SongRow[]> {
  const songs: SongRow[] = [];
  let offset = 0;
  let total = 0;

  while (true) {
    const { data, error, count } = await supabase
      .from('kpop_songs')
      .select('song_id, title, youtube_original_url', { count: 'exact' })
      .order('song_id', { ascending: true })
      .range(offset, offset + pageSize - 1);

    if (error) {
      throw error;
    }

    if (typeof count === 'number') total = count;
    if (!data || data.length === 0) break;

    songs.push(...(data as SongRow[]));
    offset += data.length;
    console.log(`  已載入 ${songs.length}/${total || '??'} 首...`);

    if (data.length < pageSize) break; // last page
  }

  console.log(`✅ 讀取歌曲完成，共 ${songs.length}${total ? ` / ${total}` : ''} 首`);
  return songs;
}

async function main() {
  console.log('🚀 開始檢查/修正 YouTube URL...\n');

  const songs = await fetchSongsInBatches(1000);

  const { songGroupMap, groupNameMap } = await fetchMaps();

  let totalChecked = 0;
  let alreadyValid = 0;
  let normalizedOnly = 0;
  let fixed = 0;
  let failed = 0;

  for (const song of songs as SongRow[]) {
    totalChecked += 1;
    const normalizedExisting = normalizeYoutubeUrl(song.youtube_original_url);

    if (normalizedExisting) {
      if (normalizedExisting !== song.youtube_original_url) {
        const { error: updErr } = await supabase
          .from('kpop_songs')
          .update({ youtube_original_url: normalizedExisting })
          .eq('song_id', song.song_id);
        if (updErr) {
          console.error(`❌ 正規化失敗 song_id=${song.song_id}`, updErr);
          failed += 1;
        } else {
          console.log(`🔄 正規化為 watch URL: ${song.title} -> ${normalizedExisting}`);
          normalizedOnly += 1;
        }
      } else {
        alreadyValid += 1;
      }
      continue;
    }

    // 需要重新搜尋
    const groupId = songGroupMap.get(song.song_id);
    const groupName = groupId ? groupNameMap.get(groupId) : '';
    const query = [song.title, groupName].filter(Boolean).join(' ');

    console.log(`🔍 搜尋: "${query || song.title}" (song_id=${song.song_id})`);
    const searchedUrl = await searchYouTube(query || song.title);
    await new Promise((r) => setTimeout(r, 800)); // 避免過快

    const normalizedNew = normalizeYoutubeUrl(searchedUrl);
    if (!normalizedNew) {
      console.warn(`⚠️  找不到合法影片，跳過 song_id=${song.song_id}`);
      failed += 1;
      continue;
    }

    const { error: updateError } = await supabase
      .from('kpop_songs')
      .update({ youtube_original_url: normalizedNew })
      .eq('song_id', song.song_id);

    if (updateError) {
      console.error(`❌ 更新失敗 song_id=${song.song_id}`, updateError);
      failed += 1;
    } else {
      console.log(`✅ 已更新 song_id=${song.song_id} -> ${normalizedNew}`);
      fixed += 1;
    }
  }

  console.log('\n📊 結果');
  console.log(`  總數: ${totalChecked}`);
  console.log(`  已有效: ${alreadyValid}`);
  console.log(`  只需正規化: ${normalizedOnly}`);
  console.log(`  重新取得並修正: ${fixed}`);
  console.log(`  仍失敗: ${failed}`);
}

main().catch((err) => {
  console.error('❌ 執行失敗:', err);
  process.exit(1);
});

