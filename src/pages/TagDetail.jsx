import Lottie from 'lottie-react';
import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import animationData from '../assets/VoiceSearch_bg2.json';
import ChannelCard from '../components/ChannelCard';
import EpisodeCard from '../components/EpisodeCard';
import { supabase } from '../lib/supabase';

function TagDetail() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const [theme, setTheme] = useState(null);
  const [tab, setTab] = useState('episode');
  const [channels, setChannels] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [sort, setSort] = useState('popular');
  const [fadeClass, setFadeClass] = useState('fade-enter');
  const sortLabels = {
    latest: t('label.latest'),
    popular: t('label.popularity'),
    az: t('label.alphabetical'),
  };

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
    if (!theme) return; // 에러 방지

    const fetchData = async () => {
      if (tab === 'channel') {
        const { data: episodes, error: episodeErr } = await supabase
          .from('episodes')
          .select('id, channel_id')
          .in('id', theme.episode_ids || []);

        if (episodeErr) {
          console.error('❌ 에피소드 로딩 실패:', episodeErr.message);
          return;
        }

        const channelIds = [...new Set(episodes.map((ep) => ep.channel_id).filter(Boolean))];
        console.log('📡 추출된 channelIds', channelIds);

        const { data: channels, error: channelErr } = await supabase
          .from('channels')
          .select('*')
          .in('id', channelIds);

        if (channelErr) {
          console.error('❌ 채널 로딩 실패:', channelErr.message);
        } else {
          setChannels(channels || []);
        }
      } else {
        const { data, error } = await supabase
          .from('episodes')
          .select('id, title, likes, src, creator, audioFile, audioFile_dubbing') // ← audioFile_dubbing 명시!
          .in('id', theme.episode_ids || []);
        if (!error) {
          setEpisodes(data || []);
          // console.log('🎯 theme.episode_ids', theme.episode_ids);
          // console.log('📺 불러온 episodes', data);
        }
      }
    };

    fetchData();
  }, [tab, theme]);

  const sortedItems = (tab === 'channel' ? [...channels] : [...episodes]).sort((a, b) => {
    if (sort === 'latest') {
      return new Date(b.created_at) - new Date(a.created_at);
    }
    if (sort === 'popular') {
      return (
        (b.audioFile_dubbing ? 1 : 0) - (a.audioFile_dubbing ? 1 : 0) ||
        (b.likes || 0) - (a.likes || 0)
      );
    }
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
    <>
      {slug === 'live' ? (
        <div className="flex flex-col justify-center items-center bg-base-100 w-full min-h-[50vh]">
          <div className="w-full">
            <img src="/TagDetail_UI.png" alt="AI Curation" className="w-full object-cover" />
          </div>
        </div>
      ) : (
        <>
          <div className={fadeClass}>
            {slug === 'hyundai-heritage' && (
              <div className="bg-base-200 mb-6 p-4 rounded-lg text-base-content leading-relaxed">
                <p className="text-md">
                  현대자동차 디자인의 고객 중심 철학과 브랜드 정체성을 기반으로 현재와 미래로
                  이어지는 여정을 담은 위대한 유산, 자동차.
                </p>
                <p className="text-md">디자인 개발 과정에서의 현실적인 고민과 도전을 만나보세요.</p>
              </div>
            )}

            {/* 탭 */}
            <div role="tablist" className="mb-6 tabs-border tabs">
              <button
                className={`tab text-lg py-3 h-auto min-h-0 ${
                  tab === 'episode' ? 'tab-active' : ''
                }`}
                onClick={() => setTab('episode')}
              >
                {t('buttons.episode')}
              </button>
              <button
                className={`tab text-lg py-3 h-auto min-h-0 ${
                  tab === 'channel' ? 'tab-active' : ''
                }`}
                onClick={() => setTab('channel')}
              >
                {t('buttons.channel')}
              </button>
            </div>

            {/* 정렬 드롭다운 */}
            <div className="mb-4 dropdown">
              <div
                tabIndex={0}
                role="button"
                className="flex items-center gap-2 bg-base-100 px-4 py-2 border-base-300 text-sm btn"
              >
                {sortLabels[sort]}
                <ChevronDown size={18} />
              </div>
              <ul
                tabIndex={0}
                className="z-10 bg-base-100 shadow-sm p-2 rounded-box w-40 dropdown-content menu"
              >
                <li>
                  <a onClick={() => setSort('latest')}>{t('label.latest')}</a>
                </li>
                <li>
                  <a onClick={() => setSort('popular')}>{t('label.popularity')}</a>
                </li>
                <li>
                  <a onClick={() => setSort('az')}>{t('label.alphabetical')}</a>
                </li>
              </ul>
            </div>

            {/* 카드 목록 */}
            <div
              className={`gap-4 grid ${
                tab === 'channel'
                  ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
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
                  <EpisodeCard
                    key={item.id}
                    id={item.id}
                    src={item.src}
                    title={item.title}
                    creator={item.creator}
                    themeSlug={slug}
                    audioFile={item.audioFile}
                  />
                )
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default TagDetail;
