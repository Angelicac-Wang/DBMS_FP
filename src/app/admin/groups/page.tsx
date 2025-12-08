'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import Link from 'next/link';

interface Group {
  group_id: number;
  group_name: string;
  group_namekr?: string;
  debut_date: string;
  company: string;
  group_type: string;
  member_count: number;
  logo_image?: string;
  discription?: string;
}

export default function GroupsPage() {
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCompany, setFilterCompany] = useState('');

  useEffect(() => {
    if (isAdmin) {
      fetchGroups();
    }
  }, [isAdmin]);

  const fetchGroups = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/admin/groups');
      if (!response.ok) throw new Error('Failed to fetch groups');

      let data = await response.json();

      // 前端篩選（因為 API 暫時沒有篩選功能）
      if (searchQuery) {
        data = data.filter((g: Group) =>
          g.group_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (g.group_namekr && g.group_namekr.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }

      if (filterType) {
        data = data.filter((g: Group) => g.group_type === filterType);
      }

      if (filterCompany) {
        data = data.filter((g: Group) =>
          g.company.toLowerCase().includes(filterCompany.toLowerCase())
        );
      }

      setGroups(data);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchGroups();
    }
  }, [searchQuery, filterType, filterCompany, isAdmin]);

  const handleDelete = async (groupId: number, groupName: string) => {
    if (!confirm(`確定要刪除團體「${groupName}」嗎？此操作無法復原。`)) {
      return;
    }

    try {
      // TODO: 需要創建 DELETE API
      alert('刪除功能暫時不可用，請聯繫管理員');
      // const response = await fetch(`/api/admin/groups/${groupId}`, {
      //   method: 'DELETE',
      // });
      // if (!response.ok) throw new Error('Failed to delete group');
      // alert('團體已成功刪除');
      // fetchGroups();
    } catch (error: any) {
      alert('刪除失敗：' + (error.message || '未知錯誤'));
    }
  };

  const getGroupTypeText = (type: string) => {
    switch (type) {
      case 'B':
        return '男團';
      case 'G':
        return '女團';
      case 'M':
        return '混團';
      default:
        return type;
    }
  };

  if (authLoading || !isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">團體管理</h1>
        <Link
          href="/admin/groups/create"
          className="bg-[#eca382] text-white px-4 py-2 rounded-lg hover:bg-[#e08f6f] transition-colors"
        >
          + 新增團體
        </Link>
      </div>

      {/* 搜尋和篩選 */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">搜尋團體名稱</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="輸入團體名稱..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#eca382] text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">團體類型</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#eca382] text-black"
            >
              <option value="">全部</option>
              <option value="B">男團</option>
              <option value="G">女團</option>
              <option value="M">混團</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">經紀公司</label>
            <input
              type="text"
              value={filterCompany}
              onChange={(e) => setFilterCompany(e.target.value)}
              placeholder="輸入經紀公司..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#eca382] text-black"
            />
          </div>
        </div>
      </div>

      {/* 團體列表 */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#eca382]"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600">沒有找到團體</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  團體名稱
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  類型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  經紀公司
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  成員數
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  出道日期
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {groups.map((group) => (
                <tr key={group.group_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{group.group_name}</div>
                    {group.group_namekr && (
                      <div className="text-sm text-gray-500">{group.group_namekr}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-[#fff2e6] text-gray-700">
                      {getGroupTypeText(group.group_type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {group.company}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {group.member_count} 人
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(group.debut_date).toLocaleDateString('zh-TW')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Link
                      href={`/admin/groups/${group.group_id}`}
                      className="text-[#eca382] hover:text-[#e08f6f]"
                    >
                      查看
                    </Link>
                    <Link
                      href={`/admin/groups/${group.group_id}/edit`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      編輯
                    </Link>
                    <button
                      onClick={() => handleDelete(group.group_id, group.group_name)}
                      className="text-red-600 hover:text-red-900"
                    >
                      刪除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

