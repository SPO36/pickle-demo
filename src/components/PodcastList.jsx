import { RefreshCcw } from 'lucide-react';
import CurationCard from './CurationCard';

const cardData = [
  { subTitle: 'P!CKLE THEME', title: '작은 습관 하나\n오늘의 30분 브레인 스넥' },
  { subTitle: 'P!CKLE THEME', title: '오늘의 역사 속\n기록, 그리고 이야기' },
  { subTitle: 'P!CKLE THEME', title: '진실 혹은 거짓\n귀로 듣는 스산한 이야기' },
];

function TodayTheme() {
  return (
    <div className="space-y-3">
      <div className="mb-4 font-bold text-2xl">이번주 똑똑한 추천</div>
      <div className="flex gap-4 w-full">
        {cardData.map((card, idx) => (
          <div key={idx} className="w-1/3">
            <CurationCard subTitle={card.subTitle} title={card.title} tagId={`tag-${idx}`} />
          </div>
        ))}
      </div>
      <div>
        <button className="bg-base-300 w-full btn">
          <RefreshCcw size={16} />
          다른 큐레이션 추천받기
        </button>
      </div>
    </div>
  );
}

export default TodayTheme;
