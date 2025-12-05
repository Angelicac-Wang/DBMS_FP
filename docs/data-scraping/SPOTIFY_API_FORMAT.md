# Spotify API 回應格式說明

這份文件展示 Spotify API 實際回傳的 JSON 格式。

## 1. 搜尋 API (`GET /v1/search`)

### 請求範例
```
GET https://api.spotify.com/v1/search?q=artist:BLACKPINK&type=track&limit=2&market=KR
```

### 回應格式

```json
{
  "tracks": {
    "href": "https://api.spotify.com/v1/search?query=artist%3ABLACKPINK&type=track&offset=0&limit=2&market=KR",
    "items": [
      {
        "album": {
          "album_type": "album",
          "artists": [
            {
              "external_urls": {
                "spotify": "https://open.spotify.com/artist/41MozSoPIsD1dJM0CLPjZF"
              },
              "href": "https://api.spotify.com/v1/artists/41MozSoPIsD1dJM0CLPjZF",
              "id": "41MozSoPIsD1dJM0CLPjZF",
              "name": "BLACKPINK",
              "type": "artist",
              "uri": "spotify:artist:41MozSoPIsD1dJM0CLPjZF"
            }
          ],
          "available_markets": ["TW", "KR", "JP", ...],
          "external_urls": {
            "spotify": "https://open.spotify.com/album/2Fna4Tb7fme5aXNMlKlClK"
          },
          "href": "https://api.spotify.com/v1/albums/2Fna4Tb7fme5aXNMlKlClK",
          "id": "2Fna4Tb7fme5aXNMlKlClK",
          "images": [
            {
              "height": 640,
              "url": "https://i.scdn.co/image/ab67616d0000b273adf5602227ff0ea4325522ed",
              "width": 640
            },
            {
              "height": 300,
              "url": "https://i.scdn.co/image/ab67616d00001e02adf5602227ff0ea4325522ed",
              "width": 300
            },
            {
              "height": 64,
              "url": "https://i.scdn.co/image/ab67616d00004851adf5602227ff0ea4325522ed",
              "width": 64
            }
          ],
          "name": "THE ALBUM",
          "release_date": "2020-10-02",
          "release_date_precision": "day",
          "total_tracks": 8,
          "type": "album",
          "uri": "spotify:album:2Fna4Tb7fme5aXNMlKlClK"
        },
        "artists": [
          {
            "external_urls": {
              "spotify": "https://open.spotify.com/artist/41MozSoPIsD1dJM0CLPjZF"
            },
            "href": "https://api.spotify.com/v1/artists/41MozSoPIsD1dJM0CLPjZF",
            "id": "41MozSoPIsD1dJM0CLPjZF",
            "name": "BLACKPINK",
            "type": "artist",
            "uri": "spotify:artist:41MozSoPIsD1dJM0CLPjZF"
          }
        ],
        "available_markets": ["TW", "KR", "JP", ...],
        "disc_number": 1,
        "duration_ms": 189000,
        "explicit": false,
        "external_ids": {
          "isrc": "USUM72020012"
        },
        "external_urls": {
          "spotify": "https://open.spotify.com/track/5H1sKFMzDeMtXwND3V6hRY"
        },
        "href": "https://api.spotify.com/v1/tracks/5H1sKFMzDeMtXwND3V6hRY",
        "id": "5H1sKFMzDeMtXwND3V6hRY",
        "is_local": false,
        "name": "How You Like That",
        "popularity": 85,
        "preview_url": "https://p.scdn.co/mp3-preview/...",
        "track_number": 1,
        "type": "track",
        "uri": "spotify:track:5H1sKFMzDeMtXwND3V6hRY"
      },
      {
        "album": {
          "album_type": "single",
          "artists": [
            {
              "external_urls": {
                "spotify": "https://open.spotify.com/artist/41MozSoPIsD1dJM0CLPjZF"
              },
              "href": "https://api.spotify.com/v1/artists/41MozSoPIsD1dJM0CLPjZF",
              "id": "41MozSoPIsD1dJM0CLPjZF",
              "name": "BLACKPINK",
              "type": "artist",
              "uri": "spotify:artist:41MozSoPIsD1dJM0CLPjZF"
            }
          ],
          "available_markets": ["TW", "KR", "JP", ...],
          "external_urls": {
            "spotify": "https://open.spotify.com/album/4N1fROq2oeyLGAlQ1C1j18"
          },
          "href": "https://api.spotify.com/v1/albums/4N1fROq2oeyLGAlQ1C1j18",
          "id": "4N1fROq2oeyLGAlQ1C1j18",
          "images": [
            {
              "height": 640,
              "url": "https://i.scdn.co/image/ab67616d0000b2734c43a2a6593c28a8c0b5c42c",
              "width": 640
            }
          ],
          "name": "Pink Venom",
          "release_date": "2022-08-19",
          "release_date_precision": "day",
          "total_tracks": 1,
          "type": "album",
          "uri": "spotify:album:4N1fROq2oeyLGAlQ1C1j18"
        },
        "artists": [
          {
            "external_urls": {
              "spotify": "https://open.spotify.com/artist/41MozSoPIsD1dJM0CLPjZF"
            },
            "href": "https://api.spotify.com/v1/artists/41MozSoPIsD1dJM0CLPjZF",
            "id": "41MozSoPIsD1dJM0CLPjZF",
            "name": "BLACKPINK",
            "type": "artist",
            "uri": "spotify:artist:41MozSoPIsD1dJM0CLPjZF"
          }
        ],
        "available_markets": ["TW", "KR", "JP", ...],
        "disc_number": 1,
        "duration_ms": 201000,
        "explicit": false,
        "external_ids": {
          "isrc": "USUM72220120"
        },
        "external_urls": {
          "spotify": "https://open.spotify.com/track/0W4dmfX8VqX0qJqJqJqJqJ"
        },
        "href": "https://api.spotify.com/v1/tracks/0W4dmfX8VqX0qJqJqJqJqJ",
        "id": "0W4dmfX8VqX0qJqJqJqJqJ",
        "is_local": false,
        "name": "Pink Venom",
        "popularity": 88,
        "preview_url": "https://p.scdn.co/mp3-preview/...",
        "track_number": 1,
        "type": "track",
        "uri": "spotify:track:0W4dmfX8VqX0qJqJqJqJqJ"
      }
    ],
    "limit": 2,
    "next": "https://api.spotify.com/v1/search?query=artist%3ABLACKPINK&type=track&offset=2&limit=2&market=KR",
    "offset": 0,
    "previous": null,
    "total": 120
  }
}
```

