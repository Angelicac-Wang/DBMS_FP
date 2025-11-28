'use client';

import { useRouter } from 'next/navigation';
import { formatDate, formatTime } from '@/lib/utils';

interface PracticeSchedule {
  date: string;
  start_time: string;
  end_time: string;
}

interface ProjectCardProps {
  project: {
    p_id: number;
    porject_title: string;
    practice_location: string;
    performance_location: string;
    status: string;
    creator_id?: number;
    is_member?: boolean;
    song?: {
      title: string;
      group?: {
        group_name: string;
      };
    };
    practice_schedules?: PracticeSchedule[];
    missing_positions?: string[];
    region?: string;
  };
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const isCreator = userId && project.creator_id && project.creator_id.toString() === userId;
  const canApply = !isCreator && !project.is_member && project.missing_positions && project.missing_positions.length > 0;

  const getRegionColor = (region?: string) => {
    if (region === '雙北') return 'bg-blue-100 text-blue-700';
    if (region === '台中') return 'bg-green-100 text-green-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 h-full flex flex-col">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-bold text-white flex-1 pr-2 leading-tight">
            {project.porject_title}
          </h3>
          <div className="flex items-center gap-2">
            {project.region && (
              <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm bg-white/30 text-white border border-white/50`}>
                {project.region}
              </span>
            )}
            <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border border-white/30">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              儲存
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 space-y-4">
        {project.missing_positions && project.missing_positions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="font-semibold text-gray-800 text-sm">缺的位置</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {project.missing_positions.map((position, idx) => (
                <span key={idx} className="bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 px-3 py-1.5 rounded-full text-xs font-medium border border-pink-200">
                  {position}
                </span>
              ))}
            </div>
          </div>
        )}

        {project.practice_schedules && project.practice_schedules.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-semibold text-gray-800 text-sm">練習時間</span>
            </div>
            <div className="space-y-1.5 pl-8">
              {project.practice_schedules.slice(0, 3).map((schedule, idx) => (
                <div key={idx} className="text-gray-700 text-xs font-medium bg-gray-50 px-3 py-1.5 rounded-lg">
                  {formatDate(schedule.date)} {formatTime(schedule.start_time)}-{formatTime(schedule.end_time)}
                </div>
              ))}
              {project.practice_schedules.length > 3 && (
                <div className="text-gray-500 text-xs italic">還有 {project.practice_schedules.length - 3} 個時段...</div>
              )}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-800 text-sm">練習地點</span>
          </div>
          <div className="text-gray-700 text-sm font-medium pl-8">{project.practice_location}</div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-800 text-sm">拍攝</span>
          </div>
          <div className="text-gray-700 text-sm font-medium pl-8 line-clamp-2">{project.performance_location}</div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 pb-5 pt-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex justify-between items-center gap-3">
          <button
            onClick={() => router.push(`/project/${project.p_id}`)}
            className="text-purple-600 hover:text-purple-700 font-semibold text-sm flex items-center gap-1.5 transition-colors group"
          >
            <span className="group-hover:translate-x-0.5 transition-transform">&gt; Q</span>
            <span>詳情</span>
            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        {isCreator ? (
          <button
            onClick={() => router.push(`/project/manage/${project.p_id}`)}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
          >
            管理專案
          </button>
        ) : canApply ? (
          <button
            onClick={() => router.push(`/project/${project.p_id}/apply`)}
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg text-sm font-semibold hover:from-pink-600 hover:to-rose-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
          >
            申請加入
          </button>
        ) : null}
        </div>
      </div>
    </div>
  );
}

