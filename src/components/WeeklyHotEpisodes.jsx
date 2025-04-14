import { RefreshCcw } from 'lucide-react';
import { useState } from 'react';
import EpisodeCard from '../components/EpisodeCard'; // 경로는 프로젝트 구조에 맞게 수정

function WeekplyPopularHosts() {
  const cardData = [
    {
      creator: '김종배의 시선집중',
      playTime: '2:11:16',
      title: '[김종배의 시선집중][FULL] 尹 탄핵 투표의 날, 어떤 일이 있었나, MBC 241208 방송',
      src: 'https://i.ytimg.com/vi/ng5Qr0pJO8w/maxresdefault.jpg',
    },
    {
      creator: 'JTBC News',
      playTime: '17:44',
      title: '관세로 두 쪽 난 트럼프파…"차 조립업자가 뭘 아냐" vs "바보 천치"｜지금 이 뉴스',
      src: 'https://i.ytimg.com/vi/goJhTc_aLog/maxresdefault.jpg',
    },
    {
      creator: '김용민TV',
      playTime: '4:25',
      title: '[뉴스텐션] 윤석열 파면 순간...영광과 감격의 전국 풍경 모았습니다',
      src: 'https://i.ytimg.com/vi/t_MnV7b5eHs/maxresdefault.jpg',
    },
  ];

  const getRandomCards = () => {
    const shuffled = [...cardData].sort(() => Math.random() - 0.5);
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

export default WeekplyPopularHosts;
