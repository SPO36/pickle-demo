import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function WeekplyPopularHosts() {
  const [hosts, setHosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchHosts() {
      const { data, error } = await supabase
        .from('hosts')
        .select('*')
        .order('no', { ascending: true });
      if (error) console.error('❌ Error loading hosts:', error.message);
      else setHosts(data);
    }

    fetchHosts();
  }, []);

  return (
    <div>
      {/* 타이틀 */}
      <div className="mb-2 font-semibold text-gray-500 text-lg">
        {hosts.length === 0 ? (
          <div className="bg-base-300 rounded-xl w-40 h-8 animate-pulse" />
        ) : (
          '뜨는 사람들'
        )}
      </div>

      {/* 호스트 리스트 or 스켈레톤 */}
      <div className="flex gap-3 overflow-x-auto cursor-pointer scrollbar-hide">
        {hosts.length === 0
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col flex-shrink-0 items-center gap-2">
                {/* 동그란 스켈레톤 */}
                <div className="bg-base-300 rounded-full w-40 h-40 animate-pulse" />
                {/* 이름 자리 */}
                <div className="bg-base-300 rounded-xl w-20 h-7 animate-pulse" />
              </div>
            ))
          : hosts.map((host) => (
              <div
                key={host.id}
                className="flex flex-col flex-shrink-0 items-center"
                onClick={() => navigate(`/host/${host.slug}`)}
              >
                <div className="rounded-full w-40 h-40 overflow-hidden">
                  {host.image && (
                    <img src={host.image} alt={host.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <p className="mt-2 text-md whitespace-nowrap">{host.name}</p>
              </div>
            ))}
      </div>
    </div>
  );
}

export default WeekplyPopularHosts;
