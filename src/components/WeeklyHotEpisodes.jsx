import { RefreshCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import EpisodeCard from '../components/EpisodeCard';
import { supabase } from '../lib/supabase';

function WeeklyHotEpisodes() {
  const [episodes, setEpisodes] = useState([]);

  useEffect(() => {
    async function fetchEpisodes() {
      const { data, error } = await supabase.from('episodes').select('*');
      if (error) {
        console.error('❌ Error loading episodes:', error.message);
      } else {
        setEpisodes(data);
      }
    }
    fetchEpisodes();
  }, []);

  const getRandomCards = () => {
    const shuffled = [...episodes].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4);
  };

  const [shuffledCards, setShuffledCards] = useState(getRandomCards());

  const handleRefresh = () => {
    setShuffledCards(getRandomCards());
  };

  return (
    <div className="space-y-3">
      <div className="mb-4 font-bold text-2xl">이번주 급상승 에피소드</div>
      <div className="flex gap-4 w-full">
        {episodes.map((card, idx) => (
          <EpisodeCard key={idx} title={card.title} creator={card.creator} src={card.src} />
        ))}
      </div>
      <div>
        <button onClick={handleRefresh} className="bg-base-200 w-full btn">
          <RefreshCcw size={16} />
          다른 에피소드 추천받기
        </button>
      </div>
    </div>
  );
}

export default WeeklyHotEpisodes;
