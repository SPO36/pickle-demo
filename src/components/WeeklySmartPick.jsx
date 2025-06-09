import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOEM } from '../context/OEMContext';
import { supabase } from '../lib/supabase';
import CurationCard from './CurationCard';

function WeeklySmartPick() {
  const { t, i18n } = useTranslation();
  const [themes, setThemes] = useState([]);
  const { showOEMOnly, oemToggles } = useOEM();

  useEffect(() => {
    async function fetchThemes() {
      const selectedBrands = Object.entries(oemToggles)
        .filter(([_, enabled]) => enabled)
        .map(([brand]) => brand);

      let query = supabase.from('themes').select('*');

      if (selectedBrands.length === 0) {
        // ✅ 브랜드 선택 없음 → 전부 가져오기
        query = query.eq('category', 'smart_pick');
      } else {
        // ✅ 선택된 브랜드 + 공통 콘텐츠
        query = query
          .eq('category', 'smart_pick')
          .or([`brand.in.(${selectedBrands.join(',')})`, 'brand.is.null', "brand.eq.''"].join(','));
      }

      const { data, error } = await query;
      if (error) {
        console.error('❌ Error loading themes:', error.message);
        setThemes([]);
      } else {
        setThemes(data);
      }
    }

    fetchThemes();
  }, [oemToggles]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-2 font-semibold text-gray-500 text-lg">
        {themes.length === 0 ? (
          <div className="bg-base-300 rounded-xl w-40 h-8 animate-pulse" />
        ) : (
          <>
            {t('sections.weekly_recommendations')}
            <div className="tooltip-top font-normal tooltip" data-tip="P!CKLE이 선별한 추천 리스트">
              <div className="flex justify-center items-center bg-primary rounded-full w-5 h-5 font-bold text-white text-xs cursor-pointer">
                !
              </div>
            </div>
          </>
        )}
      </div>

      <div className="gap-3 grid grid-cols-1 md:grid-cols-3">
        {themes.length === 0
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-base-300 rounded-xl h-56 animate-pulse" />
            ))
          : themes.map((theme, idx) => (
              <CurationCard
                key={idx}
                subTitle={theme.folder}
                title={theme.title}
                tagId={theme.slug}
                image={theme.image}
                episodeId={theme.episode_id}
                textColor="text-white"
              />
            ))}
      </div>
    </div>
  );
}

export default WeeklySmartPick;