### 重要欄位說明

#### Track 物件（我們主要使用的）
- `id`: 歌曲的 Spotify ID
- `name`: 歌曲名稱（**可能包含藝人名稱，格式不統一**）
- `artists`: 藝人陣列
  - `artists[0]`: **主要藝人**（我們用來過濾的）
  - `artists[0].id`: 藝人 ID（如果有）
  - `artists[0].name`: 藝人名稱
- `album.name`: 專輯名稱
- `album.release_date`: 發行日期（格式可能是 `YYYY-MM-DD`, `YYYY-MM`, 或 `YYYY`）
- `album.images`: 專輯封面圖片陣列（通常第一個是最大尺寸）
- `duration_ms`: 歌曲長度（毫秒）
- `external_urls.spotify`: Spotify 連結
- `preview_url`: 30 秒預覽音檔（可能為 `null`）
- `popularity`: 熱門度（0-100）
- `explicit`: 是否包含不當內容

## 2. 單首歌曲 API (`GET /v1/tracks/{id}`)

### 請求範例
```
GET https://api.spotify.com/v1/tracks/5H1sKFMzDeMtXwND3V6hRY
```

### 回應格式

```json
{
  "album": {
    "album_type": "album",
    "artists": [
      {
        "external_urls": {
          "spotify": "https://open.spotify.com/artist/41MozSoPIsD1dJM0CLPjZF"
        },
        "href": "https://api.spotify.com/v1/artists/41MozSoPIsD1dJM0CLPjZF",
        "id": "41MozSoPIsD1dJM0CLPjZF",
        "name": "BLACKPINK",
        "type": "artist",
        "uri": "spotify:artist:41MozSoPIsD1dJM0CLPjZF"
      }
    ],
    "available_markets": ["TW", "KR", "JP", ...],
    "external_urls": {
      "spotify": "https://open.spotify.com/album/2Fna4Tb7fme5aXNMlKlClK"
    },
    "href": "https://api.spotify.com/v1/albums/2Fna4Tb7fme5aXNMlKlClK",
    "id": "2Fna4Tb7fme5aXNMlKlClK",
    "images": [
      {
        "height": 640,
        "url": "https://i.scdn.co/image/ab67616d0000b273adf5602227ff0ea4325522ed",
        "width": 640
      },
      {
        "height": 300,
        "url": "https://i.scdn.co/image/ab67616d00001e02adf5602227ff0ea4325522ed",
        "width": 300
      },
      {
        "height": 64,
        "url": "https://i.scdn.co/image/ab67616d00004851adf5602227ff0ea4325522ed",
        "width": 64
      }
    ],
    "name": "THE ALBUM",
    "release_date": "2020-10-02",
    "release_date_precision": "day",
    "total_tracks": 8,
    "type": "album",
    "uri": "spotify:album:2Fna4Tb7fme5aXNMlKlClK"
  },
  "artists": [
    {
      "external_urls": {
        "spotify": "https://open.spotify.com/artist/41MozSoPIsD1dJM0CLPjZF"
      },
      "href": "https://api.spotify.com/v1/artists/41MozSoPIsD1dJM0CLPjZF",
      "id": "41MozSoPIsD1dJM0CLPjZF",
      "name": "BLACKPINK",
      "type": "artist",
      "uri": "spotify:artist:41MozSoPIsD1dJM0CLPjZF"
    }
  ],
  "available_markets": ["TW", "KR", "JP", ...],
  "disc_number": 1,
  "duration_ms": 189000,
  "explicit": false,
  "external_ids": {
    "isrc": "USUM72020012"
  },
  "external_urls": {
    "spotify": "https://open.spotify.com/track/5H1sKFMzDeMtXwND3V6hRY"
  },
  "href": "https://api.spotify.com/v1/tracks/5H1sKFMzDeMtXwND3V6hRY",
  "id": "5H1sKFMzDeMtXwND3V6hRY",
  "is_local": false,
  "name": "How You Like That",
  "popularity": 85,
  "preview_url": "https://p.scdn.co/mp3-preview/abc123...",
  "track_number": 1,
  "type": "track",
  "uri": "spotify:track:5H1sKFMzDeMtXwND3V6hRY"
}
```

