import { Flame } from 'lucide-react';
import { useEffect, useState } from 'react';

const newsItems = [
  {
    title: '트럼프발 관세폭탄, 자동차 산업 무너지나 - 권용주 교수',
    source: '손에 잡히는 경제',
  },
  {
    title: '美 실리콘밸리 대규모 해고 사태의 진짜 이유는?',
    source: 'Tech Brief',
  },
  {
    title: '한국은행 기준금리 동결, 시장 반응은?',
    source: '경제읽기',
  },
];

function TrendingBanner() {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % newsItems.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative bg-base-100 px-3 border border-base-300 rounded-md h-10 overflow-hidden cursor-pointer">
      <div
        className="absolute transition-transform duration-500 ease-in-out"
        style={{ transform: `tranbaseY(-${currentIdx * 2.5}rem)` }}
      >
        {newsItems.map((item, idx) => (
          <div key={idx} className="flex items-center gap-4 h-10 font-medium text-sm">
            <div className="flex items-center gap-1 text-error">
              <Flame size={16} />
              인기
            </div>

            <div className="text-black">{idx + 1}</div>
            <div className="text-black truncate">{item.title}</div>
            <div className="text-slate-500 whitespace-nowrap shrink-0">by {item.source}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TrendingBanner;
