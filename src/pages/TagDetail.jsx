import Lottie from 'lottie-react';
import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import animationData from '../assets/VoiceSearch_bg2.json';
import ChannelCard from '../components/ChannelCard';
import EpisodeCard from '../components/EpisodeCard';
import { supabase } from '../lib/supabase';

function TagDetail() {
  const { slug } = useParams();
  const [theme, setTheme] = useState(null);
  const [tab, setTab] = useState('episode');
  const [channels, setChannels] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [sort, setSort] = useState('az');
  const [fadeClass, setFadeClass] = useState('fade-enter');

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeClass('fade-enter fade-enter-active');
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const toggleLike = async (channelId, current) => {
    const { error } = await supabase
      .from('channels')
      .update({ isLike: !current })
      .eq('id', channelId);
    if (!error) {
      setChannels((prev) => prev.map((c) => (c.id === channelId ? { ...c, isLike: !current } : c)));
    }
  };

  useEffect(() => {
    const fetchTheme = async () => {
      const { data, error } = await supabase.from('themes').select('*').eq('slug', slug).single();
      if (!error) setTheme(data);
    };
    fetchTheme();
  }, [slug]);

  useEffect(() => {
    const fetchData = async () => {
      if (!theme) return;

      if (tab === 'channel') {
        const { data } = await supabase
          .from('channels')
          .select('*')
          .in('id', theme.channel_ids || []);
        setChannels(data || []);
      } else {
        const { data } = await supabase
          .from('episodes')
          .select('*')
          .in('id', theme.episode_ids || []);
        setEpisodes(data || []);
      }
    };

    fetchData();
  }, [tab, theme]);

  const sortedItems = (tab === 'channel' ? [...channels] : [...episodes]).sort((a, b) => {
    if (sort === 'latest') return new Date(b.created_at) - new Date(a.created_at);
    if (sort === 'popular') return (b.likes || 0) - (a.likes || 0);
    if (sort === 'az') {
      return (a.title || '').localeCompare(b.title || '', 'ko-KR-u-kf-upper', {
        sensitivity: 'base',
        ignorePunctuation: true,
      });
    }
    return 0;
  });

  if (!theme) {
    return (
      <div className="flex justify-center items-center p-6">
        <div className="flex flex-col items-center w-400 h-400">
          <Lottie style={{ fill: 'black' }} animationData={animationData} loop={true} />
          <div>로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={fadeClass}>
      {slug === 'hyundai-heritage' && (
        <div className="bg-base-200 mb-6 p-4 rounded-lg text-base-content leading-relaxed">
          <p className="text-md">
            현대자동차 디자인의 고객 중심 철학과 브랜드 정체성을 기반으로 현재와 미래로 이어지는
            여정을 담은 위대한 유산, 자동차.
          </p>
          <p className="text-md">디자인 개발 과정에서의 현실적인 고민과 도전을 만나보세요.</p>
        </div>
      )}

      {/* 탭 */}
      <div role="tablist" className="mb-6 tabs-border tabs">
        <button
          className={`tab text-lg py-3 h-auto min-h-0 ${tab === 'episode' ? 'tab-active' : ''}`}
          onClick={() => setTab('episode')}
        >
          에피소드
        </button>
        <button
          className={`tab text-lg py-3 h-auto min-h-0 ${tab === 'channel' ? 'tab-active' : ''}`}
          onClick={() => setTab('channel')}
        >
          채널
        </button>
      </div>

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

      {/* 카드 목록 */}
      <div
        className={`gap-4 grid ${
          tab === 'channel'
            ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}
      >
        {sortedItems.map((item) =>
          tab === 'channel' ? (
            <ChannelCard
              key={item.id}
              src={item.src}
              title={item.title}
              creator={item.creator}
              liked={item.isLike}
              onToggleLike={() => toggleLike(item.id, item.isLike)}
            />
          ) : (
            <EpisodeCard key={item.id} src={item.src} title={item.title} creator={item.creator} />
          )
        )}
      </div>
    </div>
  );
}

export default TagDetail;
