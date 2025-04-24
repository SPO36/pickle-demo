import { useEffect, useState } from 'react';
import ChannelCard from '../components/ChannelCard';
import EpisodeCard from '../components/EpisodeCard';
import { supabase } from '../lib/supabase';

export default function LikedPage() {
  const [tab, setTab] = useState('channel');
  const [likedChannels, setLikedChannels] = useState([]);
  const [likedEpisodes, setLikedEpisodes] = useState([]);

  useEffect(() => {
    if (tab === 'channel') {
      fetchLikedChannels();
    } else {
      fetchLikedEpisodes();
    }
  }, [tab]);

  async function fetchLikedChannels() {
    const { data, error } = await supabase.from('channels').select('*').eq('isLike', true);
    if (error) {
      console.error('❌ 채널 불러오기 오류:', error.message);
    } else {
      setLikedChannels(data);
    }
  }

  async function fetchLikedEpisodes() {
    const { data, error } = await supabase.from('episodes').select('*').eq('isLike', true);
    if (error) {
      console.error('❌ 에피소드 불러오기 오류:', error.message);
    } else {
      setLikedEpisodes(data);
    }
  }

  // 좋아요 토글 함수
  async function toggleLikeChannel(id, current) {
    const { error } = await supabase.from('channels').update({ isLike: !current }).eq('id', id);

    if (error) {
      console.error('❌ 채널 좋아요 토글 실패:', error.message);
    } else {
      setLikedChannels((prev) => prev.filter((c) => c.id !== id));
    }
  }

  async function toggleLikeEpisode(id, current) {
    const { error } = await supabase.from('episodes').update({ isLike: !current }).eq('id', id);

    if (error) {
      console.error('❌ 에피소드 좋아요 토글 실패:', error.message);
    } else {
      setLikedEpisodes((prev) => prev.filter((e) => e.id !== id));
    }
  }

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

      {(tab === 'channel' && likedChannels.length === 0) ||
      (tab === 'episode' && likedEpisodes.length === 0) ? (
        <div className="mb-4 text-gray-400">
          좋아요한 {tab === 'channel' ? '채널' : '에피소드'}가 없습니다.
        </div>
      ) : null}

      {/* 카드 목록 */}
      <div
        className={`gap-4 grid ${
          tab === 'channel'
            ? 'gap-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 w-full'
            : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
        }`}
      >
        {tab === 'channel' &&
          likedChannels.map((item) => (
            <ChannelCard
              key={item.id}
              src={item.src}
              title={item.title}
              creator={item.creator}
              liked={item.isLike}
              onToggleLike={() => toggleLikeChannel(item.id, item.isLike)}
            />
          ))}

        {tab === 'episode' &&
          likedEpisodes.map((item) => (
            <EpisodeCard
              key={item.id}
              src={item.src}
              title={item.title}
              creator={item.creator}
              liked={item.isLike}
              onToggleLike={() => toggleLikeEpisode(item.id, item.isLike)}
            />
          ))}
      </div>
    </div>
  );
}
