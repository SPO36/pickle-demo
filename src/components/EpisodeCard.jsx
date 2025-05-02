import React from 'react';
import { useNavigate } from 'react-router-dom';

function EpisodeCard({ title, creator, src, id, themeSlug }) {
  const navigate = useNavigate();

  const handlePlayClick = () => {
    if (themeSlug) {
      navigate(`/episode/${id}/${themeSlug}`);
    } else {
      navigate(`/episode/${id}`); // fallback
    }
  };

  return (
    <div className="cursor-pointer" onClick={handlePlayClick}>
      <div className="bg-base-100">
        <figure>
          <img src={src} alt={creator} />
        </figure>
        <div className="gap-4 py-2">
          <h2 className="overflow-hidden font-semibold text-md line-clamp-2">{title}</h2>
          <p className="text-gray-500 text-sm truncate">{creator}</p>
        </div>
      </div>
    </div>
  );
}

export default EpisodeCard;
