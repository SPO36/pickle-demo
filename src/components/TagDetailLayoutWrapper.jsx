import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DynamicHeader from '../components/DynamicHeader';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';
import TagDetail from '../pages/TagDetail';

export default function TagDetailLayoutWrapper() {
  const { slug } = useParams();
  const [themeTitle, setThemeTitle] = useState('');

  useEffect(() => {
    async function fetchTitle() {
      const { data, error } = await supabase
        .from('theme')
        .select('title')
        .eq('slug', slug)
        .single();

      if (data) {
        setThemeTitle(data.title);
      }
    }

    fetchTitle();
  }, [slug]);

  return (
    <Layout headerContent={<DynamicHeader centerText={themeTitle || '로딩 중...'} />}>
      <TagDetail />
    </Layout>
  );
}
