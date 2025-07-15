import { ArrowLeft, Menu, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

const THEME_KEY = 'siteTheme';

export default function DynamicHeader({ leftIcon, rightIcons, centerText }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'dark');
  const [showTooltip, setShowTooltip] = useState(false);

  // 홈 페이지에서 사용할 로고 아이콘
  const homeLogoIcon = {
    icon: (
      <img
        src={theme === 'dark' ? '/logo_new_dark.png' : '/logo_new_light.png'}
        alt="Pickle Logo"
        className="h-5 object-contain"
      />
    ),
    onClick: () => navigate('/'),
  };

  const defaultLeftIcon = {
    icon: <ArrowLeft size={24} />,
    onClick: () => {
      // if (window.history.length > 2) navigate(-1);
      // else
      navigate('/');
    },
  };

  // 홈 페이지에서는 로고를, 다른 페이지에서는 기본 아이콘을 사용
  const resolvedLeftIcon = isHome ? leftIcon ?? homeLogoIcon : leftIcon ?? defaultLeftIcon;

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // 툴팁 자동 등장 효과
  useEffect(() => {
    if (isHome) {
      const timer = setTimeout(() => {
        setShowTooltip(true);
      }, 2000); // 2초 후 등장

      return () => clearTimeout(timer);
    }
  }, [isHome]);

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
    {
      icon: <Search size={24} />,
      onClick: () => navigate('/search'),
    },
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
      <div className="z-10 flex justify-center items-center h-full cursor-pointer">
        <button onClick={resolvedLeftIcon.onClick}>{resolvedLeftIcon.icon}</button>
      </div>

      {/* 중앙 텍스트 (정중앙 고정) */}
      {!isHome && centerText && (
        <div className="left-1/2 z-0 absolute -translate-x-1/2 pointer-events-none transform">
          <span className="font-semibold text-lg whitespace-nowrap">
            {centerText.replace(/\\n/g, ' ')}
          </span>
        </div>
      )}

      {isHome && (
        <div className="relative flex flex-1 justify-center items-center mx-4">
          {/* 마이크 버튼 (헤더 중앙) */}
          <button
            onClick={() => navigate('/voiceSearch')}
            className="flex justify-center items-center btn-md btn btn-circle btn-ghost"
          >
            <img
              src="/icn_voice_search.png"
              alt="Voice Search"
              className="w-10 h-10 object-contain"
            />
          </button>

          {/* 자연스럽게 등장하는 툴팁 */}
          <div
            className={`absolute flex flex-col items-center transition-all duration-500 ease-out ${
              showTooltip ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
            }`}
            style={{
              top: '100%',
              marginTop: '8px',
            }}
          >
            <div
              className="w-3 h-1"
              style={{
                background: 'linear-gradient(45deg, #D77AF3 0%, #758CFF 100%)',
                clipPath: 'polygon(50% 0%, 0 100%, 100% 100%)',
                marginBottom: '-1px',
              }}
            />
            <div
              className="shadow-md px-4 py-2 rounded-full font-medium text-md text-white"
              style={{
                background: 'linear-gradient(90deg, #D77AF3 0%, #758CFF 100%)',
              }}
            >
              {t('placeholders.voice_search') || '음성 검색'}
            </div>
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
