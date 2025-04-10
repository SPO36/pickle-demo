import { ArrowLeft, Menu, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DynamicHeader({ leftIcon, rightIcons }) {
  const navigate = useNavigate();
  const [theme, setTheme] = useState('light');

  // ✅ 왼쪽 아이콘: 전달 안 됐을 때 뒤로가기 기본값
  const defaultLeftIcon = {
    icon: <ArrowLeft size={24} />,
    onClick: () => navigate(-1),
  };
  const resolvedLeftIcon = leftIcon ?? defaultLeftIcon;

  // ✅ 오른쪽 아이콘: 전달 안 됐을 때 기본값
  const defaultRightIcons = [
    {
      icon: <Search size={24} />,
      onClick: () => navigate('/search'),
    },
    {
      icon: <Menu size={24} />,
      onClick: () => navigate('/menu'),
    },
  ];
  const icons = rightIcons ?? defaultRightIcons;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="px-6 w-full navbar">
      {/* 왼쪽 아이콘 */}
      <div className="navbar-start">
        {resolvedLeftIcon && (
          <button className="btn btn-ghost btn-circle" onClick={resolvedLeftIcon.onClick}>
            {resolvedLeftIcon.icon}
          </button>
        )}
      </div>

      {/* 중앙 Pickle 로고 */}
      <div className="navbar-center">
        <button onClick={() => navigate('/')} className="text-xl btn btn-ghost">
          Pickle
        </button>
      </div>

      {/* 오른쪽 아이콘들 + 테마 토글 */}
      <div className="gap-3 navbar-end">
        {/* 테마 토글 */}
        <label className="w-10 h-10 swap swap-rotate">
          <input
            type="checkbox"
            className="theme-controller"
            checked={theme === 'dark'}
            onChange={toggleTheme}
            value="synthwave"
          />
          <svg
            className="fill-current w-7 h-7 swap-off"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path d="M5.64,17l-.71.71..." />
          </svg>
          <svg
            className="fill-current w-7 h-7 swap-on"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path d="M21.64,13a1,1,0,0,0..." />
          </svg>
        </label>

        {/* 오른쪽 아이콘들 */}
        {icons.map(({ icon, onClick }, idx) => (
          <button key={idx} className="btn btn-ghost btn-circle" onClick={onClick}>
            {icon}
          </button>
        ))}
      </div>
    </div>
  );
}
