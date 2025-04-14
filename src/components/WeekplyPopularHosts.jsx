import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

function WeekplyPopularHosts() {
  const [hosts, setHosts] = useState([]);

  useEffect(() => {
    async function fetchHosts() {
      const { data, error } = await supabase.from('hosts').select('*');
      if (error) console.error('❌ Error loading hosts:', error.message);
      else setHosts(data);
    }

    fetchHosts();
  }, []);

  return (
    <div>
      {/* 타이틀 */}
      <div className="mb-4 font-bold text-2xl">
        {hosts.length === 0 ? (
          <div className="bg-base-300 rounded-xl w-40 h-8 animate-pulse" />
        ) : (
          '이번주 인기 진행자'
        )}
      </div>

      {/* 호스트 리스트 or 스켈레톤 */}
      <div className="flex gap-4 overflow-x-auto scrollbar-hide">
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
              <div key={host.id} className="flex flex-col flex-shrink-0 items-center">
                <div className="bg-base-100 border border-base-300 rounded-full w-40 h-40 overflow-hidden">
                  {host.image && (
                    <img src={host.image} alt={host.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <p className="mt-2 text-lg whitespace-nowrap">{host.name}</p>
              </div>
            ))}
      </div>
    </div>
  );
}

export default WeekplyPopularHosts;
