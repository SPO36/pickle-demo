import { useEffect, useState } from 'react';
import PopularCategories from '../components/PopularCategories';
import TodayTheme from '../components/TodayTheme';
import TrendingBanner from '../components/TrendingBanner';
import WeeklyHotEmisodes from '../components/WeeklyHotEpisodes';
import WeeklySmartPick from '../components/WeeklySmartPick';
import WeeklyPopularChannels from '../components/WeekplyPopularChannels';
import WeeklyPopularHosts from '../components/WeekplyPopularHosts';
import MenuPage from './MenuPage';

function Home() {
  const [fadeClass, setFadeClass] = useState('fade-enter');

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeClass('fade-enter fade-enter-active');
    }, 10);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="drawer drawer-end">
      <input id="menu-drawer" type="checkbox" className="drawer-toggle" />
      <div className={`drawer-content space-y-12 ${fadeClass}`}>
        <TrendingBanner />
        <WeeklyPopularHosts />
        <TodayTheme />
        <PopularCategories />
        <WeeklySmartPick />
        <WeeklyPopularChannels />
        <WeeklyHotEmisodes />
      </div>
      <div className="z-50 drawer-side">
        <label htmlFor="menu-drawer" className="drawer-overlay"></label>
        <div className="bg-base-100 p-4 w-80 min-h-full">
          <div className="flex justify-end mb-2">
            <label htmlFor="menu-drawer" className="btn btn-sm btn-circle">
              ✕
            </label>
          </div>
          <MenuPage />
        </div>
      </div>
    </div>
  );
}

export default Home;
