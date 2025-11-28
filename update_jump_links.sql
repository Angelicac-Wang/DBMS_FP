-- 更新 JUMP 歌曲的 YouTube 和 Spotify 連結
-- YouTube: https://www.youtube.com/watch?v=CgCVZdcKcqY
-- Spotify: https://open.spotify.com/track/5H1sKFMzDeMtXwND3V6hRY

-- 方法 1: 如果知道 song_id (根據樣本資料，song_id = 3)
UPDATE kpop_songs
SET youtube_original_url = 'https://www.youtube.com/watch?v=CgCVZdcKcqY',
    spotify_url = 'https://open.spotify.com/track/5H1sKFMzDeMtXwND3V6hRY'
WHERE song_id = 3;

-- 方法 2: 使用歌曲名稱更新（如果不知道 song_id）
-- UPDATE kpop_songs
-- SET youtube_original_url = 'https://www.youtube.com/watch?v=CgCVZdcKcqY',
--     spotify_url = 'https://open.spotify.com/track/5H1sKFMzDeMtXwND3V6hRY'
-- WHERE title = 'Jump' OR title_kr = '점프';

-- 驗證更新結果
SELECT song_id, title, title_kr, youtube_original_url, spotify_url
FROM kpop_songs
WHERE song_id = 3 OR title = 'Jump' OR title_kr = '점프';

