import { Mic } from 'lucide-react';
import { useState } from 'react';
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';
import DynamicHeader from './components/DynamicHeader';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import TagDetailLayoutWrapper from './components/TagDetailLayoutWrapper';
import ZoomProvider from './components/ZoomProvider';
import CategoryDetail from './pages/CategoryDetail';
import Home from './pages/Home';
import HostDetail from './pages/HostDetail';
import LikedPage from './pages/LikedPage';
import PlayEpisodeWrapper from './pages/PlayEpisodeWrapper';
import SearchPage from './pages/SearchPage';
import VoiceSearch from './pages/VoiceSearch';

function AppRoutes() {
  const navigate = useNavigate();
  const [headerTitle, setHeaderTitle] = useState('');

  return (
    <>
      <ZoomProvider />
      <Routes>
        {/* Home Route */}
        <Route
          path="/"
          element={
            <Layout
              headerContent={
                <DynamicHeader
                  leftIcon={{
                    icon: (
                      <div
                        onClick={() => navigate('/voiceSearch')}
                        className="disco-border-btn cursor-pointer btn btn-circle btn-ghost"
                      >
                        <Mic size={24} className="text-white" />
                      </div>
                    ),
                    onClick: () => navigate('/voiceSearch'),
                  }}
                />
              }
            >
              <Home />
            </Layout>
          }
        />
        {/* Tag Detail Route */}
        <Route path="/tags/:slug" element={<TagDetailLayoutWrapper />} />
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
            <Layout headerContent={<DynamicHeader centerText="보관함" />}>
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
            <Layout headerContent={<DynamicHeader centerText="카테고리" />}>
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
    </>
  );
}

function App() {
  // useEffect(() => {
  //   const savedZoom = localStorage.getItem('zoomLevel');
  //   if (savedZoom) {
  //     document.documentElement.style.zoom = parseFloat(savedZoom);
  //   }
  // }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
