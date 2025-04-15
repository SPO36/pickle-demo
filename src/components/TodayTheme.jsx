import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import CurationCard from './CurationCard';

function TodayTheme() {
  const [themes, setThemes] = useState([]);

  useEffect(() => {
    async function fetchThemes() {
      const { data, error } = await supabase
        .from('theme')
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
      <div className="mb-4 font-bold text-2xl">
        {themes.length === 0 ? (
          <div className="bg-base-300 rounded-xl w-40 h-8 animate-pulse" />
        ) : (
          '오늘의 테마 추천'
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
                  subTitle="P!CKLE THEME"
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

export default TodayTheme;
