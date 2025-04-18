import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EpisodeCard from '../components/EpisodeCard';
import { supabase } from '../lib/supabase';

function HostDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [host, setHost] = useState(null);
  const [episodes, setEpisodes] = useState([]);

  useEffect(() => {
    async function fetchHostAndEpisodes() {
      // 1. 호스트 정보 가져오기
      const { data: hostData, error: hostError } = await supabase
        .from('hosts')
        .select('*')
        .eq('slug', slug)
        .single();

      if (hostError) {
        console.error('❌ Error fetching host:', hostError.message);
        return;
      }

      setHost(hostData);

      // 2. 전체 에피소드 가져오기
      const { data: allEpisodes, error: episodeError } = await supabase
        .from('episodes')
        .select('*');

      if (episodeError) {
        console.error('❌ Error fetching episodes:', episodeError.message);
        return;
      }

      // 3. 프론트에서 host.id로 필터링
      const filtered = allEpisodes.filter(
        (ep) => Array.isArray(ep.host_ids) && ep.host_ids.includes(hostData.id)
      );

      setEpisodes(filtered);
    }

    fetchHostAndEpisodes();
  }, [slug]);

  if (!host) return <div className="p-4">로딩 중...</div>;

  return (
    <div>
      {/* 호스트 정보 */}
      {/* <h1 className="mb-4 font-bold text-2xl">{host.name}</h1> */}
      {/* {host.image && (
        <img src={host.image} alt={host.name} className="rounded-full w-40 h-40 object-cover" />
      )} */}
      {/* <p className="mt-4 text-base">{host.description || '소개 정보가 없습니다.'}</p> */}

      {/* 출연 에피소드 */}
      {episodes.length > 0 && (
        <div>
          <h2 className="mb-4 font-bold text-xl">#{host.name}</h2>
          <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {episodes.map((ep) => (
              <div key={ep.id} onClick={() => navigate(`/episode/${ep.slug}`)}>
                <EpisodeCard
                  id={ep.id}
                  title={ep.title}
                  creator={ep.creator}
                  src={ep.src}
                  slug={ep.slug}
                  summary={ep.summary}
                  thumbnail={ep.thumbnail}
                  // 필요한 prop 더 추가 가능
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default HostDetail;
