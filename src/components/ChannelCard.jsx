import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function ChannelCard({ src, title, creator, liked, onToggleLike }) {
  const navigate = useNavigate();
  const handlePlayClick = (e) => {
    e.stopPropagation(); // 카드 클릭 막기
    navigate('/episode'); // 임시로 고정된 재생 페이지로 이동
  };

  return (
    <div className="w-full cursor-pointer" onClick={handlePlayClick}>
      <div className="bg-base-100 shadow-sm border border-base-300 h-full card">
        <figure className="bg-base-100 px-10 pt-10">
          <img src={src} alt={title} className="rounded-xl w-full h-full object-cover" />
        </figure>
        <div className="items-center gap-4 text-center card-body">
          <div className="w-full">
            <h2 className="font-semibold text-lg text-center truncate">{title}</h2>
            <p className="text-gray-500 text-sm text-center truncate">{creator}</p>
          </div>
          <button
            onClick={onToggleLike}
            className={`btn rounded-full ${liked ? 'bg-base-200 text-rose-500' : 'bg-base-200'}`}
          >
            <Heart
              size={16}
              className={`transition-transform duration-300 ${liked ? 'scale-125' : 'scale-100'}`}
              fill={liked ? '#F43F5E' : 'none'}
              stroke={liked ? '#F43F5E' : 'currentColor'}
            />
            좋아요
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChannelCard;
