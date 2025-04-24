import { Heart, Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function PlayerBar() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [episode, setEpisode] = useState(null);

  useEffect(() => {
    fetchAnyEpisode();
  }, []);

  const fetchAnyEpisode = async () => {
    const { data, error } = await supabase.from('episodes').select('*').limit(1).single();

    if (error) {
      console.error('❌ 에피소드 불러오기 실패:', error.message);
    } else {
      setEpisode(data);
    }
  };

  const togglePlay = () => setIsPlaying((prev) => !prev);

  const toggleLike = async () => {
    if (!episode) return;

    const { error } = await supabase
      .from('episodes')
      .update({ isLike: !episode.isLike })
      .eq('id', episode.id);

    if (error) {
      console.error('❌ 좋아요 토글 실패:', error.message);
    } else {
      setEpisode((prev) => ({ ...prev, isLike: !prev.isLike }));
    }
  };

  if (!episode) return null;

  return (
    <div className="bottom-0 left-0 z-50 fixed bg-base-100 shadow-md border-t border-base-300 w-full">
      <div className="flex justify-between items-center mx-auto px-4 py-2 max-w-screen-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => console.log('이전곡')}
            className="hover:bg-base-300 p-2 rounded-full transition"
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
            onClick={() => console.log('다음곡')}
            className="hover:bg-base-300 p-2 rounded-full transition"
          >
            <SkipForward size={20} />
          </button>

          <button
            onClick={toggleLike}
            className={`hover:bg-base-300 p-2 rounded-full transition ${
              episode.isLike ? 'text-rose-500' : ''
            }`}
          >
            <Heart
              size={20}
              className={`transition-transform duration-300 ${
                episode.isLike ? 'scale-105' : 'scale-100'
              }`}
              fill={episode.isLike ? '#F43F5E' : 'none'}
              stroke={episode.isLike ? '#F43F5E' : 'currentColor'}
            />
          </button>
        </div>

        {/* 우측 에피소드 정보 */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="font-semibold text-md truncate">{episode.title}</span>
            <span className="text-gray-500 text-xs truncate">{episode.creator}</span>
          </div>
          <img
            src={episode.src || 'https://via.placeholder.com/40'}
            alt="thumbnail"
            className="rounded-xs h-12 object-cover"
          />
        </div>
      </div>
    </div>
  );
}
