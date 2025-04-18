import Lottie from 'lottie-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import animationData from '../assets/VoiceSearch_bg2.json';
import ChannelCard from '../components/ChannelCard';
import EpisodeCard from '../components/EpisodeCard';
import { supabase } from '../lib/supabase';

function TagDetail() {
  const { slug } = useParams();
  const [theme, setTheme] = useState(null);
  const [tab, setTab] = useState('channel');
  const [channels, setChannels] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [fadeClass, setFadeClass] = useState('fade-enter');

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeClass('fade-enter fade-enter-active');
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  // 좋아요 토글 함수
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

  useEffect(() => {
    const fetchTheme = async () => {
      const { data, error } = await supabase.from('themes').select('*').eq('slug', slug).single();
      if (error) {
        console.error('❌ 테마 로딩 실패:', error.message);
      } else {
        setTheme(data);
      }
    };
    fetchTheme();
  }, [slug]);

  useEffect(() => {
    const fetchData = async () => {
      if (tab === 'channel') {
        const { data } = await supabase.from('channels').select('*');
        setChannels(data || []);
      } else {
        const { data } = await supabase.from('episodes').select('*');
        setEpisodes(data || []);
      }
    };
    fetchData();
  }, [tab]);

  // 로딩 중일 때 애니메이션만 표시
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
      {/* 탭 */}
      <div role="tablist" className="mb-6 tabs-border tabs">
        <button
          className={`tab text-lg py-3 h-auto min-h-0 ${tab === 'channel' ? 'tab-active' : ''}`}
          onClick={() => setTab('channel')}
        >
          채널
        </button>
        <button
          className={`tab text-lg py-3 h-auto min-h-0 ${tab === 'episode' ? 'tab-active' : ''}`}
          onClick={() => setTab('episode')}
        >
          에피소드
        </button>
      </div>

      {/* 카드 목록 */}
      <div
        className={`gap-4 grid ${
          tab === 'channel'
            ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
        }`}
      >
        {tab === 'channel' &&
          channels.map((item) => (
            <ChannelCard
              key={item.id}
              src={item.src}
              title={item.title}
              creator={item.creator}
              liked={item.isLike}
              onToggleLike={() => toggleLike(item.id, item.isLike)}
            />
          ))}

        {tab === 'episode' &&
          episodes.map((item) => (
            <EpisodeCard key={item.id} src={item.src} title={item.title} creator={item.creator} />
          ))}
      </div>
    </div>
  );
}

export default TagDetail;
