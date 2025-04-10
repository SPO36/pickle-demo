import { Menu, Mic, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DynamicHeader({
  leftIcon = <Mic size={24} />,
  rightIcons = [<Search size={24} />, <Menu size={24} />],
}) {
  const navigate = useNavigate();

  return (
    <div className="px-6 w-full navbar">
      {/* 왼쪽 아이콘 */}
      <div className="navbar-start">
        <button className="btn btn-ghost btn-circle">{leftIcon}</button>
      </div>

      {/* 중앙 Pickle 로고 */}
      <div className="navbar-center">
        <button onClick={() => navigate('/')} className="text-xl btn btn-ghost">
          Pickle
        </button>
      </div>

      {/* 오른쪽 아이콘들 */}
      <div className="gap-2 navbar-end">
        {rightIcons.map((icon, idx) => (
          <button key={idx} className="btn btn-ghost btn-circle">
            {icon}
          </button>
        ))}
      </div>
    </div>
  );
}
