'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function UploadProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    video_url: '',
    title: '',
    discription: '',
    team_members: [] as string[],
  });

  useEffect(() => {
    const id = localStorage.getItem('userId');
    if (!id) {
      router.push('/auth');
      return;
    }
    setUserId(id);
    if (projectId) {
      fetchProjectData(projectId, id);
    }
  }, [projectId, router]);

  const fetchProjectData = async (id: string, creatorId: string) => {
    try {
      const response = await fetch(`/api/projects/${id}`);
      if (!response.ok) throw new Error('Failed to fetch project');
      
      const projectData = await response.json();

      if (projectData.creator_id?.toString() !== creatorId) {
        setError('您不是此專案的創建者');
        return;
      }

      if (projectData.status !== 'F') {
        setError('只有已完成的專案才能上傳作品');
        return;
      }

      setProject(projectData);

      // 獲取專案成員（從 filled_positions 中提取）
      const membersData = (projectData.filled_positions || []).map((pos: any) => ({
        member_id: pos.member_id,
        users: { name: pos.member_name },
      }));

      setMembers(membersData);
    } catch (err: any) {
      setError('載入失敗：' + (err.message || '未知錯誤'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !projectId) return;

    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/projects/${projectId}/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_url: formData.video_url,
          title: formData.title,
          discription: formData.discription || null,
          team_members: formData.team_members,
          creator_id: userId,
          song_id: project.song_id || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || '上傳失敗');
        return;
      }

      alert('作品上傳成功！');
      router.push(`/project/${projectId}`);
    } catch (err: any) {
      setError('上傳失敗：' + (err.message || '未知錯誤'));
    } finally {
      setLoading(false);
    }
  };

  const toggleTeamMember = (memberId: string) => {
    if (formData.team_members.includes(memberId)) {
      setFormData({
        ...formData,
        team_members: formData.team_members.filter((id) => id !== memberId),
      });
    } else {
      setFormData({
        ...formData,
        team_members: [...formData.team_members, memberId],
      });
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-white pb-20">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            {error ? (
              <>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => router.back()}
                  className="px-4 py-2 bg-[#eca382] text-white rounded-lg"
                >
                  返回
                </button>
              </>
            ) : (
              <p className="text-gray-600">載入中...</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-white pb-20">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#eca382]">上傳完成作品</h1>
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-800"
          >
            ← 返回
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">{project.porject_title}</h2>
          {project.description && (
            <p className="text-gray-600 whitespace-pre-line">{project.description}</p>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              影片連結 *
            </label>
            <input
              type="url"
              value={formData.video_url}
              onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#eca382] focus:border-transparent text-black"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              作品標題 *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              maxLength={20}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#eca382] focus:border-transparent text-black"
              placeholder="請輸入作品標題"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              作品描述
            </label>
            <textarea
              value={formData.discription}
              onChange={(e) => setFormData({ ...formData, discription: e.target.value })}
              maxLength={500}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#eca382] focus:border-transparent text-black"
              placeholder="描述這個翻跳作品..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              製作團隊成員 *
            </label>
            <div className="space-y-2">
              {members.map((member) => (
                <label
                  key={member.member_id}
                  className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-orange-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.team_members.includes(member.member_id.toString())}
                    onChange={() => toggleTeamMember(member.member_id.toString())}
                    className="mr-3 w-4 h-4 text-[#eca382] focus:ring-[#eca382]"
                  />
                  <span className="text-gray-800">{(member.users as any)?.name}</span>
                </label>
              ))}
              {members.length === 0 && (
                <p className="text-gray-500 text-sm">目前沒有專案成員</p>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              選擇參與此作品製作的成員，他們的作品集中也會顯示此作品
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading || formData.team_members.length === 0}
              className="flex-1 bg-[#eca382] text-white py-3 rounded-lg font-medium hover:bg-[#e08f6f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '上傳中...' : '上傳作品'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}

