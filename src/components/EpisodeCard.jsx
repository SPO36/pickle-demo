// src/components/EpisodeCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

function EpisodeCard({ title, creator, src }) {
  const navigate = useNavigate();
  const handlePlayClick = (e) => {
    e.stopPropagation(); // 카드 클릭 막기
    navigate('/episode'); // 임시로 고정된 재생 페이지로 이동
  };

  return (
    <div className="cursor-pointer" onClick={handlePlayClick}>
      <div className="bg-base-100 shadow-sm">
        <figure>
          <img src={src} alt={creator} />
        </figure>
        <div className="gap-4 py-3">
          <h2 className="overflow-hidden font-semibold text-md line-clamp-2">{title}</h2>
          <p className="text-gray-500 text-sm truncate">{creator}</p>
        </div>
      </div>
    </div>
  );
}

export default EpisodeCard;
