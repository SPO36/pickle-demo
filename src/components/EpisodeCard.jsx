import React from 'react';
import { useNavigate } from 'react-router-dom';

function EpisodeCard({ title, creator, src, id, themeSlug, audioFile }) {
  const navigate = useNavigate();

  const handlePlayClick = (e) => {
    if (!audioFile) {
      showToast(title + '의 오디오 파일이 존재하지 않습니다');
      e.stopPropagation(); // 이제 정상 작동
      return; // 아래로 내려가지 않게 조기 리턴
    }

    if (themeSlug) {
      navigate(`/episode/${id}/${themeSlug}`);
    } else {
      navigate(`/episode/${id}`);
    }
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