## 3. 藝人搜尋 API (`GET /v1/search?type=artist`)

### 請求範例
```
GET https://api.spotify.com/v1/search?q=BLACKPINK&type=artist&limit=1
```

### 回應格式

```json
{
  "artists": {
    "href": "https://api.spotify.com/v1/search?query=BLACKPINK&type=artist&offset=0&limit=1&market=KR",
    "items": [
      {
        "external_urls": {
          "spotify": "https://open.spotify.com/artist/41MozSoPIsD1dJM0CLPjZF"
        },
        "followers": {
          "href": null,
          "total": 45678901
        },
        "genres": [
          "k-pop",
          "k-pop girl group",
          "pop"
        ],
        "href": "https://api.spotify.com/v1/artists/41MozSoPIsD1dJM0CLPjZF",
        "id": "41MozSoPIsD1dJM0CLPjZF",
        "images": [
          {
            "height": 640,
            "url": "https://i.scdn.co/image/ab6761610000e5eb8ae31a4c0c8b5c4e4e4e4e4e4",
            "width": 640
          }
        ],
        "name": "BLACKPINK",
        "popularity": 88,
        "type": "artist",
        "uri": "spotify:artist:41MozSoPIsD1dJM0CLPjZF"
      }
    ],
    "limit": 1,
    "next": null,
    "offset": 0,
    "previous": null,
    "total": 1
  }
}
```

## 4. 我們腳本中使用的 TypeScript Interface

```typescript
interface SpotifyTrack {
  id: string;
  name: string;                    // 歌曲名稱（可能包含藝人名稱）
  artists: { 
    name: string; 
    id?: string;                   // 在搜尋 API 中可能沒有，但在單首歌曲 API 中有
  }[];
  album: {
    name: string;
    release_date: string;           // 可能是 "YYYY-MM-DD", "YYYY-MM", 或 "YYYY"
    images?: { 
      url: string; 
      height: number; 
      width: number 
    }[];
  };
  duration_ms: number;             // 毫秒
  external_urls: { 
    spotify: string 
  };
  preview_url: string | null;      // 可能為 null
  popularity?: number;              // 0-100
  explicit?: boolean;
}

interface SpotifyArtist {
  id: string;
  name: string;
  popularity?: number;              // 0-100
  followers?: { 
    total: number 
  };
  genres?: string[];
}
```

## 5. 常見問題

### Q: 為什麼 `name` 欄位格式不一致？理論上 `name` 和 `artists` 是分開的，為什麼還需要處理？

A: 這是一個很好的問題！理論上確實 `name` 和 `artists` 是分開的欄位，但實際上：

**可能的情況：**
1. **大部分情況下**：`name` 欄位確實只包含歌名，`artists` 陣列包含藝人資訊
2. **少數情況下**：某些上傳者/發行商在設定歌曲名稱時，會在 `name` 欄位中包含藝人名稱
   - 例如：`"TWICE - MORE & MORE"` 或 `"MORE & MORE - TWICE"`
   - 這可能是為了 SEO 或顯示目的

**如何確認：**
執行測試腳本查看實際回應：
```bash
npx tsx scripts/test-spotify-response.ts "BLACKPINK" --limit=10
```

**我們的處理方式：**
- 如果 `name` 不包含藝人名稱 → 直接使用
- 如果 `name` 包含藝人名稱 → 自動移除，確保資料庫中的 `title` 欄位只包含歌名

這樣可以確保資料的一致性，無論 Spotify 的資料格式如何。

### Q: 為什麼搜尋結果會混入其他藝人的歌曲？
A: Spotify 的搜尋 API 使用模糊匹配，可能返回：
- 歌曲名稱包含關鍵字的歌曲
- 專輯名稱包含關鍵字的歌曲
- 合作歌曲（目標藝人不是主要藝人）

這就是為什麼我們在藝人模式下加入過濾功能，只保留主要藝人是目標藝人的歌曲。

### Q: `artists` 陣列中的順序重要嗎？
A: 是的！`artists[0]` 是**主要藝人**（通常是歌曲的擁有者/發行者），後面的可能是合作藝人。我們的過濾邏輯只檢查 `artists[0]`。

### Q: `release_date` 格式為什麼不一致？
A: Spotify 的資料來源不同，有些只有年份，有些有完整日期。我們的腳本會自動處理：
- `"2020"` → `"2020-01-01"`
- `"2020-10"` → `"2020-10-01"`
- `"2020-10-02"` → `"2020-10-02"`

