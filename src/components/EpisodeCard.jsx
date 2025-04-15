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
      <div className="bg-base-100 shadow-sm border border-base-300 card">
        <figure>
          <img src={src} alt={creator} />
        </figure>
        <div className="card-body">
          <h2 className="overflow-hidden line-clamp-2 card-title">{title}</h2>
          <p className="text-gray-500">{creator}</p>
        </div>
      </div>
    </div>
  );
}

export default EpisodeCard;
