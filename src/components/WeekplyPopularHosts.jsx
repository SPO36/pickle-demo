import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function WeeklyPopularHosts() {
  const { t } = useTranslation();
  const [hosts, setHosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchHosts() {
      const { data, error } = await supabase
        .from('hosts')
        .select('*')
        .order('no', { ascending: true });
      if (error) console.error('❌ Error loading hosts:', error.message);
      setHosts(data.filter((host) => typeof host.no === 'number'));
    }

    fetchHosts();
  }, []);

  function showToast(message = 'test') {
    const toast = document.createElement('div');
    toast.className =
      'toast toast-top toast-center z-50 fixed top-4 transition-opacity duration-300';
    toast.innerHTML = `
      <div class="shadow-lg text-white alert alert-error">
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('opacity-0');
      setTimeout(() => toast.remove(), 500);
    }, 2000);
  }

  return (
    <div>
      {/* 타이틀 */}
      <div className="mb-2 font-semibold text-gray-500 text-lg">
        {hosts.length === 0 ? (
          <div className="bg-base-300 rounded-xl w-40 h-8 animate-pulse" />
        ) : (
          t('sections.hot_people')
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
                onClick={() => {
                  if (host.isContents === 'no') {
                    showToast(`${host.name}의 콘텐츠가 아직 준비되지 않았습니다`);
                    return;
                  }
                  navigate(`/host/${host.slug}`);
                }}
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

export default WeeklyPopularHosts;
