'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import BottomNav from '@/components/BottomNav';

interface Portfolio {
  video_url: string;
  title: string;
  discription: string;
  cover_song_id?: number;
  created_at: string;
  view_cnt: number;
  song_title?: string;
}

export default function PortfolioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null);
  const [songs, setSongs] = useState<Array<{ song_id: number; title: string }>>([]);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    video_url: '',
    title: '',
    discription: '',
    cover_song_id: '',
  });

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      router.push('/auth');
      return;
    }
    fetchPortfolios(userId);
    fetchSongs();
  }, [router]);

  const fetchSongs = async () => {
    const { data } = await supabase
      .from('kpop_songs')
      .select('song_id, title')
      .limit(100);
    if (data) setSongs(data);
  };

  const fetchPortfolios = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('portfolios')
        .select(`
          video_url,
          title,
          discription,
          video_detail!inner(cover_song_id, created_at, view_cnt)
        `)
        .eq('u_id', userId);

      if (error) throw error;

      const portfoliosData: Portfolio[] = (data || []).map((item: any) => ({
        video_url: item.video_url,
        title: item.title,
        discription: item.discription || '',
        cover_song_id: item.video_detail?.cover_song_id,
        created_at: item.video_detail?.created_at || '',
        view_cnt: item.video_detail?.view_cnt || 0,
      }));

      // 獲取歌曲標題
      for (const portfolio of portfoliosData) {
        if (portfolio.cover_song_id) {
          const { data: song } = await supabase
            .from('kpop_songs')
            .select('title')
            .eq('song_id', portfolio.cover_song_id)
            .single();
          if (song) portfolio.song_title = song.title;
        }
      }

      setPortfolios(portfoliosData);
    } catch (err: any) {
      setError('載入失敗：' + (err.message || '未知錯誤'));
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({ video_url: '', title: '', discription: '', cover_song_id: '' });
    setEditingPortfolio(null);
    setShowAddForm(true);
  };

  const handleEdit = (portfolio: Portfolio) => {
    setFormData({
      video_url: portfolio.video_url,
      title: portfolio.title,
      discription: portfolio.discription || '',
      cover_song_id: portfolio.cover_song_id?.toString() || '',
    });
    setEditingPortfolio(portfolio);
    setShowAddForm(true);
  };

  const handleSave = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
      setError('');

      // 檢查 video_url 是否已存在於 video_detail
      const { data: existingVideo } = await supabase
        .from('video_detail')
        .select('video_url')
        .eq('video_url', formData.video_url)
        .single();

      if (!existingVideo) {
        // 創建新的 video_detail
        await supabase
          .from('video_detail')
          .insert({
            video_url: formData.video_url,
            cover_song_id: formData.cover_song_id ? parseInt(formData.cover_song_id) : null,
            created_at: new Date().toISOString(),
            view_cnt: 0,
          });
      }

      if (editingPortfolio) {
        // 更新作品集
        await supabase
          .from('portfolios')
          .update({
            title: formData.title,
            discription: formData.discription || null,
          })
          .eq('u_id', userId)
          .eq('video_url', formData.video_url);
      } else {
        // 新增作品集
        await supabase
          .from('portfolios')
          .insert({
            u_id: userId,
            video_url: formData.video_url,
            title: formData.title,
            discription: formData.discription || null,
          });
      }

      setShowAddForm(false);
      fetchPortfolios(userId);
    } catch (err: any) {
      setError('儲存失敗：' + (err.message || '未知錯誤'));
    }
  };

  const handleDelete = async (videoUrl: string) => {
    if (!confirm('確定要刪除此作品嗎？')) return;

    const userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
      await supabase
        .from('portfolios')
        .delete()
        .eq('u_id', userId)
        .eq('video_url', videoUrl);

      fetchPortfolios(userId);
    } catch (err: any) {
      setError('刪除失敗：' + (err.message || '未知錯誤'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white pb-20">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">載入中...</p>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white pb-20">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-purple-600">作品集管理</h1>
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-800"
          >
            ← 返回
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleAdd}
          className="mb-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          + 新增作品
        </button>

        {/* 新增/編輯表單 */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editingPortfolio ? '編輯作品' : '新增作品'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">影片連結 *</label>
                <input
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  disabled={!!editingPortfolio}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                />
                {editingPortfolio && (
                  <p className="mt-1 text-xs text-gray-500">影片連結無法修改</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">作品標題 *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  maxLength={20}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">翻跳歌曲（選填）</label>
                <select
                  value={formData.cover_song_id}
                  onChange={(e) => setFormData({ ...formData, cover_song_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">無</option>
                  {songs.map((song) => (
                    <option key={song.song_id} value={song.song_id}>
                      {song.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">描述</label>
                <textarea
                  value={formData.discription}
                  onChange={(e) => setFormData({ ...formData, discription: e.target.value })}
                  maxLength={500}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="作品描述..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
                >
                  儲存
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 作品列表 */}
        <div className="space-y-4">
          {portfolios.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-6 text-center text-gray-500">
              尚未新增任何作品
            </div>
          ) : (
            portfolios.map((portfolio) => (
              <div key={portfolio.video_url} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{portfolio.title}</h3>
                    {portfolio.song_title && (
                      <p className="text-sm text-purple-600 mb-2">翻跳歌曲：{portfolio.song_title}</p>
                    )}
                    {portfolio.discription && (
                      <p className="text-gray-600 mb-2">{portfolio.discription}</p>
                    )}
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>觀看次數：{portfolio.view_cnt.toLocaleString()}</span>
                      {portfolio.created_at && (
                        <span>建立時間：{new Date(portfolio.created_at).toLocaleDateString('zh-TW')}</span>
                      )}
                    </div>
                    <a
                      href={portfolio.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700 text-sm mt-2 inline-block"
                    >
                      查看影片 →
                    </a>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(portfolio)}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    >
                      編輯
                    </button>
                    <button
                      onClick={() => handleDelete(portfolio.video_url)}
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                    >
                      刪除
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

