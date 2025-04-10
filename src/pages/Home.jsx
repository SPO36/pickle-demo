import HostAvatarList from '../components/HostAvatarList';
import PodcastList from '../components/PodcastList';
import PopularCategories from '../components/PopularCategories';
import TodayTheme from '../components/TodayTheme';
import TrendingBanner from '../components/TrendingBanner';

function Home() {
  return (
    <>
      <TrendingBanner />
      <TodayTheme />
      <PopularCategories />
      <HostAvatarList />
      <PodcastList />
    </>
  );
}

export default Home;
