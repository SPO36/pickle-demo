import { RefreshCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import CurationCard from './CurationCard';

function PopularCategories() {
  const { t } = useTranslation();
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
        setShuffledCards(data.slice(0, 6));
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
      <div className="mb-2 font-semibold text-gray-500 text-lg">
        {shuffledCards.length === 0 ? (
          <div className="bg-base-300 rounded-xl w-40 h-8 animate-pulse" />
        ) : (
          t('sections.popular_categories')
        )}
      </div>

      {/* 원본 크기 유지하면서 스크롤 */}
      <div className="flex gap-3 overflow-x-auto cursor-pointer scrollbar-hide">
        {shuffledCards.length === 0
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 bg-base-300 rounded-xl w-40 aspect-[4/5] animate-pulse"
              />
            ))
          : shuffledCards.map((category, idx) => (
              <div key={category.id || idx} className="flex-shrink-0">
                <CurationCard
                  image={category.image}
                  subTitle="CATEGORY"
                  title={category.title}
                  to={`/categories/${category.slug}`}
                  isCompact={true}
                  textColor="text-white"
                  aspectRatio="natural" // 원본 비율 유지
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
            {t('buttons.recommend_category')}
          </button>
        )}
      </div>
    </div>
  );
}

export default PopularCategories;
