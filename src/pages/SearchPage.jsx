import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import ChannelCard from '../components/ChannelCard';
import EpisodeCard from '../components/EpisodeCard';
import { supabase } from '../lib/supabase';

const TAGS = ['경제', '주식', '재테크', '글로벌경제', '돈 버는 법', '비즈니스', '경제 브리핑'];

function SearchPage() {
  const [channels, setChannels] = useState([]);
  const [episodes, setEpisodes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [channelRes, episodeRes] = await Promise.all([
        supabase.from('channel').select('*'),
        supabase.from('episodes').select('*'),
      ]);

      if (channelRes.error) {
        console.error('❌ 채널 로딩 실패:', channelRes.error.message);
      } else {
        setChannels(channelRes.data);
      }

      if (episodeRes.error) {
        console.error('❌ 에피소드 로딩 실패:', episodeRes.error.message);
      } else {
        setEpisodes(episodeRes.data);
      }
    };

    fetchData();
  }, []);

  const toggleLike = async (channelId, current) => {
    const { error } = await supabase
      .from('channel')
      .update({ isLike: !current })
      .eq('id', channelId);

    if (error) {
      console.error('❌ 좋아요 토글 실패:', error.message);
      return;
    }

    setChannels((prev) => prev.map((c) => (c.id === channelId ? { ...c, isLike: !current } : c)));
  };

  return (
    <>
      <div className="relative w-full">
        <input
          type="text"
          placeholder="경제 관련 팟캐스트 찾아줘"
          className="pr-12 rounded-lg w-full input input-lg"
        />
        <button className="top-1/2 right-4 absolute text-gray-500 hover:text-black -translate-y-1/2">
          <Search size={20} />
        </button>
      </div>

      <div className="flex flex-col space-y-12">
        {/* 추천 태그 */}
        <section id="recommend section">
          <h2 className="mb-4 font-bold text-2xl">추천 연관 검색어</h2>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <div key={tag} className="rounded-full badge badge-soft badge-lg badge-primary">
                {tag}
              </div>
            ))}
          </div>
        </section>

        {/* 채널 섹션 */}
        <section id="channel section">
          <h2 className="mb-4 font-bold text-2xl">채널</h2>
          <div className="flex flex-row gap-4">
            {channels.map((channel) => (
              <ChannelCard
                key={channel.id}
                src={channel.src}
                title={channel.title}
                creator={channel.creator}
                liked={channel.isLike}
                onToggleLike={() => toggleLike(channel.id, channel.isLike)}
              />
            ))}
          </div>
        </section>

        {/* 에피소드 섹션 */}
        <section id="episode section">
          <h2 className="mb-4 font-bold text-2xl">에피소드</h2>
          <div className="flex flex-row gap-4 w-full">
            {episodes.map((card) => (
              <EpisodeCard key={card.id} title={card.title} creator={card.creator} src={card.src} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

export default SearchPage;
