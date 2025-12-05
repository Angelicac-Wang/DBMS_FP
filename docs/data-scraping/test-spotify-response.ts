/**
 * 測試腳本：查看 Spotify API 實際回應格式
 * 
 * 執行: npx tsx scripts/test-spotify-response.ts "BLACKPINK" --limit=5
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// 載入環境變數
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
  console.error('❌ 錯誤: 請在 .env.local 設定 SPOTIFY_CLIENT_ID 和 SPOTIFY_CLIENT_SECRET');
  process.exit(1);
}

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

async function main() {
  const args = process.argv.slice(2);
  const query = args[0] || 'BLACKPINK';
  const limit = parseInt(args.find(arg => arg.startsWith('--limit='))?.split('=')[1] || '5');

  console.log(`🔍 測試 Spotify API 回應格式\n`);
  console.log(`搜尋: "${query}" (限制 ${limit} 首)\n`);

  try {
    const token = await getSpotifyAccessToken();

    // 搜尋藝人
    const artistSearchParams = new URLSearchParams({
      q: query,
      type: 'artist',
      limit: '1',
      market: 'KR',
    });

    const artistRes = await fetch(`https://api.spotify.com/v1/search?${artistSearchParams}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const artistData = (await artistRes.json()) as { artists: { items: Array<{ id: string; name: string }> } };
    const artist = artistData.artists.items[0];

    if (!artist) {
      console.log(`❌ 找不到藝人: "${query}"`);
      return;
    }

    console.log(`✅ 找到藝人: ${artist.name} (ID: ${artist.id})\n`);

    // 搜尋歌曲 - 嘗試兩種方式
    console.log(`🔍 嘗試搜尋方式 1: artist:${artist.id}\n`);
    
    let trackSearchParams = new URLSearchParams({
      q: `artist:${artist.id}`,
      type: 'track',
      limit: limit.toString(),
      market: 'KR',
    });

    let trackRes = await fetch(`https://api.spotify.com/v1/search?${trackSearchParams}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!trackRes.ok) {
      const errorText = await trackRes.text();
      console.log(`❌ 方式 1 失敗: ${errorText}\n`);
    }

    let trackData = (await trackRes.json()) as {
      tracks: {
        items: Array<{
          id: string;
          name: string;
          artists: Array<{ id?: string; name: string }>;
          album: { name: string; release_date: string };
          duration_ms: number;
          external_urls: { spotify: string };
        }>;
        total: number;
      };
    };

    console.log(`📋 方式 1 結果: 找到 ${trackData.tracks.items.length} 首歌曲（總共 ${trackData.tracks.total} 首）\n`);

    // 如果方式 1 沒結果，嘗試方式 2
    if (trackData.tracks.items.length === 0) {
      console.log(`🔍 嘗試搜尋方式 2: artist:"${artist.name}"\n`);
      
      trackSearchParams = new URLSearchParams({
        q: `artist:"${artist.name}"`,
        type: 'track',
        limit: limit.toString(),
        market: 'KR',
      });

      trackRes = await fetch(`https://api.spotify.com/v1/search?${trackSearchParams}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!trackRes.ok) {
        const errorText = await trackRes.text();
        console.log(`❌ 方式 2 失敗: ${errorText}\n`);
      }

      trackData = (await trackRes.json()) as typeof trackData;
      console.log(`📋 方式 2 結果: 找到 ${trackData.tracks.items.length} 首歌曲（總共 ${trackData.tracks.total} 首）\n`);
    }

    if (trackData.tracks.items.length === 0) {
      console.log(`❌ 兩種方式都找不到歌曲，可能是 API 限制或市場設定問題\n`);
      console.log(`💡 提示: 嘗試移除 market 參數或使用不同的搜尋方式\n`);
      
      // 嘗試方式 3: 不使用 market
      console.log(`🔍 嘗試搜尋方式 3: artist:${artist.id} (不使用 market)\n`);
      
      trackSearchParams = new URLSearchParams({
        q: `artist:${artist.id}`,
        type: 'track',
        limit: limit.toString(),
      });

      trackRes = await fetch(`https://api.spotify.com/v1/search?${trackSearchParams}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!trackRes.ok) {
        const errorText = await trackRes.text();
        console.log(`❌ 方式 3 失敗: ${errorText}\n`);
        console.log(`\n原始 API 回應:\n${errorText}\n`);
        return;
      }

      trackData = (await trackRes.json()) as typeof trackData;
      console.log(`📋 方式 3 結果: 找到 ${trackData.tracks.items.length} 首歌曲（總共 ${trackData.tracks.total} 首）\n`);
    }

    // 如果還是沒有結果，輸出原始回應以便除錯
    if (trackData.tracks.items.length === 0) {
      console.log(`\n❌ 所有方式都找不到歌曲\n`);
      console.log(`原始 API 回應（前 500 字元）:\n`);
      const rawResponse = JSON.stringify(trackData, null, 2);
      console.log(rawResponse.substring(0, 500));
      console.log(`\n💡 可能的原因:`);
      console.log(`  1. 該藝人在韓國市場沒有可用的歌曲`);
      console.log(`  2. API 權限限制`);
      console.log(`  3. 搜尋語法問題`);
      return;
    }
    console.log('='.repeat(80));
    console.log('實際 API 回應格式：\n');

    trackData.tracks.items.forEach((track, index) => {
      console.log(`\n🎵 歌曲 ${index + 1}:`);
      console.log(`  name: "${track.name}"`);
      console.log(`  artists: [${track.artists.map(a => `"${a.name}"`).join(', ')}]`);
      console.log(`  主要藝人 (artists[0]): "${track.artists[0]?.name}"`);
      console.log(`  主要藝人 ID: ${track.artists[0]?.id || '(無)'}`);
      console.log(`  album.name: "${track.album.name}"`);
      console.log(`  release_date: "${track.album.release_date}"`);
      console.log(`  duration_ms: ${track.duration_ms}`);
      console.log(`  spotify_url: ${track.external_urls.spotify}`);
      
      // 檢查 name 是否包含藝人名稱
      const mainArtistName = track.artists[0]?.name || '';
      const nameContainsArtist = track.name.toLowerCase().includes(mainArtistName.toLowerCase());
      
      if (nameContainsArtist) {
        console.log(`  ⚠️  注意: name 欄位包含藝人名稱 "${mainArtistName}"`);
        console.log(`     這表示需要處理藝人名稱移除`);
      } else {
        console.log(`  ✅ name 欄位不包含藝人名稱，格式正確`);
      }
      
      console.log('-'.repeat(80));
    });

    console.log('\n📊 統計:');
    const tracksWithArtistInName = trackData.tracks.items.filter(track => {
      const mainArtistName = track.artists[0]?.name || '';
      return track.name.toLowerCase().includes(mainArtistName.toLowerCase());
    }).length;

    console.log(`  總共: ${trackData.tracks.items.length} 首`);
    console.log(`  name 包含藝人名稱: ${tracksWithArtistInName} 首`);
    console.log(`  name 不包含藝人名稱: ${trackData.tracks.items.length - tracksWithArtistInName} 首`);

    if (tracksWithArtistInName > 0) {
      console.log(`\n💡 結論: 確實有 ${tracksWithArtistInName} 首歌曲的 name 欄位包含藝人名稱`);
      console.log(`   需要保留 removeArtistNameFromTitle 函數來處理這種情況`);
    } else {
      console.log(`\n💡 結論: 所有歌曲的 name 欄位都不包含藝人名稱`);
      console.log(`   可以簡化邏輯，不需要 removeArtistNameFromTitle 函數`);
    }

    // 輸出完整 JSON（前 2 首）
    console.log('\n' + '='.repeat(80));
    console.log('完整 JSON 回應（前 2 首）:\n');
    console.log(JSON.stringify(trackData.tracks.items.slice(0, 2), null, 2));

  } catch (error) {
    console.error('❌ 發生錯誤:', error);
    process.exit(1);
  }
}

main();

