import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import ChannelCard from '../components/ChannelCard';
import EpisodeCard from '../components/EpisodeCard';
import { supabase } from '../lib/supabase';

const TAGS = ['경제', '주식', '재테크', '글로벌경제', '돈 버는 법', '비즈니스', '경제 브리핑'];

function SearchPage() {
  const [loading, setLoading] = useState(true);
  const [channels, setChannels] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // 인위적인 지연
      // await new Promise((resolve) => setTimeout(resolve, 10000));

      const [channelRes, episodeRes] = await Promise.all([
        supabase.from('channels').select('*'),
        supabase.from('episodes').select('*'),
      ]);
      if (!channelRes.error) setChannels(channelRes.data);
      if (!episodeRes.error) setEpisodes(episodeRes.data);

      setLoading(false);
    };

    fetchData();
  }, []);

  const handleSearch = async () => {
    const keyword = query.trim();
    setLoading(true);

    if (!keyword) {
      const [channelRes, episodeRes] = await Promise.all([
        supabase.from('channels').select('*'),
        supabase.from('episodes').select('*'),
      ]);

      if (channelRes.error || episodeRes.error) {
        console.error('❌ 전체 로딩 실패:', channelRes.error || episodeRes.error);
        setLoading(false);
        return;
      }

      setChannels(channelRes.data);
      setEpisodes(episodeRes.data);
      setLoading(false);
      return;
    }

    const [channelRes, episodeRes] = await Promise.all([
      supabase.from('channels').select('*').ilike('title', `%${keyword}%`),
      supabase.from('episodes').select('*').ilike('title', `%${keyword}%`),
    ]);

    if (channelRes.error || episodeRes.error) {
      console.error('❌ 검색 실패:', channelRes.error || episodeRes.error);
    } else {
      setChannels(channelRes.data);
      setEpisodes(episodeRes.data);
    }

    setLoading(false);
  };

  const toggleLike = async (channelId, current) => {
    const { error } = await supabase
      .from('channels')
      .update({ isLike: !current })
      .eq('id', channelId);

    if (error) {
      console.error('❌ 좋아요 토글 실패:', error.message);
      return;
    }

    setChannels((prev) => prev.map((c) => (c.id === channelId ? { ...c, isLike: !current } : c)));
  };

  const handleSearchWithTag = async (keyword) => {
    const trimmed = keyword.trim();
    if (!trimmed) return;

    setQuery(trimmed);
    setLoading(true);

    const [channelRes, episodeRes] = await Promise.all([
      supabase.from('channels').select('*').ilike('title', `%${trimmed}%`),
      supabase.from('episodes').select('*').ilike('title', `%${trimmed}%`),
    ]);

    if (channelRes.error || episodeRes.error) {
      console.error('❌ 태그 검색 실패:', channelRes.error || episodeRes.error);
    } else {
      setChannels(channelRes.data);
      setEpisodes(episodeRes.data);
    }

    setLoading(false);
  };

  const SkeletonCard = ({ keyVal }) => (
    <div key={keyVal} className="bg-base-300 shadow rounded-xl w-full aspect-[3/4] animate-pulse" />
  );

  return (
    <>
      <div className="relative w-full">
        <input
          type="text"
          placeholder="경제 관련 팟캐스트 찾아줘"
          className="pr-12 rounded-lg w-full input input-lg"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch();
          }}
        />
        <button
          className="top-1/2 right-4 absolute text-gray-500 hover:text-black -translate-y-1/2"
          onClick={handleSearch}
        >
          <Search size={20} />
        </button>
      </div>

      <div className="flex flex-col space-y-12">
        {/* 추천 태그 */}
        <section id="recommend section">
          <h2 className="mb-4 font-bold text-2xl">추천 연관 검색어</h2>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <div
                key={tag}
                className="rounded-full cursor-pointer badge badge-soft badge-lg badge-primary"
                onClick={() => handleSearchWithTag(tag)}
              >
                {tag}
              </div>
            ))}
          </div>
        </section>

        {/* 채널 섹션 */}
        <section id="channel section">
          <h2 className="mb-4 font-bold text-2xl">채널</h2>
          <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard keyVal={`channel-${i}`} />)
              : channels.map((channel) => (
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
          <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard keyVal={`episode-${i}`} />)
              : episodes.map((card) => (
                  <EpisodeCard
                    key={card.id}
                    title={card.title}
                    creator={card.creator}
                    src={card.src}
                  />
                ))}
          </div>
        </section>
      </div>
    </>
  );
}

export default SearchPage;
