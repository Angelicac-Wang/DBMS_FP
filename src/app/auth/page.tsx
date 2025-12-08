'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: loginData.name,
          password: loginData.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || '登入失敗，請稍後再試');
        setLoading(false);
        return;
      }

      // 儲存到 localStorage
      localStorage.setItem('userId', result.u_id.toString());
      localStorage.setItem('userRole', result.role);
      
      // 根據角色導向不同頁面
      if (result.role === 'A') {
        router.push('/admin');
      } else {
        router.push('/');
      }
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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || '註冊失敗，請稍後再試');
        setLoading(false);
        return;
      }

      // 儲存到 localStorage
      localStorage.setItem('userId', result.u_id.toString());
      localStorage.setItem('userRole', result.role || 'U');
      router.push('/');
    } catch (err) {
      setError('註冊失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-white">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#eaa583' }}>舞告Match</h1>
          <p className="text-gray-700 font-medium">K-pop 舞蹈翻跳媒合平台</p>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              isLogin
                ? 'text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            style={isLogin ? { backgroundColor: 'rgb(250,215,185)' } : {}}
          >
            登入
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              !isLogin
                ? 'text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            style={!isLogin ? { backgroundColor: 'rgb(250,215,185)' } : {}}
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
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                用戶名稱
              </label>
              <input
                type="text"
                value={loginData.name}
                onChange={(e) => setLoginData({ ...loginData, name: e.target.value })}
                required
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent placeholder:text-gray-600 placeholder:font-medium text-black"
                placeholder="請輸入用戶名稱"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                密碼
              </label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent placeholder:text-gray-600 placeholder:font-medium text-black"
                placeholder="請輸入密碼"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'rgb(250,215,185)' }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = 'rgb(240,205,175)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgb(250,215,185)')}
            >
              {loading ? '登入中...' : '登入'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                用戶名稱 *
              </label>
              <input
                type="text"
                value={registerData.name}
                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                required
                maxLength={15}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent placeholder:text-gray-600 placeholder:font-medium text-black"
                placeholder="請輸入用戶名稱（最多15字）"
              />
              <p className="mt-1 text-xs text-gray-600 font-medium">用戶ID將由系統自動生成</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                required
                maxLength={30}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent placeholder:text-gray-600 placeholder:font-medium text-black"
                placeholder="請輸入Email"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                密碼 *
              </label>
              <input
                type="password"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                required
                maxLength={15}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent placeholder:text-gray-600 placeholder:font-medium text-black"
                placeholder="請輸入密碼（最多15字）"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                生日 *
              </label>
              <input
                type="date"
                value={registerData.birthdate}
                onChange={(e) => setRegisterData({ ...registerData, birthdate: e.target.value })}
                required
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                性別 *
              </label>
              <select
                value={registerData.gender}
                onChange={(e) => setRegisterData({ ...registerData, gender: e.target.value })}
                required
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-black"
              >
                <option value="" className="text-gray-600">請選擇性別</option>
                <option value="B">男</option>
                <option value="G">女</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                地區 *
              </label>
              <input
                type="text"
                value={registerData.region}
                onChange={(e) => setRegisterData({ ...registerData, region: e.target.value })}
                required
                maxLength={20}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent placeholder:text-gray-600 placeholder:font-medium text-black"
                placeholder="請輸入地區（如：雙北、台中）"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                電話 *
              </label>
              <input
                type="tel"
                value={registerData.phone}
                onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                required
                maxLength={10}
                pattern="[0-9]{10}"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent placeholder:text-gray-600 placeholder:font-medium text-black"
                placeholder="請輸入10位數電話號碼"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'rgb(250,215,185)' }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = 'rgb(240,205,175)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgb(250,215,185)')}
            >
              {loading ? '註冊中...' : '註冊'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

