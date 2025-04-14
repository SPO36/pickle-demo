import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

function TrendingBanner() {
  const [items, setItems] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const containerRef = useRef(null);

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

  const extendedItems = items.length > 0 ? [...items, items[0]] : [];

  useEffect(() => {
    if (items.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIdx((prev) => prev + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, [items]);

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

  // 🔥 스켈레톤 상태
  if (items.length === 0) {
    return <div className="bg-base-300 rounded-md w-full h-10 animate-pulse" />;
  }

  // ✅ 실 콘텐츠
  return (
    <div className="relative bg-base-100 px-3 border border-base-300 rounded-md h-10 overflow-hidden cursor-pointer">
      <div
        ref={containerRef}
        className={`absolute w-full ${
          isAnimating ? 'transition-transform duration-500 ease-in-out' : ''
        }`}
        style={{ transform: `translateY(-${currentIdx * 2.5}rem)` }}
      >
        {extendedItems.map((item, idx) => (
          <div
            key={`${item.id}-${idx}`}
            className="flex items-center gap-4 h-10 font-medium text-sm"
          >
            <div className="flex items-center gap-1 text-error shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              인기
            </div>
            <div className="shrink-0">{(idx % items.length) + 1}</div>
            <div className="truncate">{item.title}</div>
            <div className="text-gray-500 whitespace-nowrap shrink-0">by {item.source}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TrendingBanner;
