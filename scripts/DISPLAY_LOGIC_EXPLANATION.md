# 搜尋結果顯示邏輯說明

## 顯示格式

搜尋結果的顯示格式是：
```
歌名 - 藝人名稱 (時長) 標記
```

## 代碼邏輯解析

### 1. 取得處理後的歌名

```typescript
const { title, titleKr } = parseSongName(track.name, track.artists);
```

`parseSongName` 函數會：
- 先嘗試移除 `track.name` 中的藝人名稱（如果有的話）
- 提取韓文部分
- 返回 `{ title, titleKr }`

### 2. 決定顯示的名稱

```typescript
const displayName = title !== track.name 
  ? `${title} (原始: ${track.name})` 
  : track.name;
```

**邏輯說明：**
- 如果 `title !== track.name`：表示有移除藝人名稱，顯示 `清理後的歌名 (原始: 原始歌名)`
- 如果 `title === track.name`：表示沒有移除（原始名稱就不包含藝人），直接顯示 `原始歌名`

### 3. 組合顯示

```typescript
console.log(
  `  ${index + 1}. ${displayName} - ${artists} (${minutes}:${seconds}) ${koreanIndicator}`
);
```

**最終格式：**
```
  1. 歌名 - 藝人名稱 (3:19) 🇰🇷
```

或如果有移除藝人名稱：
```
  1. 清理後的歌名 (原始: TWICE - 原始歌名) - TWICE (3:19) 🇰🇷
```

## 為什麼會出現「有些歌名在前面有些在後面」？

### 情況 1：正常情況（大部分）
如果 Spotify 的 `track.name` 不包含藝人名稱（如測試結果所示）：
- `title === track.name`
- 顯示：`歌名 - 藝人名稱`
- **格式統一，歌名都在前面**

### 情況 2：異常情況（少數）
如果 Spotify 的 `track.name` 包含藝人名稱：
- `title !== track.name`（因為移除了藝人名稱）
- 顯示：`清理後的歌名 (原始: 原始歌名) - 藝人名稱`
- **格式可能看起來不一致**

### 情況 3：可能的混淆來源

你可能看到的是終端輸出中，有些歌曲的顯示格式不同：

**範例 1（正常）：**
```
  1. JUMP - BLACKPINK (2:44) ⚠️  (無韓文)
```

**範例 2（如果有移除藝人名稱）：**
```
  2. MORE & MORE (原始: TWICE - MORE & MORE) - TWICE (3:19) ⚠️  (無韓文)
```

**範例 3（如果有韓文）：**
```
  3. 날 바라바라봐 / LOOK AT ME - TWICE (3:13) 🇰🇷
      → 韓文: 날 바라바라봐
```

## 實際資料流程

```
Spotify API 回應
  ↓
track.name = "JUMP"                    (不包含藝人)
track.artists = [{name: "BLACKPINK"}]  (藝人資訊)
  ↓
parseSongName()
  ↓
title = "JUMP"                         (沒有移除，因為原本就沒有藝人)
  ↓
displayName = "JUMP"                   (title === track.name)
  ↓
顯示: "JUMP - BLACKPINK"
```

## 簡化建議

根據測試結果，所有歌曲的 `name` 欄位都不包含藝人名稱，所以：

1. **可以簡化顯示邏輯**：不需要檢查 `title !== track.name`，直接顯示 `track.name`
2. **可以移除 `removeArtistNameFromTitle` 函數**：因為實際上不需要移除藝人名稱
3. **保留韓文提取功能**：這個還是有用的

## 修改建議

如果確認所有歌曲的 `name` 都不包含藝人名稱，可以簡化為：

```typescript
// 簡化版本
tracks.forEach((track, index) => {
  const artists = track.artists.map(a => a.name).join(', ');
  const duration = Math.floor(track.duration_ms / 1000);
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  const { title, titleKr } = parseSongName(track.name, track.artists);
  const hasKorean = extractKoreanText(track.name) !== null;
  const koreanIndicator = hasKorean ? '🇰🇷' : '⚠️  (無韓文)';
  
  // 直接顯示 track.name，因為它不包含藝人名稱
  console.log(
    `  ${index + 1}. ${track.name} - ${artists} (${minutes}:${seconds.toString().padStart(2, '0')}) ${koreanIndicator}`
  );
  if (hasKorean && titleKr !== title) {
    console.log(`      → 韓文: ${titleKr}`);
  }
});
```

這樣格式就會完全統一：`歌名 - 藝人名稱`





