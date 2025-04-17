import { ArrowLeft, Menu, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const THEME_KEY = 'siteTheme';

export default function DynamicHeader({ leftIcon, rightIcons, centerText }) {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(THEME_KEY) || 'light';
  });

  // 왼쪽 아이콘: 기본값은 뒤로가기 or 홈 이동
  const defaultLeftIcon = {
    icon: <ArrowLeft size={24} />,
    onClick: () => {
      if (window.history.length > 2) {
        navigate(-1);
      } else {
        navigate('/');
      }
    },
  };
  const resolvedLeftIcon = leftIcon ?? defaultLeftIcon;

  // 테마 토글
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem(THEME_KEY, newTheme); // 저장
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // 항상 포함될 테마 버튼
  const themeToggleIcon = {
    icon: (
      <label className="w-10 h-10 swap swap-rotate">
        <input
          type="checkbox"
          className="theme-controller"
          checked={theme === 'dark'}
          onChange={toggleTheme}
          value="synthwave"
        />
        {/* ☀️ Sun icon */}
        <svg
          className="fill-yellow-400 w-6 h-6 swap-off"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
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
        {/* 🌙 Moon icon */}
        <svg
          className="fill-blue-400 w-6 h-6 swap-on"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </label>
    ),
    onClick: null,
  };

  // 오른쪽 아이콘: theme 버튼 + 전달된 아이콘
  const icons = [
    themeToggleIcon,
    ...(rightIcons ?? [
      {
        icon: <Search size={24} />,
        onClick: () => navigate('/search'),
      },
      {
        // ✅ 메뉴 버튼을 drawer toggle로 교체
        icon: (
          <label htmlFor="menu-drawer" className="cursor-pointer btn btn-ghost btn-circle">
            <Menu size={24} />
          </label>
        ),
        onClick: null, // label이 toggle 역할
      },
    ]),
  ];

  return (
    <div className="px-6 max-w-screen-xl navbar">
      {/* 왼쪽 아이콘 */}
      <div className="navbar-start">
        <button className="btn btn-ghost btn-circle" onClick={resolvedLeftIcon.onClick}>
          {resolvedLeftIcon.icon}
        </button>
      </div>

      {/* 중앙 로고 */}
      <div className="navbar-center">
        {centerText ? (
          <span className="font-semibold text-lg">{centerText?.replace(/\\n/g, ' ')}</span>
        ) : (
          // <button onClick={() => navigate('/')} className="text-xl btn btn-ghost">
          //   Pickle
          // </button>
          <></>
        )}
      </div>

      {/* 오른쪽 아이콘들 */}
      <div className="flex-nowrap gap-3 navbar-end">
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
