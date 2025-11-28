'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // 登入表單狀態
  const [loginData, setLoginData] = useState({
    name: '',
    password: '',
  });

  // 註冊表單狀態
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    birthdate: '',
    gender: '',
    region: '',
    phone: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 使用用戶名稱和密碼登入
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('u_id, status, password')
        .eq('name', loginData.name)
        .single();

      if (fetchError || !data) {
        setError('用戶名稱或密碼錯誤');
        setLoading(false);
        return;
      }

      if (data.status === 'N') {
        setError('帳號已被停用');
        setLoading(false);
        return;
      }

      // 驗證密碼
      if (data.password !== loginData.password) {
        setError('用戶名稱或密碼錯誤');
        setLoading(false);
        return;
      }

      // 更新最後登入時間
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('u_id', data.u_id);

      // 儲存到 localStorage
      localStorage.setItem('userId', data.u_id.toString());
      router.push('/');
    } catch (err) {
      setError('登入失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 檢查用戶名稱是否已存在
      const { data: existingName } = await supabase
        .from('users')
        .select('name')
        .eq('name', registerData.name)
        .single();

      if (existingName) {
        setError('此用戶名稱已被使用，請選擇其他名稱');
        setLoading(false);
        return;
      }

      // 檢查 email 和 phone 是否已存在
      const { data: existingUser } = await supabase
        .from('users')
        .select('email, phone')
        .or(`email.eq.${registerData.email},phone.eq.${registerData.phone}`)
        .limit(1);

      if (existingUser && existingUser.length > 0) {
        setError('Email 或電話號碼已被使用');
        setLoading(false);
        return;
      }

      // 生成唯一的 u_id（使用時間戳 + 隨機數）
      const generateUserId = () => {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        return timestamp * 10000 + random;
      };

      let newUserId = generateUserId();
      let attempts = 0;
      const maxAttempts = 10;

      // 確保生成的 ID 是唯一的
      while (attempts < maxAttempts) {
        const { data: checkId } = await supabase
          .from('users')
          .select('u_id')
          .eq('u_id', newUserId)
          .single();

        if (!checkId) {
          break; // ID 不存在，可以使用
        }
        newUserId = generateUserId();
        attempts++;
      }

      if (attempts >= maxAttempts) {
        setError('系統繁忙，請稍後再試');
        setLoading(false);
        return;
      }

      // 插入新用戶
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          u_id: newUserId,
          name: registerData.name,
          email: registerData.email,
          password: registerData.password,
          birthdate: registerData.birthdate,
          gender: registerData.gender,
          region: registerData.region,
          phone: registerData.phone,
          status: 'A',
          create_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
          role: 'U',
        })
        .select('u_id')
        .single();

      if (insertError) {
        setError('註冊失敗：' + insertError.message);
        setLoading(false);
        return;
      }

      // 儲存到 localStorage
      if (newUser) {
        localStorage.setItem('userId', newUser.u_id.toString());
      }
      router.push('/');
    } catch (err) {
      setError('註冊失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-600 mb-2">舞告Match</h1>
          <p className="text-gray-600">K-pop 舞蹈翻跳媒合平台</p>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              isLogin
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            登入
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              !isLogin
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            註冊
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {isLogin ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                用戶名稱
              </label>
              <input
                type="text"
                value={loginData.name}
                onChange={(e) => setLoginData({ ...loginData, name: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="請輸入用戶名稱"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密碼
              </label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="請輸入密碼"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '登入中...' : '登入'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                用戶名稱 *
              </label>
              <input
                type="text"
                value={registerData.name}
                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                required
                maxLength={15}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="請輸入用戶名稱（最多15字）"
              />
              <p className="mt-1 text-xs text-gray-500">用戶ID將由系統自動生成</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                required
                maxLength={30}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="請輸入Email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密碼 *
              </label>
              <input
                type="password"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                required
                maxLength={15}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="請輸入密碼（最多15字）"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                生日 *
              </label>
              <input
                type="date"
                value={registerData.birthdate}
                onChange={(e) => setRegisterData({ ...registerData, birthdate: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                性別 *
              </label>
              <select
                value={registerData.gender}
                onChange={(e) => setRegisterData({ ...registerData, gender: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">請選擇性別</option>
                <option value="B">男</option>
                <option value="G">女</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                地區 *
              </label>
              <input
                type="text"
                value={registerData.region}
                onChange={(e) => setRegisterData({ ...registerData, region: e.target.value })}
                required
                maxLength={20}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="請輸入地區（如：雙北、台中）"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                電話 *
              </label>
              <input
                type="tel"
                value={registerData.phone}
                onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                required
                maxLength={10}
                pattern="[0-9]{10}"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="請輸入10位數電話號碼"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '註冊中...' : '註冊'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

