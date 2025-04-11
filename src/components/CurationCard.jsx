import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function CurationCard({ subTitle, title, tagId, image, textColor, isCompact = false }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/tags/${tagId}`);
  };

  return (
    <div
      onClick={handleClick}
      className={`relative flex flex-col p-6 w-full border border-base-300 overflow-hidden ${
        isCompact ? 'h-44' : 'h-56'
      } cursor-pointer ${image ? '' : 'bg-base-100'}`}
    >
      {/* 🔹 배경 이미지 */}
      {image && (
        <>
          <img
            src={image}
            alt={title}
            className="z-0 absolute inset-0 w-full h-full object-cover"
          />
          <div className="z-0 absolute inset-0 bg-black/10 backdrop-brightness-75" />
        </>
      )}

      {/* 🔸 콘텐츠 (textColor 유무에 따라 다르게 처리) */}
      <div
        className={`relative z-10 flex flex-col flex-1 justify-between ${
          textColor ? textColor : 'text-base-content'
        }`}
      >
        <div>
          <p className="opacity-80 mb-1 text-sm">{subTitle}</p>
          <h2 className="text-xl whitespace-pre-line card-title">{title}</h2>
        </div>

        {!isCompact && (
          <div className="mt-3 card-actions">
            <button className="rounded-full btn">
              <Play size={16} />
              재생하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CurationCard;
