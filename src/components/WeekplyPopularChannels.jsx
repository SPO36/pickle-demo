import { ChevronLeft, ChevronRight, RefreshCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { supabase } from '../lib/supabase';
import ChannelCard from './ChannelCard';

export default function WeekplyPopularChannels() {
  const [channels, setChannels] = useState([]);
  const [shuffledCards, setShuffledCards] = useState([]);
  const [swiperInstance, setSwiperInstance] = useState(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  useEffect(() => {
    async function fetchChannels() {
      const { data, error } = await supabase.from('channels').select('*');
      if (error) {
        console.error('❌ Error loading channels:', error.message);
      } else {
        setChannels(data);
        setShuffledCards(getRandomCards(data));
      }
    }

    fetchChannels();
  }, []);

  const getRandomCards = (source) => {
    const shuffled = [...source].sort(() => Math.random() - 0.5);
    return shuffled;
  };

  const toggleLike = async (channelId, current) => {
    const { error } = await supabase
      .from('channels')
      .update({ isLike: !current })
      .eq('id', channelId);

    if (error) {
      console.error('❌ 좋아요 토글 실패:', error.message);
    } else {
      setChannels((prev) => prev.map((c) => (c.id === channelId ? { ...c, isLike: !current } : c)));
      setShuffledCards((prev) =>
        prev.map((c) => (c.id === channelId ? { ...c, isLike: !current } : c))
      );
    }
  };

  const handleRefresh = () => {
    setShuffledCards(getRandomCards(channels));
  };

  const handleSlideChange = (swiper) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  return (
    <div className="relative space-y-3 w-full">
      <div className="mb-2 font-semibold text-gray-500 text-lg">이번주 인기 채널</div>

      {/* 커스텀 네비게이션 버튼 */}
      <button
        className={`swiper-button-prev-custom top-[45%] -left-5 z-10 absolute bg-base-200 hover:bg-base-300 shadow-md p-2 rounded-full -translate-y-1/2 transform ${
          isBeginning ? 'hidden' : ''
        }`}
      >
        <ChevronLeft size={20} />
      </button>
      <button
        className={`swiper-button-next-custom top-[45%] -right-5 z-10 absolute bg-base-200 hover:bg-base-300 shadow-md p-2 rounded-full -translate-y-1/2 transform ${
          isEnd ? 'hidden' : ''
        }`}
      >
        <ChevronRight size={20} />
      </button>

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
          0: { slidesPerView: 2 },
          640: { slidesPerView: 3 },
          1024: { slidesPerView: 5 },
        }}
      >
        {shuffledCards.map((channel) => (
          <SwiperSlide key={channel.id} className="!flex !justify-center">
            <ChannelCard
              src={channel.src}
              title={channel.title}
              creator={channel.creator}
              liked={channel.isLike}
              onToggleLike={() => toggleLike(channel.id, channel.isLike)}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      <div>
        <button onClick={handleRefresh} className="bg-base-200 w-full btn">
          <RefreshCcw size={16} />
          다른 채널 추천받기
        </button>
      </div>
    </div>
  );
}
