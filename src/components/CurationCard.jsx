import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function CurationCard({
  subTitle,
  title,
  tagId,
  to,
  image,
  textColor,
  aspectRatio,
  isCompact = false,
  badgeImage,
}) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (to) {
      navigate(to);
    } else if (tagId) {
      navigate(`/tags/${tagId}`);
    }
  };

  const handlePlayClick = (e) => {
    e.stopPropagation(); // 카드 클릭 막기
    navigate('/episode'); // 임시로 고정된 재생 페이지로 이동
  };

  return (
    <div
      onClick={handleCardClick}
      className={`relative rounded-lg flex flex-col p-6 w-full border border-base-300 overflow-hidden ${
        aspectRatio ? '' : isCompact ? 'h-56' : 'h-60'
      } cursor-pointer ${image ? '' : 'bg-base-100'} ${
        aspectRatio === '4/5' ? 'aspect-[4/5]' : aspectRatio === '16/9' ? 'aspect-[16/9]' : ''
      }`}
    >
      {image && (
        <>
          <img
            src={image}
            alt={title}
            className="z-0 absolute inset-0 w-full h-full object-cover"
          />
          <div className="z-0 absolute inset-0 bg-black/5 backdrop-brightness-75" />
        </>
      )}

      <div
        className={`relative z-10 flex flex-col flex-1 justify-between ${
          textColor ?? 'text-base-content'
        }`}
      >
        <div className="z-20">
          <p className="opacity-80 mb-1 text-sm">{subTitle}</p>
          <h2 className="text-xl whitespace-pre-line card-title">{title.replace(/\\n/g, '\n')}</h2>
        </div>

        {!isCompact && (
          <div className="z-20 mt-3 card-actions">
            <button onClick={handlePlayClick} className="rounded-full btn">
              <Play size={16} />
              재생하기
            </button>
          </div>
        )}

        {badgeImage && (
          <img src={badgeImage} alt="badge" className="right-0 bottom-0 absolute w-28 h-28" />
        )}
      </div>
    </div>
  );
}

export default CurationCard;
