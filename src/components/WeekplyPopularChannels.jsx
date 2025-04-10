import { Heart, RefreshCcw } from 'lucide-react';
import { useState } from 'react';

function WeekplyPopularChannels() {
  const cardData = [
    {
      creator: 'ⓒMBC',
      title: '손에 잡히는 경제',
      src: 'https://i.scdn.co/image/ab6765630000ba8a1b880658fc4a56693b07cac2',
    },
    {
      creator: 'ⓒMBC',
      title: '권순표의 뉴스하이킥',
      src: 'https://img.podbbang.com/img/pb_m/thumb/x200/1777267.png?_1744203950',
    },
    {
      creator: '세상을바꾸는시간15분',
      title: '세바시',
      src: 'https://podcastaddict.com/cache/artwork/full/4288067',
    },
    {
      creator: '900KM',
      title: '요즘 것들의 사생활',
      src: 'https://i.scdn.co/image/ab67656300005f1fee4e0d54756ef849d322d655',
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
      <div className="mb-4 font-bold text-2xl">이번주 인기 채널</div>
      <div className="flex gap-4 w-full">
        {shuffledCards.map((card, idx) => (
          <div key={idx} className="w-1/4">
            <div className="bg-base-100 shadow-sm border border-base-300 card">
              <figure className="bg-base-100 px-10 pt-10">
                <img
                  src={card.src}
                  alt={card.title}
                  className="rounded-xl w-full h-full object-cover"
                />
              </figure>
              <div className="items-center gap-4 text-center card-body">
                <div className="flex flex-col items-center">
                  <h2 className="text-lg card-title">{card.title}</h2>
                  <p>{card.creator}</p>
                </div>
                <button
                  onClick={() => toggleLike(card.title)}
                  className={`btn rounded-full ${
                    likes[card.title] ? 'bg-base-200 text-rose-500' : 'bg-base-200'
                  }`}
                >
                  <Heart
                    size={16}
                    className={`transition-transform duration-300 ${
                      likes[card.title] ? 'scale-125' : 'scale-100'
                    }`}
                    fill={likes[card.title] ? '#F43F5E' : 'none'}
                    stroke={likes[card.title] ? '#F43F5E' : 'currentColor'}
                  />
                  좋아요
                </button>
              </div>
            </div>
          </div>
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
