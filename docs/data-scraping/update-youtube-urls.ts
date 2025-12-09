/**
 * 更新 kpop_songs 中 youtube_original_url 為 "https://www.youtube.com" 的歌曲
 * 
 * 使用方法：
 * 1. 確保 .env.local 有 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY
 * 2. 執行: npx tsx docs/data-scraping/update-youtube-urls.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as cheerio from 'cheerio';

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

interface SongInfo {
  song_id: number;
  title: string;
  group_name: string;
}

/**
 * 搜尋 YouTube 並取得第一個結果的連結
 */
async function searchYouTube(query: string): Promise<string | null> {
  try {
    // 使用 YouTube 搜尋 URL
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    
    // 使用 fetch 取得搜尋結果頁面
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    });

    if (!response.ok) {
      console.error(`❌ YouTube 搜尋失敗: HTTP ${response.status}`);
      return null;
    }

    const html = await response.text();
    
    // 方法 1: 從 ytInitialData JSON 中提取 (最可靠)
    const ytInitialDataMatch = html.match(/var ytInitialData = ({[\s\S]+?});/);
    if (ytInitialDataMatch) {
      try {
        const ytInitialData = JSON.parse(ytInitialDataMatch[1]);
        // 遍歷搜尋結果尋找第一個影片
        const contents = ytInitialData?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents;
        if (contents && Array.isArray(contents)) {
          for (const item of contents) {
            const videoId = item?.videoRenderer?.videoId || 
                          item?.videoRenderer?.navigationEndpoint?.watchEndpoint?.videoId;
            if (videoId) {
              return `https://www.youtube.com/watch?v=${videoId}`;
            }
          }
        }
      } catch (e) {
        // JSON 解析失敗，繼續嘗試其他方法
      }
    }

    // 方法 2: 使用 cheerio 解析 HTML
    const $ = cheerio.load(html);
    const firstVideoLink = $('a[href*="/watch?v="]').first().attr('href');
    if (firstVideoLink) {
      const videoIdMatch = firstVideoLink.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
      if (videoIdMatch && videoIdMatch[1]) {
        return `https://www.youtube.com/watch?v=${videoIdMatch[1]}`;
      }
    }

    // 方法 3: 正則表達式搜尋 videoId
    const videoIdMatch = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
    if (videoIdMatch && videoIdMatch[1]) {
      return `https://www.youtube.com/watch?v=${videoIdMatch[1]}`;
    }

    // 方法 4: 搜尋 /watch?v= 模式
    const watchMatch = html.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/);
    if (watchMatch && watchMatch[1]) {
      return `https://www.youtube.com/watch?v=${watchMatch[1]}`;
    }

    console.warn(`⚠️  無法從搜尋結果中提取影片 ID: ${query}`);
    return null;
  } catch (error) {
    console.error(`❌ YouTube 搜尋錯誤 (${query}):`, error);
    return null;
  }
}

/**
 * 取得需要更新的歌曲列表
 */
async function getSongsToUpdate(): Promise<SongInfo[]> {
  try {
    // 查詢 youtube_original_url 為 "https://www.youtube.com" 的歌曲
    const { data: songs, error } = await supabase
      .from('kpop_songs')
      .select('song_id, title')
      .eq('youtube_original_url', 'https://www.youtube.com');

    if (error) {
      throw error;
    }

    if (!songs || songs.length === 0) {
      console.log('✅ 沒有需要更新的歌曲');
      return [];
    }

    console.log(`📋 找到 ${songs.length} 首需要更新的歌曲`);

    // 為每首歌取得團體資訊
    const songsWithGroups: SongInfo[] = [];

    for (const song of songs) {
      // 查詢 song_group 取得 group_id
      const { data: songGroups, error: sgError } = await supabase
        .from('song_group')
        .select('group_id')
        .eq('song_id', song.song_id);

      if (sgError) {
        console.error(`❌ 查詢 song_group 失敗 (song_id: ${song.song_id}):`, sgError);
        continue;
      }

      if (!songGroups || songGroups.length === 0) {
        console.warn(`⚠️  歌曲 ${song.song_id} (${song.title}) 沒有關聯的團體`);
        continue;
      }

      // 取得第一個團體的 group_name
      const firstGroupId = songGroups[0].group_id;
      const { data: group, error: groupError } = await supabase
        .from('kpop_groups')
        .select('group_name')
        .eq('group_id', firstGroupId)
        .single();

      if (groupError || !group) {
        console.error(`❌ 查詢 kpop_groups 失敗 (group_id: ${firstGroupId}):`, groupError);
        continue;
      }

      songsWithGroups.push({
        song_id: song.song_id,
        title: song.title,
        group_name: group.group_name,
      });
    }

    return songsWithGroups;
  } catch (error) {
    console.error('❌ 取得歌曲列表失敗:', error);
    throw error;
  }
}

/**
 * 更新歌曲的 YouTube URL
 */
async function updateSongYouTubeUrl(songId: number, youtubeUrl: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('kpop_songs')
      .update({ youtube_original_url: youtubeUrl })
      .eq('song_id', songId);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error(`❌ 更新歌曲 ${songId} 失敗:`, error);
    return false;
  }
}

/**
 * 主函數
 */
async function main() {
  console.log('🚀 開始更新 YouTube URL...\n');

  // 取得需要更新的歌曲
  const songs = await getSongsToUpdate();

  if (songs.length === 0) {
    console.log('✅ 沒有需要更新的歌曲');
    return;
  }

  console.log(`\n📝 將更新 ${songs.length} 首歌曲的 YouTube URL\n`);

  let successCount = 0;
  let failCount = 0;

  // 逐一處理每首歌
  for (let i = 0; i < songs.length; i++) {
    const song = songs[i];
    console.log(`[${i + 1}/${songs.length}] 處理: ${song.title} - ${song.group_name}`);

    // 搜尋 YouTube
    const searchQuery = `${song.title} ${song.group_name}`;
    console.log(`  🔍 搜尋: "${searchQuery}"`);

    const youtubeUrl = await searchYouTube(searchQuery);

    if (!youtubeUrl) {
      console.log(`  ❌ 無法找到 YouTube 連結`);
      failCount++;
      continue;
    }

    console.log(`  ✅ 找到: ${youtubeUrl}`);

    // 更新資料庫
    const updated = await updateSongYouTubeUrl(song.song_id, youtubeUrl);

    if (updated) {
      console.log(`  ✅ 已更新資料庫`);
      successCount++;
    } else {
      console.log(`  ❌ 更新資料庫失敗`);
      failCount++;
    }

    console.log(''); // 空行

    // 避免請求過快，稍作延遲
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n📊 更新結果:');
  console.log(`  ✅ 成功: ${successCount}`);
  console.log(`  ❌ 失敗: ${failCount}`);
  console.log(`  📝 總計: ${songs.length}`);
}

// 執行主函數
main().catch(error => {
  console.error('❌ 執行失敗:', error);
  process.exit(1);
});

