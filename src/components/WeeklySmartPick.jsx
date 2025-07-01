import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOEM } from '../context/OEMContext';
import { supabase } from '../lib/supabase';
import CurationCard from './CurationCard';

function WeeklySmartPick() {
  const { t, i18n } = useTranslation();
  const [themes, setThemes] = useState([]);
  const { oemToggles } = useOEM();

  useEffect(() => {
    async function fetchThemes() {
      const selectedBrands = Object.entries(oemToggles)
        .filter(([_, enabled]) => enabled)
        .map(([brand]) => brand);

      const lang = i18n.language;

      console.log('Current language:', lang);
      console.log('Selected brands:', selectedBrands);

      // 🔍 en 언어의 모든 카테고리 확인
      const { data: allEnData } = await supabase
        .from('themes')
        .select('category')
        .eq('language', lang);

      console.log('🔍 EN 언어의 모든 카테고리:', [
        ...new Set(allEnData?.map((item) => item.category)),
      ]);

      // 🔍 smart_pick 대신 다른 카테고리로 테스트
      const { data: testData2 } = await supabase
        .from('themes')
        .select('*')
        .eq('language', lang)
        .limit(5);

      console.log('🔍 EN 언어 샘플 데이터:', testData2);

      // 기존 코드는 그대로 유지
      const conditionParts = [];
      if (selectedBrands.length > 0) {
        conditionParts.push(`brand.in.(${selectedBrands.join(',')})`);
      }
      conditionParts.push('brand.is.null');
      conditionParts.push("brand.eq.''");
      conditionParts.push('brand.eq.EMPTY');

      const query = supabase
        .from('themes')
        .select('*')
        .eq('category', 'smart_pick') // 이 부분이 문제일 수 있음
        .eq('language', lang)
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
  }, [oemToggles, i18n.language]);

  return (
    <div className="w-full overflow-hidden">
      <div className="flex items-center gap-2 mb-2 font-semibold text-gray-500 text-lg">
        {themes.length === 0 ? (
          <div className="bg-base-300 rounded-xl w-40 h-8 animate-pulse" />
        ) : (
          <>
            {t('sections.weekly_recommendations')}
            {/* <div className="tooltip-top font-normal tooltip" data-tip="P!CKLE이 선별한 추천 리스트">
              <div className="flex justify-center items-center bg-primary rounded-full w-5 h-5 font-bold text-white text-xs cursor-pointer">
                !
              </div>
            </div> */}
          </>
        )}
      </div>

      {/* 반응형 그리드 + 가로 스크롤 */}
      <div className="w-full">
        {/* 모바일: 세로 스택 */}
        <div className="sm:hidden flex flex-col gap-4">
          {themes.length === 0
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-base-300 rounded-xl w-full h-56 animate-pulse" />
              ))
            : themes.map((theme, idx) => (
                <div key={idx} className="w-full">
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

        {/* 태블릿: 2x2 그리드 */}
        <div className="hidden lg:hidden gap-4 sm:grid grid-cols-2">
          {themes.length === 0
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-base-300 rounded-xl h-56 animate-pulse" />
              ))
            : themes.map((theme, idx) => (
                <div key={idx}>
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

        {/* 데스크톱: 가로 스크롤 */}
        <div className="hidden lg:block">
          <div className="overflow-x-auto scrollbar-hide">
            <div className={`flex gap-4 ${themes.length <= 3 ? 'w-full' : 'w-max'}`}>
              {themes.length === 0
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-shrink-0 flex-1 bg-base-300 rounded-xl h-56 animate-pulse"
                    />
                  ))
                : themes.map((theme, idx) => (
                    <div
                      key={idx}
                      className={`flex-shrink-0 ${themes.length <= 3 ? 'flex-1' : 'w-80'}`}
                    >
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
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

export default WeeklySmartPick;
