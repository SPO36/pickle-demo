import { RefreshCcw } from 'lucide-react';
import { useState } from 'react';
import CurationCard from './CurationCard';

const cardData = [
  { subTitle: 'CATEGORY', title: 'News' },
  { subTitle: 'CATEGORY', title: 'Sports' },
  { subTitle: 'CATEGORY', title: 'Motivation' },
  { subTitle: 'CATEGORY', title: 'Business' },
  { subTitle: 'CATEGORY', title: 'Life & Talk' },
  { subTitle: 'CATEGORY', title: 'Kids' },
];

function PopularCategories() {
  const getRandomCards = () => {
    const shuffled = [...cardData].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 6);
  };

  const [shuffledCards, setShuffledCards] = useState(getRandomCards());

  return (
    <div className="space-y-3">
      <div className="mb-4 font-bold text-2xl">인기 카테고리</div>

      <div className="gap-4 grid grid-cols-3">
        {shuffledCards.map((card, idx) => (
          <CurationCard
            key={idx}
            subTitle={card.subTitle}
            title={card.title}
            tagId={`tag-${idx}`}
            isCompact={true}
          />
        ))}
      </div>

      <div>
        <button
          onClick={() => setShuffledCards(getRandomCards())}
          className="bg-base-200 w-full btn"
        >
          <RefreshCcw size={16} />
          다른 카테고리 추천받기
        </button>
      </div>
    </div>
  );
}

export default PopularCategories;
