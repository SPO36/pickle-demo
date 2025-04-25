import { ArrowLeft, Heart, Menu, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const THEME_KEY = 'siteTheme';

export default function DynamicHeader({ leftIcon, rightIcons, centerText }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'dark');

  const defaultLeftIcon = {
    icon: <ArrowLeft size={24} />,
    onClick: () => {
      if (window.history.length > 2) navigate(-1);
      else navigate('/');
    },
  };
  const resolvedLeftIcon = leftIcon ?? defaultLeftIcon;

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const themeToggleIcon = {
    icon: (
      <label className="w-10 h-10 swap swap-rotate">
        <input
          type="checkbox"
          className="theme-controller"
          checked={theme === 'dark'}
          onChange={toggleTheme}
        />
        <svg className="fill-yellow-400 w-6 h-6 swap-off" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="5" />
          <g>
            <circle cx="12" cy="2" r="1.5" />
            <circle cx="12" cy="22" r="1.5" />
            <circle cx="2" cy="12" r="1.5" />
            <circle cx="22" cy="12" r="1.5" />
            <circle cx="4.5" cy="4.5" r="1.5" />
            <circle cx="19.5" cy="4.5" r="1.5" />
            <circle cx="4.5" cy="19.5" r="1.5" />
            <circle cx="19.5" cy="19.5" r="1.5" />
          </g>
        </svg>
        <svg className="fill-blue-400 w-6 h-6 swap-on" viewBox="0 0 24 24">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </label>
    ),
    onClick: null,
  };

  const defaultRightIcons = [
    // 하트 아이콘은 /likes가 아닐 때만 보여줌
    ...(location.pathname !== '/likes'
      ? [
          {
            icon: <Heart size={24} />,
            onClick: () => navigate('/likes'),
          },
        ]
      : []),
    // 메인페이지 아니면 검색 아이콘 포함
    ...(!isHome
      ? [
          {
            icon: <Search size={24} />,
            onClick: () => navigate('/search'),
          },
        ]
      : []),
    {
      icon: (
        <label htmlFor="menu-drawer" className="cursor-pointer btn btn-ghost btn-circle">
          <Menu size={24} />
        </label>
      ),
      onClick: null,
    },
  ];

  const icons = [themeToggleIcon, ...(rightIcons ?? defaultRightIcons)];

  return (
    <div className="relative flex items-center px-4 py-2 w-full">
      {/* 왼쪽 아이콘 */}
      <div className="z-10 flex-none">
        <button className="btn btn-ghost btn-circle" onClick={resolvedLeftIcon.onClick}>
          {resolvedLeftIcon.icon}
        </button>
      </div>

      {/* 중앙 텍스트 (정중앙 고정) */}
      {!isHome && centerText && (
        <div className="left-1/2 z-0 absolute -translate-x-1/2 pointer-events-none transform">
          <span className="font-semibold text-lg whitespace-nowrap">
            {centerText.replace(/\\n/g, ' ')}
          </span>
        </div>
      )}

      {/* 홈일 경우 검색창 */}
      {isHome && (
        <div className="flex-1 mx-4">
          <div className="relative mx-auto w-full max-w-xl">
            <input
              type="text"
              placeholder="경제 관련 팟캐스트 찾아줘"
              className="pr-10 rounded-lg w-full input input-md"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const keyword = e.target.value.trim();
                  if (keyword) navigate(`/search?query=${encodeURIComponent(keyword)}`);
                }
              }}
            />
            <button
              className="top-1/2 right-3 absolute text-gray-400 -translate-y-1/2"
              onClick={() => {
                const input = document.querySelector('input[type="text"]');
                if (input?.value.trim()) {
                  navigate(`/search?query=${encodeURIComponent(input.value.trim())}`);
                }
              }}
            >
              <Search size={18} />
            </button>
          </div>
        </div>
      )}

      {/* 오른쪽 아이콘 */}
      <div className="z-10 flex flex-none gap-2 ml-auto">
        {icons.map(({ icon, onClick }, idx) => (
          <button
            key={idx}
            className={`btn btn-ghost btn-circle ${!onClick ? 'cursor-default' : ''}`}
            onClick={onClick}
          >
            {icon}
          </button>
        ))}
      </div>
    </div>
  );
}
