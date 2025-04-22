import { RefreshCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import ChannelCard from './ChannelCard';

function WeekplyPopularChannels() {
  const [channels, setChannels] = useState([]);
  const [shuffledCards, setShuffledCards] = useState([]);

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
    return shuffled.slice(0, 4);
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

  return (
    <div className="space-y-3">
      <div className="mb-2 font-semibold text-lg">이번주 인기 채널</div>
      <div className="gap-4 grid grid-cols-2 md:grid-cols-4 w-full">
        {shuffledCards.map((channel) => (
          <ChannelCard
            key={channel.id}
            src={channel.src}
            title={channel.title}
            creator={channel.creator}
            liked={channel.isLike}
            onToggleLike={() => toggleLike(channel.id, channel.isLike)}
          />
        ))}
      </div>

      <div>
        <button onClick={handleRefresh} className="bg-base-200 w-full btn">
          <RefreshCcw size={16} />
          다른 채널 추천받기
        </button>
      </div>
    </div>
  );
}

export default WeekplyPopularChannels;
