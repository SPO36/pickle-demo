import { Menu, Mic, Moon, Search, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DynamicHeader({
  leftIcon = <Mic size={24} />,
  rightIcons = [<Search size={24} />, <Menu size={24} />],
}) {
  const navigate = useNavigate();
  const [theme, setTheme] = useState('light');

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
        <button className="btn btn-ghost btn-circle">{leftIcon}</button>
      </div>

      {/* 중앙 로고 */}
      <div className="navbar-center">
        <button onClick={() => navigate('/')} className="text-xl btn btn-ghost">
          Pickle
        </button>
      </div>

      {/* 오른쪽 아이콘들 + 테마 토글 */}
      <div className="gap-3 navbar-end">
        {/* 🌞🌚 테마 토글 */}
        <label className="flex items-center gap-2 mx-3 cursor-pointer">
          <Sun size={20} />
          <input
            type="checkbox"
            className="toggle theme-controller"
            checked={theme === 'dark'}
            onChange={toggleTheme}
          />
          <Moon size={20} />
        </label>
        {rightIcons.map((icon, idx) => (
          <button key={idx} className="btn btn-ghost btn-circle">
            {icon}
          </button>
        ))}
      </div>
    </div>
  );
}
