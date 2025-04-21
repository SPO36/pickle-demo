import { RefreshCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import CurationCard from './CurationCard';

function PopularCategories() {
  const [categories, setCategories] = useState([]);
  const [shuffledCards, setShuffledCards] = useState([]);
  const navigate = useNavigate();

  const handleClickCategory = (slug) => {
    navigate(`/categories/${slug}`);
  };

  const getRandomCards = (source) => {
    if (!source || source.length === 0) return [];
    const shuffled = [...source].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 6);
  };

  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('no', { ascending: true });
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
      <div className="mb-4 font-bold text-2xl">
        {shuffledCards.length === 0 ? (
          <div className="bg-base-300 rounded-xl w-40 h-8 animate-pulse" />
        ) : (
          '인기 카테고리'
        )}
      </div>

      {/* <div className="gap-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"> */}
      <div className="flex gap-3 overflow-x-auto cursor-pointer scrollbar-hide">
        {shuffledCards.length === 0
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 bg-base-300 rounded-xl w-[23%] min-w-[200px] h-44 animate-pulse"
              />
            ))
          : shuffledCards.map((category, idx) => (
              <div key={category.id || idx} className="flex-shrink-0 w-[23%] min-w-[200px]">
                <CurationCard
                  image={category.image}
                  subTitle="CATEGORY"
                  title={category.title}
                  to={`/categories/${category.slug}`}
                  isCompact={true}
                  textColor="text-white"
                  aspectRatio="4/5"
                />
              </div>
            ))}
      </div>

      <div>
        {categories.length === 0 ? (
          <div className="bg-base-300 rounded-xl w-full h-10 animate-pulse" />
        ) : (
          <button
            onClick={handleShuffle}
            disabled={categories.length === 0}
            className="bg-base-200 w-full btn"
          >
            <RefreshCcw size={16} />
            다른 카테고리 추천받기
          </button>
        )}
      </div>
    </div>
  );
}

export default PopularCategories;
