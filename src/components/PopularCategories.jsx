import { RefreshCcw } from 'lucide-react';
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
  return (
    <div className="space-y-3">
      <div className="mb-4 font-bold text-2xl">인기 카테고리</div>

      <div className="gap-4 grid grid-cols-3">
        {cardData.map((card, idx) => (
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
        <button className="w-full btn">
          <RefreshCcw size={16} />
          다른 카테고리 추천받기
        </button>
      </div>
    </div>
  );
}

export default PopularCategories;
