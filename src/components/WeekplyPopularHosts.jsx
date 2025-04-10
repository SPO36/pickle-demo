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
      <div className="mb-4 font-bold text-2xl">이번주 인기 진행자</div>
      <div className="flex flex-wrap gap-4">
        {hosts.map((host) => (
          <div key={host.id} className="flex flex-col items-center">
            <div className="bg-base-100 border border-base-300 rounded-full w-40 h-40 overflow-hidden">
              {host.image && (
                <img src={host.image} alt={host.name} className="w-full h-full object-cover" />
              )}
            </div>
            <p className="mt-2 text-lg">{host.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WeekplyPopularHosts;
