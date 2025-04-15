import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import CurationCard from './CurationCard';

function WeeklySmartPick() {
  const [themes, setThemes] = useState([]);

  useEffect(() => {
    async function fetchThemes() {
      const { data, error } = await supabase.from('theme').select('*').eq('category', 'smart_pick');
      if (error) {
        console.error('❌ Error loading themes:', error.message);
      } else {
        setThemes(data);
      }
    }
    fetchThemes();
  }, []);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 font-bold text-2xl">
        {themes.length === 0 ? (
          <div className="bg-base-300 rounded-xl w-40 h-8 animate-pulse" />
        ) : (
          <>
            이번주 똑똑한 추천
            <div className="tooltip-top font-normal tooltip" data-tip="P!CKLE이 선별한 추천 리스트">
              <div className="flex justify-center items-center bg-primary rounded-full w-5 h-5 font-bold text-white text-xs cursor-pointer">
                !
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex gap-4 w-full">
        {themes.length === 0
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-base-300 rounded-xl w-1/3 h-56 animate-pulse" />
            ))
          : themes.map((theme, idx) => (
              <div key={idx} className="w-1/3">
                <CurationCard
                  subTitle="P!CKLE P!CK"
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
  );
}

export default WeeklySmartPick;
