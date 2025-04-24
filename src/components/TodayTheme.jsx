import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { supabase } from '../lib/supabase';
import CurationCard from './CurationCard';

export default function TodayTheme() {
  const [themes, setThemes] = useState([]);
  const [swiperInstance, setSwiperInstance] = useState(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  useEffect(() => {
    async function fetchThemes() {
      const { data, error } = await supabase
        .from('themes')
        .select('*')
        .eq('category', 'today_theme');
      if (error) {
        console.error('❌ Error loading themes:', error.message);
      } else {
        setThemes(data);
      }
    }

    fetchThemes();
  }, []);

  const handleSlideChange = (swiper) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  return (
    <div className="relative w-full">
      <div className="mb-2 font-semibold text-gray-500 text-lg">
        {themes.length === 0 ? (
          <div className="bg-base-300 rounded-xl w-40 h-8 animate-pulse" />
        ) : (
          '일상의 lo-fi'
        )}
      </div>

      {/* 화살표는 항상 렌더링, hidden 클래스로 제어 */}
      <button
        className={`swiper-button-prev-custom top-[55%] -left-5 z-10 absolute bg-base-200 hover:bg-base-300 shadow-md p-2 rounded-full -translate-y-1/2 transform ${
          isBeginning ? 'hidden' : ''
        }`}
      >
        <ChevronLeft size={20} />
      </button>
      <button
        className={`swiper-button-next-custom top-[55%] -right-5 z-10 absolute bg-base-200 hover:bg-base-300 shadow-md p-2 rounded-full -translate-y-1/2 transform ${
          isEnd ? 'hidden' : ''
        }`}
      >
        <ChevronRight size={20} />
      </button>

      {themes.length === 0 ? (
        <div className="gap-3 grid grid-cols-1 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-base-300 rounded-xl h-56 animate-pulse" />
          ))}
        </div>
      ) : (
        <Swiper
          modules={[Navigation]}
          navigation={{
            prevEl: '.swiper-button-prev-custom',
            nextEl: '.swiper-button-next-custom',
          }}
          spaceBetween={16}
          onSwiper={setSwiperInstance}
          onSlideChange={handleSlideChange}
          breakpoints={{
            0: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
        >
          {themes.map((theme, idx) => (
            <SwiperSlide key={idx} className="!flex !justify-center">
              <CurationCard
                subTitle="P!CKLE THEME"
                title={theme.title}
                tagId={theme.slug}
                image={theme.image}
                episodeId={theme.episode_id}
                textColor="text-white"
                badgeImage={theme.badge_image}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
}
