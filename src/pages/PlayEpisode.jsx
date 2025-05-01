import { Headphones, Heart, List, Pause, Play, Shuffle, SkipBack, SkipForward } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const HEADER_HEIGHT = 128;

function PlayEpisode() {
  const { id } = useParams();
  const [episode, setEpisode] = useState(null);
  const [liked, setLiked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [containerHeight, setContainerHeight] = useState('100vh');

  // 🔁 zoomLevel 적용 및 실시간 반영
  const updateHeight = () => {
    const zoom = parseFloat(localStorage.getItem('zoomLevel')) || 1;
    const physicalViewport = window.innerHeight;
    const adjustedHeight = physicalViewport / zoom - HEADER_HEIGHT * zoom;
    setContainerHeight(`${adjustedHeight}px`);
  };

  useEffect(() => {
    updateHeight();

    window.addEventListener('storage', updateHeight);
    window.addEventListener('zoomChange', updateHeight);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('storage', updateHeight);
      window.removeEventListener('zoomChange', updateHeight);
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  useEffect(() => {
    const fetchEpisode = async () => {
      const { data, error } = await supabase.from('episodes').select('*').eq('id', id).single();

      if (!error) setEpisode(data);
    };

    fetchEpisode();
  }, [id]);

  const togglePlay = () => setIsPlaying((prev) => !prev);
  const toggleLike = () => setLiked((prev) => !prev);

  if (!episode) return <div className="p-8 text-center">로딩 중...</div>;

  return (
    <div
      className="px-4 py-12"
      style={{
        height: containerHeight,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div className="space-y-10 w-full max-w-5xl" style={{ margin: 'auto' }}>
        {/* 상단 정보 */}
        <div className="flex md:flex-row flex-col items-center gap-8 w-full">
          <img
            src={episode.src}
            alt={episode.title}
            className="rounded-lg w-full md:w-2/5 h-auto object-cover"
          />
          <div className="flex-1 space-y-8 w-full">
            <div className="space-y-2">
              <h2 className="font-semibold text-2xl line-clamp-2 leading-snug">{episode.title}</h2>
              <p className="text-gray-500 text-lg">{episode.creator}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={toggleLike}
                className="flex items-center gap-2 bg-base-200 px-5 py-2 rounded-full text-md btn"
              >
                <Heart
                  size={18}
                  className={`transition-transform duration-300 ${
                    liked ? 'scale-125' : 'scale-100'
                  }`}
                  fill={liked ? '#F43F5E' : 'none'}
                  stroke={liked ? '#F43F5E' : 'currentColor'}
                />
                좋아요
              </button>

              <button className="flex items-center gap-2 bg-primary px-5 py-2 rounded-full text-md text-white btn">
                <Headphones size={18} className="transition-transform duration-300" />
                더빙 듣기
              </button>
            </div>
          </div>
        </div>

        {/* 오디오 재생기 */}
        <div className="w-full">
          <audio src={episode.audioFile} controls autoPlay className="mt-4 w-full" />
        </div>

        {/* 커스텀 컨트롤 (추후 확장 가능) */}
        <div className="space-y-6 w-full">
          <div className="bg-base-300 rounded-full w-full h-2 overflow-hidden">
            <div className="bg-primary w-[12%] h-full" />
          </div>

          <div className="flex justify-between w-full text-gray-500 text-sm">
            <span>00:03</span>
            <span>35:00</span>
          </div>

          <div className="flex justify-center items-center pt-4 w-full">
            <div className="flex justify-between items-center px-6 w-full max-w-2xl">
              <button className="hover:bg-base-300 p-3 rounded-full transition">
                <Shuffle size={28} className="cursor-pointer" />
              </button>
              <button className="hover:bg-base-300 p-3 rounded-full transition">
                <SkipBack size={32} className="cursor-pointer" />
              </button>

              <button onClick={togglePlay} className="transition-all duration-300 ease-in-out">
                <div className="relative w-10 h-10">
                  <Play
                    size={40}
                    className={`absolute left-0 top-0 transition-all duration-300 ease-in-out ${
                      isPlaying ? 'opacity-0 scale-90' : 'opacity-100 scale-100'
                    } text-primary`}
                  />
                  <Pause
                    size={40}
                    className={`absolute left-0 top-0 transition-all duration-300 ease-in-out ${
                      isPlaying ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                    } text-primary`}
                  />
                </div>
              </button>

              <button className="hover:bg-base-300 p-3 rounded-full transition">
                <SkipForward size={32} className="cursor-pointer" />
              </button>
              <button className="hover:bg-base-300 p-3 rounded-full transition">
                <List size={28} className="cursor-pointer" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlayEpisode;
