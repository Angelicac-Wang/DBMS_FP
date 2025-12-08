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
  const [showModal, setShowModal] = useState(false);
  const [songs, setSongs] = useState<Array<{ song_id: number; title: string; displayName: string }>>([]);
  const [filteredSongs, setFilteredSongs] = useState<Array<{ song_id: number; title: string; displayName: string }>>([]);
  const [songSearchQuery, setSongSearchQuery] = useState('');
  const [showSongDropdown, setShowSongDropdown] = useState(false);
  const [error, setError] = useState('');
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

    fetchSongs();
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

  const fetchSongs = async () => {
    try {
      const response = await fetch('/api/songs?limit=500');
      if (!response.ok) return;
      
      const songsData = await response.json();
      setSongs(songsData);
      setFilteredSongs(songsData);
    } catch (err) {
      console.error('Error fetching songs:', err);
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
    setFilteredSongs(songs);
    setShowSongDropdown(false);
    setError('');
    setShowModal(true);
  };

  const handleSongSearch = (query: string) => {
    setSongSearchQuery(query);
    if (query.trim() === '') {
      setFilteredSongs(songs);
    } else {
      const filtered = songs.filter((song) =>
        song.displayName.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSongs(filtered);
    }
    setShowSongDropdown(true);
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
      setFilteredSongs(songs);
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

  return (
    <div className="min-h-screen bg-[#fff6ec]">
      <div className="mx-auto px-4" style={{ maxWidth: 'var(--container-7xl)' }}>
        {/* 橘色 bar 和大頭貼 */}
        <div className="relative mb-8">
          {/* 橘色 bar */}
          <div className="h-32 bg-gradient-to-r from-[#eca382] to-[#f0b89a]"></div>
          
          {/* 大頭貼（切齊 bar 底部，橫向置中） */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-orange-400 to-pink-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg ring-4 ring-white">
              {avatarInitial}
            </div>
          </div>
        </div>

        {/* 暱稱和修改 icon */}
        <div className="flex items-center justify-center gap-3 mb-6" style={{ marginTop: '4rem' }}>
          <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
          {isOwnProfile && (
            <Link
              href="/profile/edit"
              className="p-2 rounded-full bg-white shadow-sm hover:bg-gray-50 transition-colors"
              aria-label="編輯個人資訊"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </Link>
          )}
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mb-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">My Skills</h2>
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

        {/* Portfolios */}
        <div className="pb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">My Cover Portfolio</h2>
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
                    setFilteredSongs(songs);
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
                    onFocus={() => setShowSongDropdown(true)}
                    placeholder="搜尋歌曲..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#eca382] focus:border-transparent text-black"
                  />
                  {showSongDropdown && filteredSongs.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredSongs.map((song) => (
                        <button
                          key={song.song_id}
                          type="button"
                          onClick={() => handleSelectSong(song)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors text-black"
                        >
                          {song.displayName}
                        </button>
                      ))}
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
                      setFilteredSongs(songs);
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
