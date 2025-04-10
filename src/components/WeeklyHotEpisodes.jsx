import { RefreshCcw } from 'lucide-react';
import { useState } from 'react';

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
  const [likes, setLikes] = useState({});

  const toggleLike = (title) => {
    setLikes((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const handleRefresh = () => {
    setShuffledCards(getRandomCards());
  };

  return (
    <div className="space-y-3">
      <div className="mb-4 font-bold text-2xl">이번주 급상승 에피소드</div>
      <div className="flex gap-4 w-full">
        {shuffledCards.map((card, idx) => (
          <div key={idx} className="w-1/3">
            <div className="bg-base-100 shadow-sm card">
              <figure>
                <img src={card.src} alt={card.creator} />
              </figure>
              <div className="card-body">
                <h2 className="card-title">{card.title}</h2>
                <p>{card.creator}</p>
              </div>
            </div>
          </div>
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
