import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';
import DynamicHeader from './components/DynamicHeader';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import TagDetailLayoutWrapper from './components/TagDetailLayoutWrapper';
import ZoomProvider from './components/ZoomProvider';
import { OEMProvider } from './context/OEMContext';
import { SplashProvider } from './context/SplashContext';
import AudioBooks from './pages/AudioBooks';
import CategoryDetail from './pages/CategoryDetail';
import DubbingTest from './pages/DubbingTest';
import Home from './pages/Home';
import HostDetail from './pages/HostDetail';
import LikedPage from './pages/LikedPage';
import PlayEpisodeWrapper from './pages/PlayEpisodeWrapper';
import SearchPage from './pages/SearchPage';
import TagTest from './pages/TagTest';
import VoiceSearch from './pages/VoiceSearch';

function AppRoutes() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [headerTitle, setHeaderTitle] = useState('');

  return (
    <>
      <ZoomProvider />
      <OEMProvider>
        <SplashProvider>
          <Routes>
            {/* Home Route */}
            <Route
              path="/"
              element={
                <Layout headerContent={<DynamicHeader />}>
                  <Home />
                </Layout>
              }
            />
            {/* Tag Detail Route */}
            <Route path="/tags/:slug" element={<TagDetailLayoutWrapper />} />

            {/* Tag Test Route */}
            <Route path="/tagTest" element={<TagTest />} />

            {/* AudioBooks Route */}
            <Route
              path="/audiobooks"
              element={
                <Layout headerContent={<DynamicHeader centerText={t('page.audio_book')} />}>
                  <AudioBooks />
                </Layout>
              }
            />

            <Route path="/dubbing" element={<DubbingTest />} />

            {/* Host Detail Route */}
            <Route
              path="/host/:slug"
              element={
                <Layout headerContent={<DynamicHeader centerText=" " />}>
                  <HostDetail />
                </Layout>
              }
            />
            {/* Episode Detail (Play Page) Route */}
            <Route
              path="/episode/:id/:themeSlug?"
              element={
                <Layout headerContent={<DynamicHeader centerText=" " />}>
                  <PlayEpisodeWrapper />
                </Layout>
              }
            />

            {/* Liked Route */}
            <Route
              path="/likes"
              element={
                <Layout headerContent={<DynamicHeader centerText={t('page.library')} />}>
                  <LikedPage />
                </Layout>
              }
            />
            {/* Voice Search Route */}
            <Route
              path="/voiceSearch"
              element={
                <Layout headerContent={<DynamicHeader centerText=" " />}>
                  <VoiceSearch />
                </Layout>
              }
            />
            {/* Category Detail Route */}
            <Route
              path="/categories/:slug"
              element={
                <Layout headerContent={<DynamicHeader centerText={t('page.category')} />}>
                  <CategoryDetail />
                </Layout>
              }
            />
            {/* SearchPage Route */}
            <Route
              path="/search"
              element={
                <Layout headerContent={<DynamicHeader centerText=" " />}>
                  <SearchPage />
                </Layout>
              }
            />
            {/* Channel Route */}
            <Route
              path="/channel/:slug"
              element={
                <Layout headerContent={<DynamicHeader centerText=" " />}>
                  <CategoryDetail />
                </Layout>
              }
            />
          </Routes>
        </SplashProvider>
      </OEMProvider>
    </>
  );
}

// 새로운 DynamicLogo 컴포넌트
function DynamicLogo() {
  const [theme, setTheme] = useState(() => localStorage.getItem('siteTheme') || 'dark');

  // 테마 변경을 감지하기 위한 effect
  useEffect(() => {
    const handleStorageChange = () => {
      setTheme(localStorage.getItem('siteTheme') || 'dark');
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <img
      src={theme === 'dark' ? '/logo_new_dark.png' : '/logo_new_light.png'}
      alt="Pickle Logo"
      className="h-5 object-contain"
    />
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
