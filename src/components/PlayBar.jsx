import { Heart, Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function PlayerBar() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [episodeList, setEpisodeList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const audioRef = useRef(null);
  const currentEpisode = episodeList[currentIndex] || null;
  const [progress, setProgress] = useState(0);
  const progressBarRef = useRef(null);
  const [isSeeking, setIsSeeking] = useState(false);

  const seek = (clientX) => {
    if (!audioRef.current || !progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.min(Math.max(x / rect.width, 0), 1); // 0~1 범위 clamp
    audioRef.current.currentTime = percent * audioRef.current.duration;

    // ⭐ 드래그 중 실시간 업데이트를 위해 추가
    setProgress(percent * 100);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isSeeking) {
        seek(e.clientX);
      }
    };

    const handleMouseUp = () => {
      if (isSeeking) {
        setIsSeeking(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', (e) => {
      if (isSeeking) seek(e.touches[0].clientX);
    });
    window.addEventListener('touchend', () => {
      if (isSeeking) setIsSeeking(false);
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', () => {});
      window.removeEventListener('touchend', () => {});
    };
  }, [isSeeking]);

  // 오디오 재생 위치 추적
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const { currentTime, duration } = audioRef.current;
      const percent = duration ? (currentTime / duration) * 100 : 0;
      setProgress(percent);
    }
  };

  const fetchEpisodes = useCallback(async () => {
    const { data, error } = await supabase
      .from('episodes')
      .select('*')
      .eq('creator', '이차저차')
      .order('id', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ 에피소드 불러오기 실패:', error.message);
    } else if (data?.length > 0) {
      setEpisodeList(data);
      setCurrentIndex(0);
      setIsPlaying(false);
    }
  }, []);

  useEffect(() => {
    fetchEpisodes();
  }, [fetchEpisodes]);

  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.play().catch((err) => {
        console.warn('재생 실패:', err);
      });
    }
  }, [currentIndex, isPlaying]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }

    setIsPlaying((prev) => !prev);
  };

  const toggleLike = async () => {
    const episode = currentEpisode;
    if (!episode) return;

    const { error } = await supabase
      .from('episodes')
      .update({ isLike: !episode.isLike })
      .eq('id', episode.id);

    if (error) {
      console.error('❌ 좋아요 토글 실패:', error.message);
    } else {
      const updated = [...episodeList];
      updated[currentIndex] = { ...episode, isLike: !episode.isLike };
      setEpisodeList(updated);
    }
  };

  const playPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsPlaying(true);
    }
  };

  const playNext = () => {
    if (currentIndex < episodeList.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsPlaying(true);
    }
  };

  return (
    <div className="bottom-0 left-0 z-50 fixed bg-base-100 shadow-md border-t border-base-300 w-full">
      <audio
        ref={audioRef}
        src={currentEpisode?.audioFile || null}
        onEnded={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
      />

      {/* 상단 프로그레스바 */}
      <div
        ref={progressBarRef}
        className="top-0 left-0 absolute bg-base-300 w-full h-1 cursor-pointer"
        onMouseDown={(e) => {
          setIsSeeking(true);
          seek(e.clientX);
        }}
        onTouchStart={(e) => {
          setIsSeeking(true);
          seek(e.touches[0].clientX);
        }}
      >
        <div
          className="bg-primary h-full transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      {currentEpisode ? (
        <div className="flex sm:flex-row flex-col justify-between items-center gap-2 sm:gap-0 mx-auto px-4 py-2 max-w-screen-xl">
          {/* 에피소드 정보 */}
          <div className="flex sm:flex-row-reverse justify-between sm:justify-end items-center gap-3 sm:order-2 w-full sm:w-auto">
            <img
              src={currentEpisode.src || 'https://via.placeholder.com/40'}
              alt="thumbnail"
              className="h-12 object-cover shrink-0"
            />
            <div className="flex flex-col min-w-0 text-left sm:text-right">
              <span className="font-semibold text-md truncate">{currentEpisode.title}</span>
              <span className="text-gray-500 text-xs truncate">{currentEpisode.creator}</span>
            </div>
          </div>

          {/* 컨트롤 */}
          <div className="flex justify-center sm:justify-start items-center gap-3 sm:order-1 w-full sm:w-auto">
            <button
              onClick={playPrevious}
              disabled={currentIndex === 0}
              className={`p-2 rounded-full transition hover:bg-base-300 ${
                currentIndex === 0 ? 'opacity-25 pointer-events-none cursor-default' : ''
              }`}
            >
              <SkipBack size={20} />
            </button>

            <button
              onClick={togglePlay}
              className="flex justify-center items-center hover:bg-base-300 p-2 rounded-full transition"
            >
              <div className="relative w-6 h-6">
                <Play
                  size={24}
                  className={`absolute left-0 top-0 transition-all duration-300 ease-in-out ${
                    isPlaying ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'
                  } text-primary`}
                />
                <Pause
                  size={24}
                  className={`absolute left-0 top-0 transition-all duration-300 ease-in-out ${
                    isPlaying ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
                  } text-primary`}
                />
              </div>
            </button>

            <button
              onClick={playNext}
              disabled={currentIndex === episodeList.length - 1}
              className={`p-2 rounded-full transition hover:bg-base-300 ${
                currentIndex === episodeList.length - 1
                  ? 'opacity-25 pointer-events-none cursor-default'
                  : ''
              }`}
            >
              <SkipForward size={20} />
            </button>

            <button
              onClick={toggleLike}
              className={`hover:bg-base-300 p-2 rounded-full transition ${
                currentEpisode.isLike ? 'text-rose-500' : ''
              }`}
            >
              <Heart
                size={20}
                className={`transition-transform duration-300 ${
                  currentEpisode.isLike ? 'scale-105' : 'scale-100'
                }`}
                fill={currentEpisode.isLike ? '#F43F5E' : 'none'}
                stroke={currentEpisode.isLike ? '#F43F5E' : 'currentColor'}
              />
            </button>
          </div>
        </div>
      ) : (
        <div className="px-4 py-2 text-gray-400 text-sm">에피소드 불러오는 중...</div>
      )}
    </div>
  );
}
