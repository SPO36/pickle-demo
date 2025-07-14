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
    const episodeUuids = [
      // 'c0de80e1-0820-4706-ab44-850ad556dd03',
      // '1c90d7da-acf7-4938-9c30-70d1be5acb71',
      // '916ce7cb-9c5a-4999-be27-f9afb185d074',
      // 'b6b41ae1-f697-4fa7-bdd4-9a74f9bb77ae',
      // '5531f9aa-cd14-42b7-ae05-0aba30a4aadb',
      // 'e3e6dd5d-221d-4802-8c60-722d4acdfcdb',
      // '62ba7649-941e-4c9d-9fc6-3f4cab492695',
      // '3f858e8e-36c5-44b7-951b-b7e5c6482b97',
      // '5531f9aa-cd14-42b7-ae05-0aba30a4aadb',
      // 'bf8d8664-0b71-4d3e-b736-483ac6357290',
      // 'd12aa5ee-00ec-4d8b-a7c8-2d3ab1f272fd',
      // // '023dd864-3eda-4b6c-b1a9-2aed13b1b7d1',
      // '961dd43f-8d79-4332-a49e-cad96be75db1',
      // '9d6236b7-74a4-495f-9810-dd4f91263eea',
      // '87ce66b4-1479-48f9-ae1b-7526c781e042',
      // '89547d4b-76c7-4258-a761-f4fda5a98176',
      // '5f9127f6-8863-4daa-a664-8572944d890d',
      // '6689a55f-a846-4202-a001-4813725c6ee7',
      // 'b4a6dd50-2dd9-4cc7-b292-a4d0dfdc761c',
      // '654a4ed1-a984-4179-b316-94f4c4b4d169',
      // '67fe97c0-65b1-4916-adf5-a3e225cbae50',
      // 'f172987d-6105-4522-a058-1678c2b509c5',
      '1810e918-646d-40e4-a04d-9064224ba984',
      '08c2248a-f530-4ba3-834b-8a273a01ec55',
      'b32f1ea4-78df-445c-bf3c-a39b448c89a6',
      'a13b0c20-99c0-4d2c-b295-845ce5549de1',
      '727c9736-17fc-480d-b5c0-63f25e6da6e8',
      'b55a9e91-ce7e-4a20-8d6f-3abb63733f83',
      '383702f1-8f29-4b40-ae2a-fbf7f3e06968',
      '8b9cb74a-c2f9-4d2a-9bf7-54d71d236f01',
      'a98ce68a-7473-44c7-a6ab-0f591cb2a69c',
      '8ea8b4a1-abb0-4744-b49f-229414aab71f',
      '2b43b58e-4d01-4fb9-a68b-04c417641c8f',
      '9f37088c-72ad-43f2-8030-7c68bf5dcd5a',
    ];

    const { data, error } = await supabase
      .from('episodes')
      .select('*')
      .in('id', episodeUuids)
      .order('id', { ascending: true });

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
