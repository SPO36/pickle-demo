import PopularCategories from '../components/PopularCategories';
import TodayTheme from '../components/TodayTheme';
import TrendingBanner from '../components/TrendingBanner';
import WeeklyHotEmisodes from '../components/WeeklyHotEpisodes';
import WeeklySmartPick from '../components/WeeklySmartPick';
import WeeklyPopularChannels from '../components/WeekplyPopularChannels';
import WeeklyPopularHosts from '../components/WeekplyPopularHosts';

function Home() {
  return (
    <>
      <TrendingBanner />
      <TodayTheme />
      <PopularCategories />
      <WeeklyPopularHosts />
      <WeeklySmartPick />
      <WeeklyPopularChannels />
      <WeeklyHotEmisodes />
    </>
  );
}

export default Home;
