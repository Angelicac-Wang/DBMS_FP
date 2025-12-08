'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [showMenu, setShowMenu] = useState(false);
  const [displayName, setDisplayName] = useState('舞者');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
      fetchUserName(storedUserId);
    }
  }, []);

  const fetchUserName = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.name) {
          setDisplayName(data.name);
          // 同时保存到 localStorage 以便下次快速使用
          localStorage.setItem('userName', data.name);
        }
      }
    } catch (error) {
      console.error('Error fetching user name:', error);
      // 如果 API 失败，尝试从 localStorage 获取
      const storedName = localStorage.getItem('userName') || localStorage.getItem('userEmail');
      if (storedName) setDisplayName(storedName);
    }
  };

  // 點擊外部關閉選單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  const avatarText = useMemo(() => displayName.charAt(0).toUpperCase(), [displayName]);
  // 临时替换 angelica 的头像（不存数据库）
  const isAngelica = displayName.toLowerCase() === 'angelica' || userId === '17643916039294400';
  const angelicaAvatarUrl = '/profile.jpg';

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    setShowMenu(false);
    router.push('/auth');
  };

  // 如果是管理員頁面或登入頁面，不顯示 header
  if (pathname?.startsWith('/admin') || pathname === '/auth') {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between py-3 px-2 mx-auto" style={{ maxWidth: 'var(--container-7xl)' }}>
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-r from-orange-400 to-pink-500 text-lg font-bold text-white shadow-lg">
              舞
            </div>
            <div className="leading-tight">
              <p className="text-lg font-bold text-[#7a2d81]">舞告Match</p>
              <p className="text-sm text-gray-600">K-POP Cover Match</p>
            </div>
          </button>
          <div className="flex items-center gap-5">
          <button
            onClick={() => router.push('/projects')}
            className="text-sm font-semibold text-gray-800 hover:text-[#eca382] transition-colors"
          >
            瀏覽專案
          </button>
          <button
            onClick={() => {
              if (pathname === '/projects') {
                // 如果在 projects 頁面，觸發 modal
                const event = new CustomEvent('openCreateProjectModal');
                window.dispatchEvent(event);
              } else {
                // 否則跳轉到 projects 頁面並觸發 modal
                router.push('/projects?openCreateModal=true');
              }
            }}
            className="rounded-full bg-[#f0b89a] px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-[#eca382] transition-colors"
          >
            新增專案
          </button>
          <div className="relative user-menu-container">
            <button
              onClick={() => setShowMenu((prev) => !prev)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-amber-200 text-sm font-bold text-[#7a2d81] overflow-hidden"
              aria-label="user menu"
            >
              {isAngelica ? (
                <img
                  src={angelicaAvatarUrl}
                  alt={displayName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // 如果图片加载失败，回退到首字母显示
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.textContent = avatarText;
                    }
                  }}
                />
              ) : (
                avatarText
              )}
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-3 w-44 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-gray-100 z-50">
                <p className="px-3 py-2 text-xs font-semibold text-gray-500">Hi, {displayName}</p>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    router.push('/profile');
                  }}
                  className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-gray-800 hover:bg-amber-50"
                >
                  個人檔案
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    router.push('/profile/projects');
                  }}
                  className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-gray-800 hover:bg-amber-50"
                >
                  我的專案
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    router.push('/profile/projects_appling');
                  }}
                  className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-gray-800 hover:bg-amber-50"
                >
                  申請中的專案
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  登出
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      </header>
      {pathname === '/' && (
        <div className="bg-[#fff6ec] pt-6"></div>
      )}
    </>
  );
}
