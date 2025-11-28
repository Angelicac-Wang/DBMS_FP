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
  }>>([]);

  const [targetPositions, setTargetPositions] = useState<Array<{
    target_seq: number;
    idol_id: string;
  }>>([]);

  const [idols, setIdols] = useState<Array<{ idol_id: number; stage_name: string; group_name: string }>>([]);
  const [songIdols, setSongIdols] = useState<Array<{ idol_id: number; stage_name: string; group_name: string }>>([]);
  const [selectedPosition, setSelectedPosition] = useState<string>(''); // 用戶選擇自己要跳的位置
  const [dancerCount, setDancerCount] = useState<string>('0'); // 伴舞數量

  useEffect(() => {
    const id = localStorage.getItem('userId');
    if (!id) {
      router.push('/auth');
      return;
    }
    setUserId(id);
    fetchSongs();
  }, [router]);

  // 當選取歌曲時，獲取團體成員數和該歌曲的偶像列表
  useEffect(() => {
    if (formData.song_id) {
      fetchSongGroupInfo(formData.song_id);
      fetchSongIdols(formData.song_id);
    } else {
      setSongIdols([]);
      setSelectedPosition('');
      setTargetPositions([]);
    }
  }, [formData.song_id]);

  // 當用戶選擇自己要跳的位置時，自動生成要徵的位置列表
  useEffect(() => {
    if (selectedPosition && songIdols.length > 0) {
      // 過濾掉用戶選擇的位置，剩下的就是要徵的位置
      // 使用原始索引作為 target_seq，確保不重複
      const positions = songIdols
        .map((idol, originalIndex) => ({
          originalIndex: originalIndex + 1, // 原始位置編號（從1開始）
          idol: idol,
        }))
        .filter(item => item.idol.idol_id.toString() !== selectedPosition)
        .map(item => ({
          target_seq: item.originalIndex, // 使用原始位置編號
          idol_id: item.idol.idol_id.toString(),
        }));
      
      setTargetPositions(positions);
    } else {
      setTargetPositions([]);
    }
  }, [selectedPosition, songIdols]);

  const fetchSongs = async () => {
    const { data } = await supabase
      .from('kpop_songs')
      .select('song_id, title, difficulty_level')
      .order('title');
    if (data) setSongs(data);
  };

  // 獲取歌曲對應的團體資訊和成員數
  const fetchSongGroupInfo = async (songId: string) => {
    try {
      // 獲取歌曲對應的團體
      const { data: songGroups } = await supabase
        .from('song_group')
        .select('group_id')
        .eq('song_id', parseInt(songId))
        .limit(1);

      if (songGroups && songGroups.length > 0) {
        // 獲取團體的成員數
        const { data: group } = await supabase
          .from('kpop_groups')
          .select('member_count')
          .eq('group_id', songGroups[0].group_id)
          .single();

        if (group) {
          // 自動設定目標人數為團體成員數
          setFormData(prev => ({ ...prev, target_cnt: group.member_count.toString() }));
        }
      }
    } catch (err) {
      console.error('Error fetching group info:', err);
    }
  };

  // 獲取歌曲對應的所有偶像
  const fetchSongIdols = async (songId: string) => {
    try {
      // 獲取歌曲對應的偶像
      const { data: songIdolsData } = await supabase
        .from('song_idol')
        .select('idol_id')
        .eq('song_id', parseInt(songId));

      if (songIdolsData && songIdolsData.length > 0) {
        const idolIds = songIdolsData.map(item => item.idol_id);
        
        // 獲取這些偶像的詳細資訊
        const { data: idolsData } = await supabase
          .from('kpop_idols')
          .select(`
            idol_id,
            stage_name,
            kpop_groups!inner(group_name)
          `)
          .in('idol_id', idolIds);

        if (idolsData) {
          const formattedIdols = idolsData.map((item: any) => ({
            idol_id: item.idol_id,
            stage_name: item.stage_name,
            group_name: item.kpop_groups?.group_name || '',
          }));
          setSongIdols(formattedIdols);
        }
      } else {
        setSongIdols([]);
      }
    } catch (err) {
      console.error('Error fetching song idols:', err);
      setSongIdols([]);
    }
  };

  const addPracticeSchedule = () => {
    // 確保新增的時間欄位都是空字串，避免瀏覽器顯示預設值
    setPracticeSchedules([...practiceSchedules, { 
      date: '', 
      start_time: '', 
      end_time: '' 
    }]);
  };

  const removePracticeSchedule = (index: number) => {
    setPracticeSchedules(practiceSchedules.filter((_, i) => i !== index));
  };

  const updatePracticeSchedule = (index: number, field: string, value: string) => {
    const updated = [...practiceSchedules];
    // 確保時間值為空字串而不是 undefined 或 null
    updated[index] = { 
      ...updated[index], 
      [field]: value === null || value === undefined ? '' : value 
    };
    setPracticeSchedules(updated);
  };

  // 生成小時選項（0-23）
  const generateHourOptions = () => {
    return Array.from({ length: 24 }, (_, i) => {
      const hour = i.toString().padStart(2, '0');
      return { value: hour, label: `${hour}時` };
    });
  };

  // 生成分鐘選項（0, 15, 30, 45）
  const generateMinuteOptions = () => {
    return [0, 15, 30, 45].map(min => {
      const minute = min.toString().padStart(2, '0');
      return { value: minute, label: `${minute}分` };
    });
  };

  // 組合小時和分鐘為時間字串（允許部分值）
  const combineTime = (hour: string, minute: string) => {
    // 如果兩個值都存在，組合為 HH:MM
    if (hour && minute) {
      return `${hour}:${minute}`;
    }
    // 如果只有小時，保存為 HH:（用於顯示已選擇的小時）
    if (hour && !minute) {
      return `${hour}:`;
    }
    // 如果只有分鐘，需要小時才能組合（這種情況不應該發生，但為了安全）
    if (!hour && minute) {
      return `:${minute}`;
    }
    // 兩個都沒有，返回空字串
    return '';
  };

  // 解析時間字串為小時和分鐘（處理部分值）
  const parseTime = (timeString: string) => {
    if (!timeString || timeString === '') {
      return { hour: '', minute: '' };
    }
    // 處理 HH: 格式（只有小時）
    if (timeString.endsWith(':') && !timeString.includes(':', 3)) {
      const hour = timeString.replace(':', '');
      return { hour: hour || '', minute: '' };
    }
    // 處理 :MM 格式（只有分鐘，不應該發生）
    if (timeString.startsWith(':') && timeString.length === 3) {
      const minute = timeString.replace(':', '');
      return { hour: '', minute: minute || '' };
    }
    // 正常格式 HH:MM
    const [hour, minute] = timeString.split(':');
    return { 
      hour: hour || '', 
      minute: minute || '' 
    };
  };

  // 更新時間（小時或分鐘）
  const updateTime = (index: number, timeType: 'start_time' | 'end_time', part: 'hour' | 'minute', value: string) => {
    const schedule = practiceSchedules[index];
    const currentTime = schedule[timeType] || '';
    const { hour, minute } = parseTime(currentTime);
    
    const newHour = part === 'hour' ? value : hour;
    const newMinute = part === 'minute' ? value : minute;
    const newTime = combineTime(newHour, newMinute);
    
    updatePracticeSchedule(index, timeType, newTime);
  };

  // 處理用戶選擇自己要跳的位置
  const handleSelectPosition = (idolId: string) => {
    setSelectedPosition(idolId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      setLoading(true);
      setError('');

      // 驗證：如果選了歌曲，必須選擇自己要跳的位置
      if (formData.song_id && !selectedPosition) {
        setError('請選擇你要跳的位置');
        setLoading(false);
        return;
      }

      // 驗證：至少需要一個練習時間
      const validSchedules = practiceSchedules.filter(
        (s) => s.date && s.start_time && s.end_time
      );
      if (validSchedules.length === 0) {
        setError('請至少新增一個練習時間');
        setLoading(false);
        return;
      }

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
      const schedules = validSchedules.map((s) => ({
        p_id: newProjectId,
        date: s.date,
        start_time: s.start_time,
        end_time: s.end_time,
      }));

      if (schedules.length > 0) {
        const { error: scheduleError } = await supabase.from('practice_schedule').insert(schedules);
        if (scheduleError) throw scheduleError;
      }

      // 創建所有目標位置（包括用戶選擇的、要徵的、和伴舞）
      const allTargets: Array<{
        target_seq: number;
        project_id: number;
        idol_id: number | null;
        status: 'F' | 'I';
      }> = [];

      // 添加要徵的位置（空缺）
      const targets = targetPositions
        .filter((t) => t.idol_id)
        .map((t) => ({
          target_seq: t.target_seq,
          project_id: newProjectId,
          idol_id: parseInt(t.idol_id),
          status: 'I' as const, // 空缺
        }));
      allTargets.push(...targets);

      // 如果用戶選擇了自己要跳的位置，添加為已填滿的位置
      let userPositionSeq: number | null = null;
      if (selectedPosition) {
        // 找到用戶選擇的位置在原始列表中的索引
        const selectedIndex = songIdols.findIndex(
          idol => idol.idol_id.toString() === selectedPosition
        );
        
        if (selectedIndex !== -1) {
          // 用戶選擇的位置編號（從1開始）
          userPositionSeq = selectedIndex + 1;

          // 檢查是否已經存在（理論上不應該，但為了安全）
          const exists = allTargets.some(t => t.target_seq === userPositionSeq);
          if (!exists) {
            allTargets.push({
              target_seq: userPositionSeq,
              project_id: newProjectId,
              idol_id: parseInt(selectedPosition),
              status: 'F', // 已填滿
            });
          }
        }
      }

      // 添加伴舞位置（idol_id 為 NULL）
      const dancerCountNum = parseInt(dancerCount) || 0;
      if (dancerCountNum > 0) {
        // 找出最大的 target_seq，伴舞從下一個開始編號
        // 需要考慮所有已添加的位置（包括偶像位置）
        const existingSeqs = allTargets.map(t => t.target_seq);
        const maxIdolSeq = songIdols.length; // 偶像的最大編號
        const maxTargetSeq = existingSeqs.length > 0 
          ? Math.max(...existingSeqs, maxIdolSeq)
          : maxIdolSeq;
        
        // 為每個伴舞創建一個位置
        for (let i = 1; i <= dancerCountNum; i++) {
          allTargets.push({
            target_seq: maxTargetSeq + i,
            project_id: newProjectId,
            idol_id: null, // 伴舞的 idol_id 為 NULL
            status: 'I', // 空缺
          });
        }
      }

      // 先一次性插入所有目標位置（必須在插入 project_members 之前）
      if (allTargets.length > 0) {
        const { error: targetError } = await supabase.from('project_target').insert(allTargets);
        if (targetError) throw targetError;
      }

      // 如果用戶選擇了自己要跳的位置，將創建者加入專案成員（在 project_target 插入之後）
      if (selectedPosition && userPositionSeq !== null) {
        const { error: memberError } = await supabase.from('project_members').insert({
          p_id: newProjectId,
          member_id: userId,
          join_date: new Date().toISOString().split('T')[0],
          target_seq: userPositionSeq,
          status: 'Y',
        });

        if (memberError) throw memberError;
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  目標人數 * 
                  {formData.song_id && (
                    <span className="text-xs text-gray-500 ml-2">
                      (已根據團體成員數自動填入)
                    </span>
                  )}
                </label>
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
            {practiceSchedules.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                點擊「+ 新增時間」來新增練習時間
              </p>
            ) : (
              <div className="space-y-3">
                {practiceSchedules.map((schedule, index) => (
                  <div key={index} className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
                      <input
                        type="date"
                        key={`date-${index}-${schedule.date || 'empty'}`}
                        value={schedule.date || ''}
                        onChange={(e) => updatePracticeSchedule(index, 'date', e.target.value || '')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        autoComplete="off"
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">開始時間 (24小時制)</label>
                      <div className="flex gap-2">
                        <select
                          value={parseTime(schedule.start_time).hour}
                          onChange={(e) => updateTime(index, 'start_time', 'hour', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                          required
                        >
                          <option value="">請選擇</option>
                          {generateHourOptions().map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        <select
                          value={parseTime(schedule.start_time).minute}
                          onChange={(e) => updateTime(index, 'start_time', 'minute', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                          required
                        >
                          <option value="">請選擇</option>
                          {generateMinuteOptions().map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">結束時間 (24小時制)</label>
                      <div className="flex gap-2">
                        <select
                          value={parseTime(schedule.end_time).hour}
                          onChange={(e) => updateTime(index, 'end_time', 'hour', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                          required
                        >
                          <option value="">請選擇</option>
                          {generateHourOptions().map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        <select
                          value={parseTime(schedule.end_time).minute}
                          onChange={(e) => updateTime(index, 'end_time', 'minute', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                          required
                        >
                          <option value="">請選擇</option>
                          {generateMinuteOptions().map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePracticeSchedule(index)}
                      className="px-3 py-2 text-red-500 hover:text-red-700 whitespace-nowrap"
                    >
                      刪除
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 選擇自己要跳的位置 */}
          {formData.song_id && songIdols.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">選擇你要跳的位置 *</h2>
              <p className="text-sm text-gray-600 mb-4">
                請選擇你要跳的位置，剩下的位置將會自動成為要徵的位置
              </p>
              <select
                value={selectedPosition}
                onChange={(e) => handleSelectPosition(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required={formData.song_id ? true : false}
              >
                <option value="">請選擇位置</option>
                {songIdols.map((idol) => (
                  <option key={idol.idol_id} value={idol.idol_id}>
                    {idol.stage_name} ({idol.group_name})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 要徵的位置（自動生成） */}
          {targetPositions.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">要徵的位置</h2>
              <p className="text-sm text-gray-600 mb-4">
                以下位置將開放招募（已排除你選擇的位置）
              </p>
              <div className="space-y-3">
                {targetPositions.map((position, index) => {
                  const idol = songIdols.find(i => i.idol_id.toString() === position.idol_id);
                  return (
                    <div key={index} className="flex gap-3 items-center p-3 bg-purple-50 rounded-lg">
                      <div className="w-20">
                        <span className="text-sm font-medium text-gray-700">位置 {position.target_seq}</span>
                      </div>
                      <div className="flex-1">
                        <span className="text-gray-800 font-medium">
                          {idol ? `${idol.stage_name} (${idol.group_name})` : '未知'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 伴舞數量 */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">伴舞需求</h2>
            <p className="text-sm text-gray-600 mb-4">
              請輸入需要招募的伴舞人數（idol_id 為 NULL 的伴舞）
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">伴舞數量 *</label>
              <input
                type="number"
                value={dancerCount}
                onChange={(e) => setDancerCount(e.target.value)}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              />
              <p className="mt-2 text-xs text-gray-500">
                伴舞將在偶像位置之後自動編號
              </p>
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

