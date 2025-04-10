import CurationCard from './CurationCard';

const cardData = [
  { subTitle: 'P!CKLE THEME', title: '#비오는아침감성\n#하루마음정리' },
  { subTitle: 'P!CKLE THEME', title: '#출근길10분브리핑\n#출근길시사톡' },
  { subTitle: 'P!CKLE THEME', title: '#아침어학노트\n#10분영어루틴' },
];

function TodayTheme() {
  return (
    <div>
      <div className="mb-4 font-bold text-2xl">오늘의 테마 추천</div>
      <div className="flex gap-4 w-full">
        {cardData.map((card, idx) => (
          <div key={idx} className="w-1/3">
            <CurationCard subTitle={card.subTitle} title={card.title} tagId={`tag-${idx}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default TodayTheme;
