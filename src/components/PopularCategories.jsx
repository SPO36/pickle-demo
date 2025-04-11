import { RefreshCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import CurationCard from './CurationCard';

function PopularCategories() {
  const [categories, setCategories] = useState([]);
  const [shuffledCards, setShuffledCards] = useState([]);

  const getRandomCards = (source) => {
    if (!source || source.length === 0) return [];
    const shuffled = [...source].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 6);
  };

  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase.from('category').select('*');
      if (error) {
        console.error('❌ Error loading categories:', error.message);
      } else {
        setCategories(data);
        setShuffledCards(getRandomCards(data));
      }
    }

    fetchCategories();
  }, []);

  const handleShuffle = () => {
    const newShuffle = getRandomCards(categories);
    setShuffledCards(newShuffle);
  };

  return (
    <div className="space-y-3">
      <div className="mb-4 font-bold text-2xl">인기 카테고리</div>

      <div className="gap-4 grid grid-cols-3">
        {shuffledCards.map((category, idx) => (
          <CurationCard
            key={category.id || idx}
            image={category.image}
            subTitle="CATEGORY"
            title={category.title}
            tagId={`tag-${idx}`}
            isCompact={true}
            textColor="text-white"
          />
        ))}
      </div>

      <div>
        <button
          onClick={handleShuffle}
          disabled={categories.length === 0}
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
