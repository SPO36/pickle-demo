import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ChannelCard from '../components/ChannelCard';
import { supabase } from '../lib/supabase';

function CategoryDetail() {
  const { slug } = useParams();
  const [tab, setTab] = useState('channel');
  const [channels, setChannels] = useState([]);
  const [sort, setSort] = useState('latest');
  const [fadeClass, setFadeClass] = useState('fade-enter');

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeClass('fade-enter fade-enter-active');
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchChannels = async () => {
      const { data, error } = await supabase.from('channel').select('*');
      if (error) {
        console.error('❌ 채널 로딩 실패:', error.message);
      } else {
        setChannels(data || []);
      }
    };
    fetchChannels();
  }, []);

  const toggleLike = async (channelId, current) => {
    const { error } = await supabase
      .from('channel')
      .update({ isLike: !current })
      .eq('id', channelId);

    if (error) {
      console.error('❌ 좋아요 토글 실패:', error.message);
    } else {
      setChannels((prev) => prev.map((c) => (c.id === channelId ? { ...c, isLike: !current } : c)));
    }
  };

  // 정렬 처리
  const sortedChannels = [...channels].sort((a, b) => {
    if (sort === 'latest') {
      return new Date(b.created_at) - new Date(a.created_at);
    } else if (sort === 'popular') {
      return b.likes - a.likes;
    } else if (sort === 'az') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  return (
    <div className={fadeClass}>
      {/* 탭 UI */}
      <div role="tablist" className="flex flex-wrap gap-2 mb-6 tabs-border tabs">
        {[
          { label: '전체', value: 'channel' },
          { label: '시사', value: 'current' },
          { label: '경제', value: 'economy' },
          { label: '비즈니스', value: 'business' },
          { label: '일상/토크', value: 'daily' },
          { label: '예능', value: 'entertainment' },
          { label: '스포츠', value: 'sports' },
          { label: '키즈', value: 'kids' },
          { label: '어학', value: 'language' },
        ].map(({ label, value }) => (
          <button
            key={value}
            className={`tab text-lg py-3 h-auto min-h-0 ${tab === value ? 'tab-active' : ''}`}
            onClick={() => setTab(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 드롭다운: 왼쪽 정렬 */}
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

      {/* 채널 카드 목록 */}
      <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
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
