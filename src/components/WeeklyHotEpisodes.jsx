import { RefreshCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import EpisodeCard from '../components/EpisodeCard';
import { supabase } from '../lib/supabase';

function WeeklyHotEpisodes() {
  const [episodes, setEpisodes] = useState([]);
  const [shuffledCards, setShuffledCards] = useState([]);

  useEffect(() => {
    async function fetchEpisodes() {
      const { data, error } = await supabase.from('episodes').select('*');
      if (error) {
        console.error('❌ Error loading episodes:', error.message);
      } else {
        setEpisodes(data);
        // 초기 로드 시 무작위로 4개 선택
        const shuffled = [...data].sort(() => Math.random() - 0.5).slice(0, 4);
        setShuffledCards(shuffled);
      }
    }
    fetchEpisodes();
  }, []);

  const handleRefresh = () => {
    const shuffled = [...episodes].sort(() => Math.random() - 0.5).slice(0, 4);
    setShuffledCards(shuffled);
  };

  return (
    <div className="space-y-3">
      <div className="mb-2 font-semibold text-lg">이번주 급상승 에피소드</div>
      <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
        {shuffledCards.map((card, idx) => (
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
