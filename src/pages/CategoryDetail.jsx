import { useState } from 'react';
import { useParams } from 'react-router-dom';
import ChannelCard from '../components/ChannelCard';
import EpisodeCard from '../components/EpisodeCard';

function CategoryDetail() {
  const { slug } = useParams();
  const [theme, setTheme] = useState(null);
  const [tab, setTab] = useState('channel');
  const [channels, setChannels] = useState([]);
  const [episodes, setEpisodes] = useState([]);

  return (
    <div>
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
              liked={item.isLike} // ✅ Supabase 상태 반영
              onToggleLike={() => toggleLike(item.id, item.isLike)} // ✅ 토글 연결
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
