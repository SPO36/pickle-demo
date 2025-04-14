import { Headphones, Heart, List, Pause, Play, Shuffle, SkipBack, SkipForward } from 'lucide-react';
import { useState } from 'react';

function PlayEpisode() {
  const [liked, setLiked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const toggleLike = () => setLiked((prev) => !prev);

  return (
    <div
      className="flex justify-center items-center px-4 py-12"
      style={{ minHeight: 'calc(100vh - 128px)' }}
    >
      <div className="space-y-10 w-full">
        {/* 상단 정보 */}
        <div className="flex md:flex-row flex-col items-center gap-12 w-full">
          <img
            src="https://i.ytimg.com/vi/4wOdJ5F-5i8/maxresdefault.jpg"
            alt="The surprising habits of original thinkers"
            className="rounded-xl w-full md:w-1/3 object-cover"
          />
          <div className="flex-1 space-y-8 w-full">
            <div className="space-y-2">
              <h2 className="font-semibold text-4xl leading-snug">
                The surprising habits of original thinkers | Adam Grant | TED
              </h2>
              <p className="text-gray-500 text-lg">TED Business</p>
            </div>
            <p className="flex items-center gap-1 text-gray-500 text-lg">17:44</p>

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

        {/* 플레이어 영역 */}
        <div className="space-y-6 w-full">
          {/* 진행 바 */}
          <div className="bg-base-300 rounded-full w-full h-2 overflow-hidden">
            <div className="bg-primary w-[12%] h-full" />
          </div>

          {/* 시간 텍스트 */}
          <div className="flex justify-between w-full text-gray-500 text-sm">
            <span>00:03</span>
            <span>35:00</span>
          </div>

          {/* 재생 컨트롤 */}
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
