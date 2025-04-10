import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function CurationCard({ subTitle, title, tagId, isCompact = false }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/tags/${tagId}`);
  };

  return (
    <div
      onClick={handleClick}
      className={`flex flex-col bg-white p-6 border border-base-300 w-full ${
        isCompact ? 'h-44' : 'h-56'
      } cursor-pointer`}
    >
      <div className="flex flex-col flex-1 justify-between">
        <div>
          <p className="mb-1 text-neutral text-sm">{subTitle}</p>
          <h2 className="text-xl whitespace-pre-line card-title">{title}</h2>
        </div>

        {!isCompact && (
          <div className="card-actions">
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
