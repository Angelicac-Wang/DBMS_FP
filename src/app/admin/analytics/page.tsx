// Admin 行为分析页面
'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { getBehaviorStats, queryEvents } from '@/lib/behavior-analytics';
import type { BehaviorStats, EventType } from '@/types/behavior';

interface AnalyticsData {
  stats: BehaviorStats | null;
  recentEvents: any[];
  topEventTypes: { event_type: string; count: number }[];
  sessions: any[];
  loading: boolean;
}

export default function AnalyticsPage() {
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    stats: null,
    recentEvents: [],
    topEventTypes: [],
    sessions: [],
    loading: true,
  });
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [selectedEventType, setSelectedEventType] = useState<EventType | 'all'>('all');

  useEffect(() => {
    if (isAdmin) {
      fetchAnalytics();
    }
  }, [isAdmin, dateRange, selectedEventType]);

  const fetchAnalytics = async () => {
    try {
      setAnalytics((prev) => ({ ...prev, loading: true }));

      // 直接使用 API 获取所有统计数据
      const analyticsResponse = await fetch(
        `/api/admin/analytics?start_date=${dateRange.start}&end_date=${dateRange.end}`
      );
      
      if (!analyticsResponse.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const analyticsData = await analyticsResponse.json();

      // 构建 stats 对象
      const stats = {
        total_events: analyticsData.total_events || 0,
        unique_users: analyticsData.unique_users || 0,
        unique_sessions: analyticsData.unique_sessions || 0,
        events_by_type: analyticsData.events_by_type || {},
        events_by_date: analyticsData.events_by_date || [],
      };

      // 获取最近的事件（如果事件类型筛选不是全部）
      let recentEvents = analyticsData.recentEvents || [];
      if (selectedEventType !== 'all') {
        recentEvents = recentEvents.filter(
          (event: any) => event.event_type === selectedEventType
        );
      }

      setAnalytics({
        stats: stats,
        recentEvents: recentEvents,
        topEventTypes: analyticsData.topEventTypes || [],
        sessions: analyticsData.sessions || [],
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalytics((prev) => ({ ...prev, loading: false }));
    }
  };

  const getEventTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      page_view: '頁面瀏覽',
      click: '點擊',
      search: '搜尋',
      project_view: '查看專案',
      project_apply: '申請專案',
      project_create: '創建專案',
      song_view: '查看歌曲',
      group_view: '查看團體',
      profile_view: '查看個人資料',
      video_play: '播放視頻',
      video_pause: '暫停視頻',
      video_complete: '視頻完成',
      form_submit: '提交表單',
      form_abandon: '放棄表單',
      login: '登入',
      logout: '登出',
      signup: '註冊',
      error: '錯誤',
      custom: '自定義',
    };
    return labels[type] || type;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-TW');
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '進行中';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}小時${minutes}分鐘`;
    }
    return `${minutes}分鐘`;
  };

  if (authLoading || !isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">行為分析</h1>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 whitespace-nowrap">開始日期：</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="border border-gray-300 rounded px-3 py-2 text-black"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 whitespace-nowrap">結束日期：</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="border border-gray-300 rounded px-3 py-2 text-black"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 whitespace-nowrap">事件類型：</label>
            <select
              value={selectedEventType}
              onChange={(e) => setSelectedEventType(e.target.value as EventType | 'all')}
              className="border border-gray-300 rounded px-3 py-2 text-black"
            >
              <option value="all">全部</option>
              <option value="page_view">頁面瀏覽</option>
              <option value="click">點擊</option>
              <option value="search">搜尋</option>
              <option value="project_view">查看專案</option>
              <option value="project_apply">申請專案</option>
              <option value="project_create">創建專案</option>
              <option value="song_view">查看歌曲</option>
              <option value="group_view">查看團體</option>
              <option value="profile_view">查看個人資料</option>
              <option value="login">登入</option>
              <option value="logout">登出</option>
              <option value="signup">註冊</option>
            </select>
          </div>
        </div>
      </div>

      {analytics.loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#eca382]"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      ) : (
        <>
          {/* 總覽統計 */}
          {analytics.stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">總事件數</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">
                      {analytics.stats.total_events}
                    </p>
                  </div>
                  <div className="bg-blue-100 rounded-full p-3">
                    <span className="text-2xl">📊</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">獨立使用者</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">
                      {analytics.stats.unique_users}
                    </p>
                  </div>
                  <div className="bg-green-100 rounded-full p-3">
                    <span className="text-2xl">👥</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">獨立會話</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">
                      {analytics.stats.unique_sessions}
                    </p>
                  </div>
                  <div className="bg-[#fff2e6] rounded-full p-3">
                    <span className="text-2xl">🔄</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">事件類型數</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">
                      {Object.keys(analytics.stats.events_by_type).length}
                    </p>
                  </div>
                  <div className="bg-orange-100 rounded-full p-3">
                    <span className="text-2xl">📈</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 事件類型分布 */}
          {analytics.topEventTypes.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">事件類型分布</h2>
              <div className="space-y-3">
                {analytics.topEventTypes.map((item, index) => {
                  const total = analytics.stats?.total_events || 1;
                  const percentage = ((item.count / total) * 100).toFixed(1);
                  return (
                    <div key={item.event_type}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-600 w-6">
                            {index + 1}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {getEventTypeLabel(item.event_type)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-600">{percentage}%</span>
                          <span className="text-sm font-bold text-gray-900">{item.count}</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#eca382] h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 每日事件趨勢 */}
          {analytics.stats && analytics.stats.events_by_date.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">每日事件趨勢</h2>
              <div className="space-y-2">
                {[...analytics.stats.events_by_date]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((item) => {
                  const maxCount = Math.max(
                    ...analytics.stats!.events_by_date.map((d) => d.count)
                  );
                  const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                  return (
                    <div key={item.date}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700">{item.date}</span>
                        <span className="text-sm font-medium text-gray-900">{item.count} 事件</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#eca382] h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 會話列表 */}
          {analytics.sessions.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">最近會話</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        會話 ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        使用者 ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        開始時間
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        持續時間
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        頁面瀏覽
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        事件數
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        設備
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analytics.sessions.slice(0, 20).map((session) => (
                      <tr key={session.session_id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                          {session.session_id.substring(0, 20)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {session.user_id || '訪客'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(session.started_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDuration(session.duration_seconds)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {session.page_views || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {session.events_count || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {session.device_type || '未知'} / {session.browser || '未知'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 最近事件 */}
          {analytics.recentEvents.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">最近事件</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        時間
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        事件類型
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        使用者
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        會話 ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        事件數據
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analytics.recentEvents.slice(0, 30).map((event) => (
                      <tr key={event.event_id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(event.event_timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium bg-[#fff2e6] text-gray-700 rounded">
                            {getEventTypeLabel(event.event_type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {event.user_id || '訪客'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                          {event.session_id?.substring(0, 15)}...
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <pre className="text-xs bg-gray-50 p-2 rounded max-w-md overflow-auto">
                            {JSON.stringify(event.event_data, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

