'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// import { supabase } from '@/lib/supabase'; // 已改用本地 PostgreSQL API

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Song {
  song_id: number;
  title: string;
  displayName: string;
}

interface GroupIdol {
  idol_id: number;
  stage_name: string;
}

export default function CreateProjectModal({ isOpen, onClose, onSuccess }: CreateProjectModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [songSearchQuery, setSongSearchQuery] = useState('');
  const [showSongDropdown, setShowSongDropdown] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    song_id: '',
    song_display: '',
    porject_title: '',
    practice_location: '',
    description: '',
  });

  const [practiceSchedules, setPracticeSchedules] = useState<Array<{
    date: string;
    start_time: string;
    end_time: string;
  }>>([]);

  const [groupIdols, setGroupIdols] = useState<GroupIdol[]>([]);
  const [selectedIdols, setSelectedIdols] = useState<Set<number>>(new Set());
  const [dancerCount, setDancerCount] = useState<string>('0');
  const [practiceLocationTags, setPracticeLocationTags] = useState<string[]>([]);
  const [practiceLocationInput, setPracticeLocationInput] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem('userId');
    if (!id) {
      router.push('/auth');
      return;
    }
    setUserId(id);
    fetchSongs();
    fetchPracticeLocationTags();
  }, [router]);

  useEffect(() => {
    if (formData.song_id) {
      fetchGroupIdols(formData.song_id);
    } else {
      setGroupIdols([]);
      setSelectedIdols(new Set());
    }
  }, [formData.song_id]);

  const fetchPracticeLocationTags = async () => {
    try {
      const response = await fetch('/api/projects/locations');
      if (response.ok) {
        const data = await response.json();
        setPracticeLocationTags(data);
      }
    } catch (err) {
      console.error('Error fetching practice location tags:', err);
    }
  };

  const handlePracticeLocationChange = (value: string) => {
    setPracticeLocationInput(value);
    setShowLocationDropdown(true);
    setFormData({ ...formData, practice_location: value });
  };

  const handleSelectLocationTag = (tag: string) => {
    setFormData({ ...formData, practice_location: tag });
    setPracticeLocationInput(tag);
    setShowLocationDropdown(false);
  };

  const handleAddNewLocation = () => {
    if (practiceLocationInput.trim() && !practiceLocationTags.includes(practiceLocationInput.trim())) {
      setPracticeLocationTags([...practiceLocationTags, practiceLocationInput.trim()].sort());
    }
    setShowLocationDropdown(false);
  };

  const fetchSongs = async () => {
    try {
      const response = await fetch('/api/songs');
      if (response.ok) {
        const data = await response.json();
        setSongs(data);
        setFilteredSongs(data);
      }
    } catch (err) {
      console.error('Error fetching songs:', err);
    }
  };

  const fetchGroupIdols = async (songId: string) => {
    try {
      const response = await fetch(`/api/songs/${songId}/idols`);
      if (response.ok) {
        const data = await response.json();
        setGroupIdols(data);
      } else {
        setGroupIdols([]);
      }
    } catch (err) {
      console.error('Error fetching group idols:', err);
      setGroupIdols([]);
    }
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

  const handleSelectSong = (song: Song) => {
    setFormData({
      ...formData,
      song_id: song.song_id.toString(),
      song_display: song.displayName,
    });
    setSongSearchQuery(song.displayName);
    setShowSongDropdown(false);
  };

  const toggleIdolSelection = (idolId: number) => {
    const newSelected = new Set(selectedIdols);
    if (newSelected.has(idolId)) {
      newSelected.delete(idolId);
    } else {
      newSelected.add(idolId);
    }
    setSelectedIdols(newSelected);
  };

  const addPracticeSchedule = () => {
    setPracticeSchedules([...practiceSchedules, { date: '', start_time: '', end_time: '' }]);
  };

  const removePracticeSchedule = (index: number) => {
    setPracticeSchedules(practiceSchedules.filter((_, i) => i !== index));
  };

  const updatePracticeSchedule = (index: number, field: string, value: string) => {
    const updated = [...practiceSchedules];
    updated[index] = { ...updated[index], [field]: value || '' };
    setPracticeSchedules(updated);
  };

  const generateHourOptions = () => {
    return Array.from({ length: 24 }, (_, i) => {
      const hour = i.toString().padStart(2, '0');
      return { value: hour, label: `${hour}時` };
    });
  };

  const generateMinuteOptions = () => {
    return [0, 15, 30, 45].map(min => {
      const minute = min.toString().padStart(2, '0');
      return { value: minute, label: `${minute}分` };
    });
  };

  const combineTime = (hour: string, minute: string) => {
    if (hour && minute) return `${hour}:${minute}`;
    if (hour && !minute) return `${hour}:`;
    if (!hour && minute) return `:${minute}`;
    return '';
  };

  const parseTime = (timeString: string) => {
    if (!timeString || timeString === '') return { hour: '', minute: '' };
    if (timeString.endsWith(':') && !timeString.includes(':', 3)) {
      const hour = timeString.replace(':', '');
      return { hour: hour || '', minute: '' };
    }
    if (timeString.startsWith(':') && timeString.length === 3) {
      const minute = timeString.replace(':', '');
      return { hour: '', minute: minute || '' };
    }
    const [hour, minute] = timeString.split(':');
    return { hour: hour || '', minute: minute || '' };
  };

  const updateTime = (index: number, timeType: 'start_time' | 'end_time', part: 'hour' | 'minute', value: string) => {
    const schedule = practiceSchedules[index];
    const currentTime = schedule[timeType] || '';
    const { hour, minute } = parseTime(currentTime);
    
    const newHour = part === 'hour' ? value : hour;
    const newMinute = part === 'minute' ? value : minute;
    const newTime = combineTime(newHour, newMinute);
    
    updatePracticeSchedule(index, timeType, newTime);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      setLoading(true);
      setError('');

      // 驗證翻跳歌曲是否已選擇
      if (!formData.song_id || formData.song_id.trim() === '') {
        setError('請選擇翻跳歌曲');
        setLoading(false);
        return;
      }

      const validSchedules = practiceSchedules.filter(
        (s) => s.date && s.start_time && s.end_time
      );
      if (validSchedules.length === 0) {
        setError('請至少新增一個練習時間');
        setLoading(false);
        return;
      }

      // 計算總招募人數：選中的 idols 數量 + 伴舞數量
      const selectedIdolsCount = selectedIdols.size;
      const dancerCountNum = parseInt(dancerCount) || 0;
      const totalTargetCount = selectedIdolsCount + dancerCountNum;

      if (totalTargetCount === 0) {
        setError('請至少選擇一個招募位置或伴舞');
        setLoading(false);
        return;
      }

      // 準備創建專案的資料
      const projectData = {
        creator_id: userId,
        song_id: parseInt(formData.song_id),
        porject_title: formData.porject_title,
        target_cnt: totalTargetCount,
        practice_location: formData.practice_location,
        description: formData.description || null,
        schedules: validSchedules,
        targets: [] as Array<{ idol_id: number | null }>,
      };

      // 添加選中的 idols
      groupIdols.forEach((idol) => {
        if (selectedIdols.has(idol.idol_id)) {
          projectData.targets.push({ idol_id: idol.idol_id });
        }
      });

      // 添加伴舞
      if (dancerCountNum > 0) {
        for (let i = 0; i < dancerCountNum; i++) {
          projectData.targets.push({ idol_id: null });
        }
      }

      // 調用 API 創建專案
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '建立失敗');
      }

      const result = await response.json();
      const newProjectId = result.project_id;

      // 重置表單
      setFormData({
        song_id: '',
        song_display: '',
        porject_title: '',
        practice_location: '',
        description: '',
      });
      setPracticeSchedules([]);
      setGroupIdols([]);
      setSelectedIdols(new Set());
      setDancerCount('0');
      setSongSearchQuery('');
      setFilteredSongs(songs);
      setShowSongDropdown(false);
      setPracticeLocationInput('');
      setShowLocationDropdown(false);

      onSuccess();
      onClose();
      router.push(`/project/manage/${newProjectId}`);
    } catch (err: any) {
      setError('建立失敗：' + (err.message || '未知錯誤'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      song_id: '',
      song_display: '',
      porject_title: '',
      practice_location: '',
      description: '',
    });
    setPracticeSchedules([]);
    setGroupIdols([]);
    setSelectedIdols(new Set());
    setDancerCount('0');
      setSongSearchQuery('');
      setFilteredSongs(songs);
      setShowSongDropdown(false);
      setPracticeLocationInput('');
      setShowLocationDropdown(false);
      setError('');
      onClose();
  };

  if (!isOpen) return null;

  const totalTargetCount = selectedIdols.size + (parseInt(dancerCount) || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">建立翻跳專案</h2>
            <button
              onClick={handleClose}
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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 基本資訊 */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4">基本資訊</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">專案標題 *</label>
                  <input
                    type="text"
                    value={formData.porject_title}
                    onChange={(e) => setFormData({ ...formData, porject_title: e.target.value })}
                    maxLength={50}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#eca382] text-black"
                    required
                  />
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">翻跳歌曲 *</label>
                  <input
                    type="text"
                    value={songSearchQuery}
                    onChange={(e) => handleSongSearch(e.target.value)}
                    onFocus={() => setShowSongDropdown(true)}
                    placeholder="搜尋歌曲..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#eca382] focus:border-transparent text-black"
                    required
                  />
                  {showSongDropdown && filteredSongs.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredSongs.map((song) => (
                        <button
                          key={song.song_id}
                          type="button"
                          onClick={() => handleSelectSong(song)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                        >
                          {song.displayName}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">練習地點 *</label>
                  <input
                    type="text"
                    value={practiceLocationInput}
                    onChange={(e) => handlePracticeLocationChange(e.target.value)}
                    onFocus={() => setShowLocationDropdown(true)}
                    placeholder="選擇或輸入練習地點..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#eca382] text-black"
                    required
                  />
                  {showLocationDropdown && practiceLocationTags.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {practiceLocationTags
                        .filter(tag => tag.toLowerCase().includes(practiceLocationInput.toLowerCase()))
                        .map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleSelectLocationTag(tag)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                          >
                            {tag}
                          </button>
                        ))}
                      {practiceLocationInput.trim() && 
                       !practiceLocationTags.some(tag => tag.toLowerCase() === practiceLocationInput.toLowerCase()) && (
                        <button
                          type="button"
                          onClick={handleAddNewLocation}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors text-[#eca382] font-semibold"
                        >
                          + 新增「{practiceLocationInput}」
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">專案描述</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    maxLength={500}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#eca382] text-black"
                  />
                </div>
              </div>
            </div>

            {/* 練習時間 */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">練習時間</h3>
                <button
                  type="button"
                  onClick={addPracticeSchedule}
                  className="px-3 py-1 bg-[#eca382] text-white rounded text-sm hover:bg-[#e08f6f]"
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
                          value={schedule.date || ''}
                          onChange={(e) => updatePracticeSchedule(index, 'date', e.target.value || '')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                          required
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">開始時間</label>
                        <div className="flex gap-2">
                          <select
                            value={parseTime(schedule.start_time).hour}
                            onChange={(e) => updateTime(index, 'start_time', 'hour', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-black"
                            required
                          >
                            <option value="">時</option>
                            {generateHourOptions().map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                          <select
                            value={parseTime(schedule.start_time).minute}
                            onChange={(e) => updateTime(index, 'start_time', 'minute', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-black"
                            required
                          >
                            <option value="">分</option>
                            {generateMinuteOptions().map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">結束時間</label>
                        <div className="flex gap-2">
                          <select
                            value={parseTime(schedule.end_time).hour}
                            onChange={(e) => updateTime(index, 'end_time', 'hour', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-black"
                            required
                          >
                            <option value="">時</option>
                            {generateHourOptions().map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                          <select
                            value={parseTime(schedule.end_time).minute}
                            onChange={(e) => updateTime(index, 'end_time', 'minute', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-black"
                            required
                          >
                            <option value="">分</option>
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

            {/* 招募位置 */}
            {formData.song_id && groupIdols.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4">招募位置</h3>
                <p className="text-sm text-gray-600 mb-4">請勾選要招募的角色</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {groupIdols.map((idol) => (
                    <label
                      key={idol.idol_id}
                      className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIdols.has(idol.idol_id)}
                        onChange={() => toggleIdolSelection(idol.idol_id)}
                        className="h-4 w-4 accent-[#eca382]"
                      />
                      <span className="text-sm font-medium text-gray-800">{idol.stage_name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* 伴舞需求 */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4">伴舞需求</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">伴舞數量</label>
                <input
                  type="number"
                  value={dancerCount}
                  onChange={(e) => setDancerCount(e.target.value)}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#eca382] text-black"
                />
              </div>
              <p className="mt-2 text-sm text-gray-600">
                總招募人數：<span className="font-semibold text-[#eca382]">{totalTargetCount}</span> 人
                {selectedIdols.size > 0 && (
                  <span className="ml-2">（角色 {selectedIdols.size} 人{parseInt(dancerCount) > 0 ? ` + 伴舞 ${parseInt(dancerCount)} 人` : ''}）</span>
                )}
              </p>
            </div>

            {/* 提交按鈕 */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#eca382] text-white py-3 rounded-lg font-medium hover:bg-[#e08f6f] disabled:opacity-50"
              >
                {loading ? '建立中...' : '建立專案'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
