'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface UserProfile {
  u_id: number;
  name: string;
  email: string;
  birthdate: string;
  gender: string;
  region: string;
  phone: string;
  create_at: string;
  last_login: string;
}

interface UserSkill {
  skill_type: string;
  proficiency_level: number;
  years_of_experience: number;
  discription: string;
}

interface Portfolio {
  video_url: string;
  title: string;
  discription: string;
  cover_song_id?: number;
  created_at: string;
  view_cnt: number;
}

interface SocialLink {
  url: string;
  platform: string;
  follower_cnt: number;
}

function extractYoutubeId(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
  return match ? match[1] : null;
}

function getSkillColor(level: number): string {
  if (level > 80) return 'bg-[#eca382]'; // 深橘色
  if (level > 50) return 'bg-[#f0b89a]'; // 淡橘色
  return 'bg-[#f5d0c0]'; // 更淡的橘色
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [filteredSongs, setFilteredSongs] = useState<Array<{ song_id: number; title: string; displayName: string }>>([]);
  const [songSearchQuery, setSongSearchQuery] = useState('');
  const [showSongDropdown, setShowSongDropdown] = useState(false);
  const [error, setError] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [formData, setFormData] = useState({
    video_url: '',
    title: '',
    discription: '',
    cover_song_id: '',
    cover_song_display: '',
  });

  useEffect(() => {
    const currentUserId = localStorage.getItem('userId');
    if (!currentUserId) {
      router.push('/auth');
      return;
    }

    // 檢查 URL 中是否有 userId 參數
    const urlParams = new URLSearchParams(window.location.search);
    const targetUserId = urlParams.get('userId');

    if (targetUserId) {
      // 查看其他用戶的個人資料
      setIsOwnProfile(targetUserId === currentUserId);
      fetchUserProfile(targetUserId);
      fetchPortfolios(targetUserId);
    } else {
      // 查看自己的個人資料
      setIsOwnProfile(true);
      fetchUserProfile(currentUserId);
      fetchPortfolios(currentUserId);
    }

    // 不再預先載入所有歌曲，改為在搜尋時才載入
  }, [router]);

  // 點擊外部關閉下拉選單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.song-dropdown-container')) {
        setShowSongDropdown(false);
      }
    };

    if (showSongDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSongDropdown]);

  // 清理 timeout
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const fetchSongs = async (searchQuery: string = '') => {
    try {
      setSearchLoading(true);
      const url = searchQuery.trim() 
        ? `/api/songs?search=${encodeURIComponent(searchQuery.trim())}&limit=100`
        : '/api/songs?limit=50'; // 沒有搜尋時只載入前 50 首作為預覽
      
      const response = await fetch(url);
      if (!response.ok) {
        setFilteredSongs([]);
        return;
      }
      
      const songsData = await response.json();
      setFilteredSongs(songsData);
    } catch (err) {
      console.error('Error fetching songs:', err);
      setFilteredSongs([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      setLoading(true);

      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user profile');
      
      const userData = await response.json();
      setUser(userData);
      setSkills(userData.skills || []);
      setSocialLinks(userData.socialLinks || []);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPortfolios = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) return;
      
      const userData = await response.json();
      const portfoliosData: Portfolio[] = (userData.portfolios || []).map((item: any) => ({
        video_url: item.video_url,
        title: item.title,
        discription: item.discription || '',
        cover_song_id: item.cover_song_id,
        created_at: item.created_at || '',
        view_cnt: item.view_cnt || 0,
      }));

      setPortfolios(portfoliosData);
    } catch (err) {
      console.error('Error fetching portfolios:', err);
    }
  };

  const handleAddPortfolio = () => {
    setFormData({ video_url: '', title: '', discription: '', cover_song_id: '', cover_song_display: '' });
    setSongSearchQuery('');
    setFilteredSongs([]);
    setShowSongDropdown(false);
    setError('');
    setShowModal(true);
  };

  // 使用 debounce 來延遲搜尋請求
  const handleSongSearch = (query: string) => {
    setSongSearchQuery(query);
    setShowSongDropdown(true);

    // 清除之前的 timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // 如果搜尋為空，顯示一些預設結果
    if (query.trim() === '') {
      fetchSongs(''); // 載入前 50 首作為預覽
      return;
    }

    // 設置新的 timeout，300ms 後執行搜尋
    const timeout = setTimeout(() => {
      fetchSongs(query);
    }, 300);

    setSearchTimeout(timeout);
  };

  const handleSelectSong = (song: { song_id: number; displayName: string }) => {
    setFormData({
      ...formData,
      cover_song_id: song.song_id.toString(),
      cover_song_display: song.displayName,
    });
    setSongSearchQuery(song.displayName);
    setShowSongDropdown(false);
  };

  const handleSavePortfolio = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
      setError('');

      if (!formData.video_url || !formData.title) {
        setError('請填寫影片連結和作品標題');
        return;
      }

      const response = await fetch('/api/portfolios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          u_id: parseInt(userId),
          video_url: formData.video_url,
          title: formData.title,
          discription: formData.discription || null,
          cover_song_id: formData.cover_song_id ? parseInt(formData.cover_song_id) : null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || '儲存失敗');
        return;
      }

      setShowModal(false);
      setFormData({ video_url: '', title: '', discription: '', cover_song_id: '', cover_song_display: '' });
      setSongSearchQuery('');
      setFilteredSongs([]);
      fetchPortfolios(userId);
    } catch (err: any) {
      setError('儲存失敗：' + (err.message || '未知錯誤'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff6ec]">
        <div className="mx-auto px-4 py-6" style={{ maxWidth: 'var(--container-7xl)' }}>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[#eca382] border-t-transparent"></div>
            <p className="mt-4 text-gray-600">載入中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#fff6ec]">
        <div className="mx-auto px-4 py-6" style={{ maxWidth: 'var(--container-7xl)' }}>
          <div className="text-center py-12">
            <p className="text-gray-600">無法載入用戶資料</p>
          </div>
        </div>
      </div>
    );
  }

  const avatarInitial = user.name.charAt(0).toUpperCase();
  // 临时替换 angelica 的头像（不存数据库）
  const isAngelica = user.name.toLowerCase() === 'angelica' || user.u_id === 17643916039294400;
  const angelicaAvatarUrl = '/profile.jpg';

  return (
    <div className="min-h-screen bg-[#fff6ec]">
      <div className="mx-auto px-4" style={{ maxWidth: 'var(--container-7xl)' }}>
        {/* 橘色 bar 和大頭貼 */}
        <div className="relative mb-8">
          {/* 橘色 bar */}
          <div className="h-32 bg-gradient-to-r from-[#eca382] to-[#f0b89a]"></div>
          
          {/* 大頭貼（切齊 bar 底部，橫向置中） */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
            <div className="relative">
            {isAngelica ? (
              <img
                src={angelicaAvatarUrl}
                alt={user.name}
                className="w-32 h-32 rounded-full object-cover shadow-lg ring-4 ring-white"
                onError={(e) => {
                  // 如果图片加载失败，回退到首字母显示
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `<div class="w-32 h-32 rounded-full bg-gradient-to-r from-orange-400 to-pink-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg ring-4 ring-white">${avatarInitial}</div>`;
                  }
                }}
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-orange-400 to-pink-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg ring-4 ring-white">
                {avatarInitial}
              </div>
            )}
            {/* 編輯按鈕（頭像右下角） */}
            {isOwnProfile && (
              <Link
                href="/profile/edit"
                className="absolute bottom-0 right-0 p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors ring-2 ring-white"
                aria-label="編輯個人資訊"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </Link>
            )}
            </div>
          </div>
        </div>

        {/* 暱稱 */}
        <div className="flex items-center justify-center mb-6" style={{ marginTop: '4.5rem' }}>
          <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
        </div>

        {/* Skills and Social Links - 并排显示 */}
        {(skills.length > 0 || socialLinks.length > 0) && (
          <div className="mb-8 flex flex-col md:flex-row items-center justify-center gap-1">
            {/* Skills */}
            {skills.length > 0 && (
              <div className="flex-1 max-w-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">我的技能</h2>
                <div className="flex flex-wrap justify-center gap-3">
                  {skills.map((skill, index) => (
                    <div
                      key={index}
                      className={`${getSkillColor(skill.proficiency_level)} text-white px-4 py-2 rounded-full text-sm font-semibold shadow-sm`}
                    >
                      {skill.skill_type}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex-1 max-w-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">社群媒體</h2>
                <div className="flex flex-wrap justify-center gap-4">
                  {socialLinks.map((link, index) => {
                    const getPlatformIcon = (platform: string) => {
                      const lowerPlatform = platform.toLowerCase();
                      if (lowerPlatform.includes('instagram')) {
                        return (
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                        );
                      } else if (lowerPlatform.includes('youtube')) {
                        return (
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                        );
                      } else if (lowerPlatform.includes('tiktok')) {
                        return (
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                          </svg>
                        );
                      }
                      return (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      );
                    };

                    return (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#eca382] to-[#f0b89a] rounded-lg shadow-sm hover:shadow-md transition-all border border-[#eca382] hover:from-[#e08f6f] hover:to-[#eca382] text-white"
                      >
                        {getPlatformIcon(link.platform)}
                        <span className="text-sm font-medium text-white">{link.platform}</span>
                        {link.follower_cnt > 0 && (
                          <span className="text-xs text-white/80">({link.follower_cnt.toLocaleString()})</span>
                        )}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Portfolios */}
        <div className="pb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">我的作品集</h2>
            {isOwnProfile && (
              <button
                onClick={handleAddPortfolio}
                className="px-4 py-2 bg-[#eca382] text-white rounded-lg hover:bg-[#e08f6f] transition-colors text-sm font-semibold"
              >
                + 新增作品
              </button>
            )}
          </div>
          {portfolios.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm ring-1 ring-gray-200">
              <p className="text-gray-500 mb-4">尚無作品集</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {portfolios.map((portfolio, index) => {
                const youtubeId = extractYoutubeId(portfolio.video_url);
                const thumbnailUrl = youtubeId
                  ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
                  : null;

                return (
                  <Link
                    key={index}
                    href={`/portfolio/${encodeURIComponent(portfolio.video_url)}`}
                    className="relative aspect-video rounded-lg overflow-hidden bg-gray-200 group cursor-pointer block"
                  >
                    {thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt={portfolio.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <p className="text-gray-400 text-sm">無縮圖</p>
                      </div>
                    )}
                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                        <svg className="w-8 h-8 text-[#eca382] ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                    {/* Title overlay at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <p className="text-white text-sm font-semibold truncate">{portfolio.title}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal for adding portfolio */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">新增作品</h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setError('');
                    setFormData({ video_url: '', title: '', discription: '', cover_song_id: '', cover_song_display: '' });
                    setSongSearchQuery('');
                    setFilteredSongs([]);
                    setShowSongDropdown(false);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">影片連結 *</label>
                  <input
                    type="url"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#eca382] focus:border-transparent text-black"
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">作品標題 *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    maxLength={20}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#eca382] focus:border-transparent text-black"
                    required
                  />
                </div>
                <div className="relative song-dropdown-container">
                  <label className="block text-sm font-medium text-gray-700 mb-2">翻跳歌曲（選填）</label>
                  <input
                    type="text"
                    value={songSearchQuery}
                    onChange={(e) => handleSongSearch(e.target.value)}
                    onFocus={() => {
                      setShowSongDropdown(true);
                      // 如果沒有搜尋結果且輸入框為空，載入一些預設結果
                      if (filteredSongs.length === 0 && !songSearchQuery.trim()) {
                        fetchSongs('');
                      }
                    }}
                    placeholder="搜尋歌曲（輸入歌名、團名或偶像名）..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#eca382] focus:border-transparent text-black"
                  />
                  {showSongDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {searchLoading ? (
                        <div className="px-4 py-2 text-center text-gray-500">
                          <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-[#eca382] mr-2"></div>
                          搜尋中...
                        </div>
                      ) : filteredSongs.length > 0 ? (
                        filteredSongs.map((song) => (
                          <button
                            key={song.song_id}
                            type="button"
                            onClick={() => handleSelectSong(song)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors text-black"
                          >
                            {song.displayName}
                          </button>
                        ))
                      ) : songSearchQuery.trim() ? (
                        <div className="px-4 py-2 text-center text-gray-500">
                          找不到符合的歌曲
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">描述</label>
                  <textarea
                    value={formData.discription}
                    onChange={(e) => setFormData({ ...formData, discription: e.target.value })}
                    maxLength={500}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#eca382] focus:border-transparent text-black"
                    placeholder="作品描述..."
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setError('');
                      setFormData({ video_url: '', title: '', discription: '', cover_song_id: '', cover_song_display: '' });
                      setSongSearchQuery('');
                      setFilteredSongs([]);
                      setShowSongDropdown(false);
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSavePortfolio}
                    className="flex-1 bg-[#eca382] text-white py-2 rounded-lg hover:bg-[#e08f6f] transition-colors"
                  >
                    儲存
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
