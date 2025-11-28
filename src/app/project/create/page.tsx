'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import BottomNav from '@/components/BottomNav';

interface Song {
  song_id: number;
  title: string;
  difficulty_level: number;
}

export default function CreateProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    song_id: '',
    porject_title: '',
    target_cnt: '',
    practice_location: '',
    performance_location: '',
    discription: '',
  });

  const [practiceSchedules, setPracticeSchedules] = useState<Array<{
    date: string;
    start_time: string;
    end_time: string;
  }>>([{ date: '', start_time: '', end_time: '' }]);

  const [targetPositions, setTargetPositions] = useState<Array<{
    target_seq: number;
    idol_id: string;
  }>>([{ target_seq: 1, idol_id: '' }]);

  const [idols, setIdols] = useState<Array<{ idol_id: number; stage_name: string; group_name: string }>>([]);

  useEffect(() => {
    const id = localStorage.getItem('userId');
    if (!id) {
      router.push('/auth');
      return;
    }
    setUserId(id);
    fetchSongs();
    fetchIdols();
  }, [router]);

  const fetchSongs = async () => {
    const { data } = await supabase
      .from('kpop_songs')
      .select('song_id, title, difficulty_level')
      .order('title');
    if (data) setSongs(data);
  };

  const fetchIdols = async () => {
    const { data } = await supabase
      .from('kpop_idols')
      .select(`
        idol_id,
        stage_name,
        kpop_groups!inner(group_name)
      `)
      .limit(500);

    if (data) {
      const idolsData = data.map((item: any) => ({
        idol_id: item.idol_id,
        stage_name: item.stage_name,
        group_name: item.kpop_groups?.group_name || '',
      }));
      setIdols(idolsData);
    }
  };

  const addPracticeSchedule = () => {
    setPracticeSchedules([...practiceSchedules, { date: '', start_time: '', end_time: '' }]);
  };

  const removePracticeSchedule = (index: number) => {
    setPracticeSchedules(practiceSchedules.filter((_, i) => i !== index));
  };

  const updatePracticeSchedule = (index: number, field: string, value: string) => {
    const updated = [...practiceSchedules];
    updated[index] = { ...updated[index], [field]: value };
    setPracticeSchedules(updated);
  };

  const addTargetPosition = () => {
    setTargetPositions([
      ...targetPositions,
      { target_seq: targetPositions.length + 1, idol_id: '' },
    ]);
  };

  const removeTargetPosition = (index: number) => {
    const updated = targetPositions.filter((_, i) => i !== index).map((pos, idx) => ({
      ...pos,
      target_seq: idx + 1,
    }));
    setTargetPositions(updated);
  };

  const updateTargetPosition = (index: number, field: string, value: string) => {
    const updated = [...targetPositions];
    updated[index] = { ...updated[index], [field]: value };
    setTargetPositions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      setLoading(true);
      setError('');

      // 生成專案ID
      const generateProjectId = () => {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        return timestamp * 10000 + random;
      };

      let newProjectId = generateProjectId();
      let attempts = 0;
      while (attempts < 10) {
        const { data: checkId } = await supabase
          .from('project')
          .select('p_id')
          .eq('p_id', newProjectId)
          .single();

        if (!checkId) break;
        newProjectId = generateProjectId();
        attempts++;
      }

      if (attempts >= 10) {
        setError('系統繁忙，請稍後再試');
        return;
      }

      const now = new Date().toISOString();

      // 創建專案
      const { error: projectError } = await supabase
        .from('project')
        .insert({
          p_id: newProjectId,
          creator_id: userId,
          song_id: formData.song_id ? parseInt(formData.song_id) : null,
          porject_title: formData.porject_title,
          target_cnt: parseInt(formData.target_cnt),
          practice_location: formData.practice_location,
          performance_location: formData.performance_location,
          create_at: now,
          update_at: now,
          status: 'A', // 招募中
          discription: formData.discription || null,
        });

      if (projectError) throw projectError;

      // 創建練習時間表
      if (practiceSchedules.length > 0 && practiceSchedules[0].date) {
        const schedules = practiceSchedules
          .filter((s) => s.date && s.start_time && s.end_time)
          .map((s) => ({
            p_id: newProjectId,
            date: s.date,
            start_time: s.start_time,
            end_time: s.end_time,
          }));

        if (schedules.length > 0) {
          await supabase.from('practice_schedule').insert(schedules);
        }
      }

      // 創建目標位置
      const targets = targetPositions
        .filter((t) => t.idol_id)
        .map((t) => ({
          target_seq: t.target_seq,
          project_id: newProjectId,
          idol_id: parseInt(t.idol_id),
          status: 'I', // 空缺
        }));

      if (targets.length > 0) {
        await supabase.from('project_target').insert(targets);
      }

      router.push(`/project/manage/${newProjectId}`);
    } catch (err: any) {
      setError('建立失敗：' + (err.message || '未知錯誤'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white pb-20">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-purple-600">建立翻跳專案</h1>
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本資訊 */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">基本資訊</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">專案標題 *</label>
                <input
                  type="text"
                  value={formData.porject_title}
                  onChange={(e) => setFormData({ ...formData, porject_title: e.target.value })}
                  maxLength={50}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">翻跳歌曲（選填）</label>
                <select
                  value={formData.song_id}
                  onChange={(e) => setFormData({ ...formData, song_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">無</option>
                  {songs.map((song) => (
                    <option key={song.song_id} value={song.song_id}>
                      {song.title} (難度: {song.difficulty_level}/10)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">目標人數 *</label>
                <input
                  type="number"
                  value={formData.target_cnt}
                  onChange={(e) => setFormData({ ...formData, target_cnt: e.target.value })}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">練習地點 *</label>
                <input
                  type="text"
                  value={formData.practice_location}
                  onChange={(e) => setFormData({ ...formData, practice_location: e.target.value })}
                  maxLength={50}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">拍攝地點 *</label>
                <input
                  type="text"
                  value={formData.performance_location}
                  onChange={(e) => setFormData({ ...formData, performance_location: e.target.value })}
                  maxLength={50}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">專案描述</label>
                <textarea
                  value={formData.discription}
                  onChange={(e) => setFormData({ ...formData, discription: e.target.value })}
                  maxLength={500}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* 練習時間 */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">練習時間</h2>
              <button
                type="button"
                onClick={addPracticeSchedule}
                className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
              >
                + 新增時間
              </button>
            </div>
            <div className="space-y-3">
              {practiceSchedules.map((schedule, index) => (
                <div key={index} className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
                    <input
                      type="date"
                      value={schedule.date}
                      onChange={(e) => updatePracticeSchedule(index, 'date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">開始時間</label>
                    <input
                      type="time"
                      value={schedule.start_time}
                      onChange={(e) => updatePracticeSchedule(index, 'start_time', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">結束時間</label>
                    <input
                      type="time"
                      value={schedule.end_time}
                      onChange={(e) => updatePracticeSchedule(index, 'end_time', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  {practiceSchedules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePracticeSchedule(index)}
                      className="px-3 py-2 text-red-500 hover:text-red-700"
                    >
                      刪除
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 目標位置 */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">目標位置（選填）</h2>
              <button
                type="button"
                onClick={addTargetPosition}
                className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
              >
                + 新增位置
              </button>
            </div>
            <div className="space-y-3">
              {targetPositions.map((position, index) => (
                <div key={index} className="flex gap-3 items-end">
                  <div className="w-20">
                    <label className="block text-sm font-medium text-gray-700 mb-1">位置</label>
                    <input
                      type="text"
                      value={position.target_seq}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">偶像</label>
                    <select
                      value={position.idol_id}
                      onChange={(e) => updateTargetPosition(index, 'idol_id', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">無</option>
                      {idols.map((idol) => (
                        <option key={idol.idol_id} value={idol.idol_id}>
                          {idol.stage_name} ({idol.group_name})
                        </option>
                      ))}
                    </select>
                  </div>
                  {targetPositions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTargetPosition(index)}
                      className="px-3 py-2 text-red-500 hover:text-red-700"
                    >
                      刪除
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 提交按鈕 */}
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
              disabled={loading}
              className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? '建立中...' : '建立專案'}
            </button>
          </div>
        </form>
      </div>

      <BottomNav />
    </div>
  );
}

