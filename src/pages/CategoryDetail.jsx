import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ChannelCard from '../components/ChannelCard';
import { supabase } from '../lib/supabase';

function CategoryDetail() {
  const { slug } = useParams();
  const [tab, setTab] = useState('all');
  const [channels, setChannels] = useState([]);
  const [sort, setSort] = useState('latest');
  const [fadeClass, setFadeClass] = useState('fade-enter');
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  // 슬러그 기반 탭 설정
  useEffect(() => {
    setTab(slug ?? 'all');
  }, [slug]);

  // 🔙 뒤로가기 시 홈으로 이동
  useEffect(() => {
    const handlePopState = () => {
      navigate('/', { replace: true });
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // 애니메이션 페이드인
  useEffect(() => {
    const timer = setTimeout(() => setFadeClass('fade-enter fade-enter-active'), 50);
    return () => clearTimeout(timer);
  }, []);

  // Supabase 데이터 fetch
  useEffect(() => {
    const fetchData = async () => {
      const [channelRes, categoryRes] = await Promise.all([
        supabase.from('channels').select('*'),
        supabase.from('categories').select('*'),
      ]);

      if (channelRes.error) {
        console.error('❌ 채널 로딩 실패:', channelRes.error.message);
      } else {
        setChannels(channelRes.data || []);
      }

      if (categoryRes.error) {
        console.error('❌ 카테고리 로딩 실패:', categoryRes.error.message);
      } else {
        setCategories(categoryRes.data || []);
      }
    };

    fetchData();
  }, []);

  // 좋아요 토글
  const toggleLike = async (channelId, current) => {
    const { error } = await supabase
      .from('channels')
      .update({ isLike: !current })
      .eq('id', channelId);

    if (error) {
      console.error('❌ 좋아요 토글 실패:', error.message);
    } else {
      setChannels((prev) => prev.map((c) => (c.id === channelId ? { ...c, isLike: !current } : c)));
    }
  };

  // 필터링 + 정렬
  const filteredChannels =
    tab === 'all' ? channels : channels.filter((c) => c.category_slug === tab);

  const sortedChannels = [...filteredChannels].sort((a, b) => {
    if (sort === 'latest') return new Date(b.created_at) - new Date(a.created_at);
    if (sort === 'popular') return b.likes - a.likes;
    if (sort === 'az') return a.title.localeCompare(b.title);
    return 0;
  });

  return (
    <div className={fadeClass}>
      {/* 카테고리 탭 */}
      <div role="tablist" className="flex flex-wrap gap-2 mb-6 tabs-border tabs">
        <button
          key="all"
          className={`tab text-lg py-3 h-auto min-h-0 ${tab === 'all' ? 'tab-active' : ''}`}
          onClick={() => setTab('all')}
        >
          전체
        </button>

        {categories.map((cat) => (
          <button
            key={cat.slug}
            className={`tab text-lg py-3 h-auto min-h-0 ${tab === cat.slug ? 'tab-active' : ''}`}
            onClick={() => navigate(`/categories/${cat.slug}`)}
          >
            {cat.title}
          </button>
        ))}
      </div>

      {/* 정렬 드롭다운 */}
      <div className="mb-4 dropdown">
        <div
          tabIndex={0}
          role="button"
          className="flex items-center gap-2 bg-base-100 px-4 py-2 border-base-300 text-sm btn"
        >
          {sort === 'latest' && '최신순'}
          {sort === 'popular' && '인기순'}
          {sort === 'az' && '가나다순'}
          <ChevronDown size={18} />
        </div>
        <ul
          tabIndex={0}
          className="z-10 bg-base-100 shadow-sm p-2 rounded-box w-40 dropdown-content menu"
        >
          <li>
            <a onClick={() => setSort('latest')}>최신순</a>
          </li>
          <li>
            <a onClick={() => setSort('popular')}>인기순</a>
          </li>
          <li>
            <a onClick={() => setSort('az')}>가나다순</a>
          </li>
        </ul>
      </div>

      {/* 채널 카드 */}
      <div className="gap-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 w-full">
        {sortedChannels.map((item) => (
          <ChannelCard
            key={item.id}
            src={item.src}
            title={item.title}
            creator={item.creator}
            liked={item.isLike}
            onToggleLike={() => toggleLike(item.id, item.isLike)}
          />
        ))}
      </div>
    </div>
  );
}

export default CategoryDetail;
