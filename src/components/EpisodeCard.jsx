// src/components/EpisodeCard.jsx
import React from 'react';

function EpisodeCard({ title, creator, src }) {
  return (
    <div>
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
