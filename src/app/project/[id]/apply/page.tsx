'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import BottomNav from '@/components/BottomNav';

export default function ApplyProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [targets, setTargets] = useState<any[]>([]);
  const [selectedTarget, setSelectedTarget] = useState('');
  const [error, setError] = useState('');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!userId) {
      router.push('/auth');
      return;
    }
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId, router, userId]);

  const fetchProjectData = async () => {
    try {
      const { data: projectData } = await supabase
        .from('project')
        .select('*')
        .eq('p_id', projectId)
        .single();

      if (projectData) setProject(projectData);

      const { data: targetsData } = await supabase
        .from('project_target')
        .select(`
          target_seq,
          idol_id,
          status,
          kpop_idols(stage_name)
        `)
        .eq('project_id', projectId)
        .eq('status', 'I'); // 只顯示空缺位置

      if (targetsData) {
        setTargets(targetsData);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !selectedTarget) return;

    try {
      setLoading(true);
      setError('');

      // 生成申請ID
      const generateAppliId = () => {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        return timestamp * 10000 + random;
      };

      const appliId = generateAppliId();
      const targetSeq = parseInt(selectedTarget);

      // 檢查是否已經申請過
      const { data: existing } = await supabase
        .from('project_applications')
        .select('appli_id')
        .eq('p_id', projectId)
        .eq('applicant_id', userId)
        .eq('target_seq', targetSeq)
        .single();

      if (existing) {
        setError('您已經申請過此位置');
        return;
      }

      // 創建申請
      const { error: insertError } = await supabase
        .from('project_applications')
        .insert({
          appli_id: appliId,
          p_id: projectId,
          target_seq: targetSeq,
          applicant_id: userId,
          applied_time: new Date().toISOString(),
          status: 'W', // 等待審核
        });

      if (insertError) throw insertError;

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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white pb-20">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <p className="text-gray-600">載入中...</p>
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
          <h1 className="text-3xl font-bold text-purple-600">申請加入專案</h1>
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-800"
          >
            ← 返回
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-4">
          <h2 className="text-xl font-bold text-gray-800 mb-2">{project.porject_title}</h2>
          {project.discription && (
            <p className="text-gray-600">{project.discription}</p>
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
                  className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-purple-50"
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
                    <span className="font-medium">位置 {target.target_seq}</span>
                    {target.kpop_idols && (
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
              className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? '申請中...' : '提交申請'}
            </button>
          </div>
        </form>
      </div>

      <BottomNav />
    </div>
  );
}

