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
      <div className="bg-base-100 shadow-sm h-full">
        <figure className="relative bg-base-100">
          <button
            onClick={(e) => {
              e.stopPropagation(); // 페이지 이동 막기
              onToggleLike();
            }}
            className={`w-10 h-10 flex aspect-square items-center justify-center absolute bottom-2 right-2 rounded-full ${
              liked ? 'bg-base-200 text-rose-500' : 'bg-base-200'
            }`}
          >
            <Heart
              size={16}
              className={`transition-transform duration-300 ${liked ? 'scale-125' : 'scale-100'}`}
              fill={liked ? '#F43F5E' : 'none'}
              stroke={liked ? '#F43F5E' : 'currentColor'}
            />
            {/* 좋아요 */}
          </button>
          <img src={src} alt={title} className="w-full h-full object-cover" />
        </figure>

        <div className="gap-4 py-3">
          <div className="w-full">
            <h2 className="font-semibold text-md truncate">{title}</h2>
            <p className="text-gray-500 text-sm truncate">{creator}</p>
          </div>
          {/* <button
            onClick={(e) => {
              e.stopPropagation(); // 페이지 이동 막기
              onToggleLike();
            }}
            className={`btn rounded-full ${liked ? 'bg-base-200 text-rose-500' : 'bg-base-200'}`}
          >
            <Heart
              size={16}
              className={`transition-transform duration-300 ${liked ? 'scale-125' : 'scale-100'}`}
              fill={liked ? '#F43F5E' : 'none'}
              stroke={liked ? '#F43F5E' : 'currentColor'}
            />
            좋아요
          </button> */}
        </div>
      </div>
    </div>
  );
}

export default ChannelCard;
