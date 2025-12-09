'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';

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

export default function EditGroupPage() {
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    group_name: '',
    group_namekr: '',
    debut_date: '',
    company: '',
    group_type: '',
    member_count: '',
    logo_image: '',
    discription: '',
  });

  useEffect(() => {
    if (isAdmin && groupId) {
      fetchGroup();
    }
  }, [isAdmin, groupId]);

  const fetchGroup = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/groups/${groupId}`);
      if (!response.ok) throw new Error('Failed to fetch group');

      const data = await response.json();
      
      // 格式化日期為 YYYY-MM-DD 格式（HTML date input 需要的格式）
      let formattedDate = '';
      if (data.debut_date) {
        const date = new Date(data.debut_date);
        if (!isNaN(date.getTime())) {
          // 使用本地時區的日期，避免時區轉換問題
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          formattedDate = `${year}-${month}-${day}`;
        } else {
          // 如果無法解析，嘗試直接使用（可能是已經是 YYYY-MM-DD 格式）
          formattedDate = data.debut_date.split('T')[0]; // 移除時間部分
        }
      }
      
      setFormData({
        group_name: data.group_name,
        group_namekr: data.group_namekr || '',
        debut_date: formattedDate,
        company: data.company,
        group_type: data.group_type,
        member_count: data.member_count.toString(),
        logo_image: data.logo_image || '',
        discription: data.discription || '',
      });
    } catch (err: any) {
      setError('載入失敗：' + (err.message || '未知錯誤'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/groups/${groupId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          group_name: formData.group_name,
          group_namekr: formData.group_namekr || null,
          debut_date: formData.debut_date,
          company: formData.company,
          group_type: formData.group_type,
          member_count: parseInt(formData.member_count),
          logo_image: formData.logo_image || null,
          discription: formData.discription || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '更新失敗');
      }

      alert('團體已成功更新');
      router.push(`/admin/groups/${groupId}`);
    } catch (err: any) {
      setError('更新失敗：' + (err.message || '未知錯誤'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('確定要刪除此團體嗎？此操作無法復原。')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/groups/${groupId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || '刪除失敗');
        return;
      }

      alert('團體已成功刪除');
      router.push('/admin/groups');
    } catch (err: any) {
      alert('刪除失敗：' + (err.message || '未知錯誤'));
    }
  };

  if (authLoading || !isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#eca382]"></div>
        <p className="mt-4 text-gray-600">載入中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">編輯團體</h1>
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-800"
        >
          ← 返回
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              團體名稱（英文） *
            </label>
            <input
              type="text"
              value={formData.group_name}
              onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
              maxLength={20}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#eca382] text-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              團體名稱（韓文）
            </label>
            <input
              type="text"
              value={formData.group_namekr}
              onChange={(e) => setFormData({ ...formData, group_namekr: e.target.value })}
              maxLength={20}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#eca382] text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              出道日期 *
            </label>
            <input
              type="date"
              value={formData.debut_date}
              onChange={(e) => setFormData({ ...formData, debut_date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#eca382] text-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              經紀公司 *
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              maxLength={20}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#eca382] text-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              團體類型 *
            </label>
            <select
              value={formData.group_type}
              onChange={(e) => setFormData({ ...formData, group_type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#eca382] text-black"
              required
            >
              <option value="">請選擇</option>
              <option value="B">男團</option>
              <option value="G">女團</option>
              <option value="M">混團</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              成員人數 *
            </label>
            <input
              type="number"
              value={formData.member_count}
              onChange={(e) => setFormData({ ...formData, member_count: e.target.value })}
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#eca382] text-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo 圖片 URL
            </label>
            <input
              type="url"
              value={formData.logo_image}
              onChange={(e) => setFormData({ ...formData, logo_image: e.target.value })}
              maxLength={100}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#eca382] text-black"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            描述
          </label>
          <textarea
            value={formData.discription}
            onChange={(e) => setFormData({ ...formData, discription: e.target.value })}
            maxLength={500}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#eca382] text-black"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700"
          >
            刪除團體
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-[#eca382] text-white py-3 rounded-lg font-medium hover:bg-[#e08f6f] disabled:opacity-50"
          >
            {saving ? '儲存中...' : '儲存變更'}
          </button>
        </div>
      </form>
    </div>
  );
}

