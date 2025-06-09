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

      // 조건 조합:
      // (brand IN selectedBrands OR brand IS NULL OR brand = '')
      const conditionParts = [];

      if (selectedBrands.length > 0) {
        conditionParts.push(`brand.in.(${selectedBrands.join(',')})`);
      }

      conditionParts.push('brand.is.null');
      conditionParts.push("brand.eq.''");

      const query = supabase
        .from('themes')
        .select('*')
        .eq('category', 'smart_pick')
        .or(conditionParts.join(','));

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

      <div className="px-4 overflow-x-auto scroll-smooth snap-mandatory snap-x scrollbar-hide">
        <div className="flex gap-4 w-max">
          {themes.length === 0
            ? Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 bg-base-300 rounded-xl w-[calc((100vw+3rem)/4)] h-56 animate-pulse snap-start"
                />
              ))
            : themes.map((theme, idx) => (
                <div key={idx} className="flex-shrink-0 w-[calc((100vw+3rem)/4)] snap-start">
                  <CurationCard
                    subTitle={theme.folder}
                    title={theme.title}
                    tagId={theme.slug}
                    image={theme.image}
                    episodeId={theme.episode_id}
                    textColor="text-white"
                  />
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}

export default WeeklySmartPick;
