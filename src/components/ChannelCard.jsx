import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function ChannelCard({ src, title, creator, liked, onToggleLike }) {
  const navigate = useNavigate();
  const handlePlayClick = (e) => {
    e.stopPropagation(); // 카드 클릭 막기
    // navigate('/episode');
    showToast('채널 에피소드 페이지로 이동 예정입니다');
  };

  function showToast(message = 'test') {
    const toast = document.createElement('div');
    toast.className =
      'toast toast-top toast-end z-50 fixed top-4 right-4 transition-opacity duration-300';
    toast.innerHTML = `
      <div class="shadow-lg text-white alert alert-error">
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('opacity-0');
      setTimeout(() => toast.remove(), 500);
    }, 2000);
  }

  return (
    <div className="w-full cursor-pointer" onClick={handlePlayClick}>
      <div className="bg-base-100 h-full">
        <figure className="relative bg-base-100">
          <button
            onClick={(e) => {
              e.stopPropagation(); // 페이지 이동 막기
              onToggleLike();
            }}
            className={`w-10 h-10 flex aspect-square items-center justify-center absolute bottom-2 right-2 rounded-full ${liked ? 'bg-base-200 text-rose-500' : 'bg-base-200'
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

        <div className="gap-4 py-2">
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
