import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import CurationCard from './CurationCard';

function TodayTheme() {
  const [themes, setThemes] = useState([]);

  useEffect(() => {
    async function fetchThemes() {
      const { data, error } = await supabase
        .from('themes')
        .select('*')
        .eq('category', 'today_theme');
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
      <div className="mb-2 font-semibold text-lg">
        {themes.length === 0 ? (
          <div className="bg-base-300 rounded-xl w-40 h-8 animate-pulse" />
        ) : (
          '오늘의 테마 추천'
        )}
      </div>

      <div className="gap-3 grid grid-cols-1 md:grid-cols-3 w-full">
        {themes.length === 0
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-base-300 rounded-xl h-56 animate-pulse" />
            ))
          : themes.map((theme, idx) => (
              <CurationCard
                key={idx}
                subTitle="P!CKLE THEME"
                title={theme.title}
                tagId={theme.slug}
                image={theme.image}
                episodeId={theme.episode_id}
                textColor="text-white"
                badgeImage={theme.badge_image}
              />
            ))}
      </div>
    </div>
  );
}

export default TodayTheme;
