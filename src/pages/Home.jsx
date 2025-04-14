import { useEffect, useState } from 'react';
import PopularCategories from '../components/PopularCategories';
import TodayTheme from '../components/TodayTheme';
import TrendingBanner from '../components/TrendingBanner';
import WeeklyHotEmisodes from '../components/WeeklyHotEpisodes';
import WeeklySmartPick from '../components/WeeklySmartPick';
import WeeklyPopularChannels from '../components/WeekplyPopularChannels';
import WeeklyPopularHosts from '../components/WeekplyPopularHosts';

function Home() {
  const [fadeClass, setFadeClass] = useState('fade-enter');

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeClass('fade-enter fade-enter-active');
    }, 10);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`space-y-12 ${fadeClass}`}>
      <TrendingBanner />
      <TodayTheme />
      <PopularCategories />
      <WeeklyPopularHosts />
      <WeeklySmartPick />
      <WeeklyPopularChannels />
      <WeeklyHotEmisodes />
    </div>
  );
}

export default Home;
