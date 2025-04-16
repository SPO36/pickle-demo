import { Headphones, Heart, List, Pause, Play, Shuffle, SkipBack, SkipForward } from 'lucide-react';
import { useEffect, useState } from 'react';

const HEADER_HEIGHT = 128;

function PlayEpisode() {
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
    updateHeight(); // 초기 적용

    // ✅ 실시간 반영: storage & custom zoomChange 이벤트
    window.addEventListener('storage', updateHeight);
    window.addEventListener('zoomChange', updateHeight);

    // ✅ 스크롤 방지
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('storage', updateHeight);
      window.removeEventListener('zoomChange', updateHeight);
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const togglePlay = () => setIsPlaying((prev) => !prev);
  const toggleLike = () => setLiked((prev) => !prev);

  return (
    <div
      className="px-4 py-12"
      style={{
        height: containerHeight,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        className="space-y-10 w-full max-w-5xl"
        style={{
          margin: 'auto',
        }}
      >
        {/* 상단 정보 */}
        <div className="flex md:flex-row flex-col items-center gap-12 w-full">
          <img
            src="https://i.ytimg.com/vi/4wOdJ5F-5i8/maxresdefault.jpg"
            alt="The surprising habits of original thinkers"
            className="rounded-xl w-full md:w-1/3 object-cover"
          />
          <div className="flex-1 space-y-8 w-full">
            <div className="space-y-2">
              <h2 className="font-semibold text-4xl line-clamp-2 leading-snug">
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
