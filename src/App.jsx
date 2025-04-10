import { Menu, Mic, Search } from 'lucide-react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import DynamicHeader from './components/DynamicHeader';
import Layout from './components/Layout';
import Home from './pages/Home';
import TagDetail from './pages/TagDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home Route */}
        <Route
          path="/"
          element={
            <Layout
              headerContent={
                <DynamicHeader
                  leftIcon={<Mic size={24} />}
                  rightIcons={[<Search size={24} />, <Menu size={24} />]}
                />
              }
            >
              <Home />
            </Layout>
          }
        />

        {/* Tag Detail Route */}
        <Route
          path="/tags/:tagId"
          element={
            <Layout headerContent={<DynamicHeader />}>
              <TagDetail />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
