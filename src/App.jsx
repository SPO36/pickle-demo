import { Menu, Mic, Search } from 'lucide-react';
import { useState } from 'react';
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';
import DynamicHeader from './components/DynamicHeader';
import Layout from './components/Layout';
import TagDetailLayoutWrapper from './components/TagDetailLayoutWrapper';
import Home from './pages/Home';
import MenuPage from './pages/MenuPage';
import SearchPage from './pages/SearchPage';
import VoiceSearch from './pages/VoiceSearch';

function AppRoutes() {
  const navigate = useNavigate();
  const [headerTitle, setHeaderTitle] = useState('');

  return (
    <Routes>
      {/* Home Route */}
      <Route
        path="/"
        element={
          <Layout
            headerContent={
              <DynamicHeader
                leftIcon={{
                  icon: <Mic size={24} />,
                  onClick: () => navigate('/voiceSearch'),
                }}
                rightIcons={[
                  {
                    icon: <Search size={24} />,
                    onClick: () => navigate('/search'),
                  },
                  {
                    icon: <Menu size={24} />,
                    onClick: () => navigate('/menu'),
                  },
                ]}
              />
            }
          >
            <Home />
          </Layout>
        }
      />
      {/* Tag Detail Route */}
      <Route path="/tags/:slug" element={<TagDetailLayoutWrapper />} />

      {/* Voice Search Route */}
      <Route
        path="/voiceSearch"
        element={
          <Layout headerContent={<DynamicHeader centerText=" " />}>
            <VoiceSearch />
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

      {/* MenuPage Route */}
      <Route
        path="/menu"
        element={
          <Layout headerContent={<DynamicHeader centerText=" " />}>
            <MenuPage />
          </Layout>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
