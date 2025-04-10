import { Flame } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

function TrendingBanner() {
  const [items, setItems] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const containerRef = useRef(null);

  // 🔄 Supabase에서 데이터 불러오기
  useEffect(() => {
    async function fetchTrending() {
      const { data, error } = await supabase.from('trending').select('*');
      if (error) {
        console.error('❌ Supabase fetch error:', error.message);
      } else {
        setItems(data);
      }
    }

    fetchTrending();
  }, []);

  // ❗ undefined 에러 방지: 아이템이 있을 때만 복제
  const extendedItems = items.length > 0 ? [...items, items[0]] : [];

  // ⏱ 자동 롤링 애니메이션
  useEffect(() => {
    if (items.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIdx((prev) => prev + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, [items]);

  // 🔁 마지막 → 처음으로 자연스럽게 복귀
  useEffect(() => {
    if (currentIdx === items.length) {
      setTimeout(() => {
        setIsAnimating(false);
        setCurrentIdx(0);
      }, 500);
      setTimeout(() => {
        setIsAnimating(true);
      }, 600);
    }
  }, [currentIdx, items.length]);

  return (
    <div className="relative bg-base-100 px-3 border border-base-300 rounded-md h-10 overflow-hidden cursor-pointer">
      <div
        ref={containerRef}
        className={`absolute w-full ${
          isAnimating ? 'transition-transform duration-500 ease-in-out' : ''
        }`}
        style={{ transform: `translateY(-${currentIdx * 2.5}rem)` }}
      >
        {extendedItems.map((item, idx) =>
          item ? (
            <div
              key={`${item.id}-${idx}`}
              className="flex items-center gap-4 h-10 font-medium text-sm"
            >
              <div className="flex items-center gap-1 text-error shrink-0">
                <Flame size={16} />
                인기
              </div>
              <div className="shrink-0">{(idx % items.length) + 1}</div>
              <div className="truncate">{item.title}</div>
              <div className="text-slate-500 whitespace-nowrap shrink-0">by {item.source}</div>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}

export default TrendingBanner;
