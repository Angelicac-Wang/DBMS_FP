'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function ApplyProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [targets, setTargets] = useState<any[]>([]);
  const [selectedTarget, setSelectedTarget] = useState('');
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // 只在客户端访问 localStorage
    const id = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
    setUserId(id);
    
    if (!id) {
      router.push('/auth');
      return;
    }
  }, [router]);

  useEffect(() => {
    if (!projectId) return;

    const fetchProjectData = async () => {
      try {
        const projectResponse = await fetch(`/api/projects/${projectId}`);
        if (projectResponse.ok) {
          const projectData = await projectResponse.json();
          setProject(projectData);
          
          // 獲取空缺位置（所有用戶都看到相同的空缺位置列表）
          const missingPositions = projectData.missing_positions || [];
          setTargets(missingPositions.map((pos: any) => ({
            target_seq: pos.target_seq,
            idol_id: pos.idol_id,
            kpop_idols: pos.idol_name ? { stage_name: pos.idol_name } : null,
          })));
        }
      } catch (err) {
        console.error('Error:', err);
      }
    };

    fetchProjectData();
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !selectedTarget) return;

    try {
      setLoading(true);
      setError('');

      const targetSeq = parseInt(selectedTarget);

      const response = await fetch(`/api/projects/${projectId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicant_id: userId,
          target_seq: targetSeq,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || '申請失敗');
        return;
      }

      alert('申請成功！專案發起人將會審核您的申請。');
      router.push('/profile/projects');
    } catch (err: any) {
      setError('申請失敗：' + (err.message || '未知錯誤'));
    } finally {
      setLoading(false);
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-[#fff6ec] pb-20">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <p className="text-gray-600">載入中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff6ec] pb-20">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#eca382]">申請加入專案</h1>
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-800"
          >
            ← 返回
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-4">
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

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">選擇申請位置</h2>
          
          {targets.length === 0 ? (
            <p className="text-gray-500">目前沒有空缺位置</p>
          ) : (
            <div className="space-y-3 mb-6">
              {targets.map((target) => (
                <label
                  key={target.target_seq}
                  className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-[#fff2e6]"
                >
                  <input
                    type="radio"
                    name="target"
                    value={target.target_seq}
                    checked={selectedTarget === target.target_seq.toString()}
                    onChange={(e) => setSelectedTarget(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <span className="font-medium text-black">位置 {target.target_seq}</span>
                    {target.kpop_idols?.stage_name && (
                      <span className="text-gray-600 ml-2">
                        ({target.kpop_idols.stage_name})
                      </span>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading || targets.length === 0 || !selectedTarget}
              className="flex-1 bg-[#eca382] text-white py-3 rounded-lg font-medium hover:bg-[#e08f6f] disabled:opacity-50"
            >
              {loading ? '申請中...' : '提交申請'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}

