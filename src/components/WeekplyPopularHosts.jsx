import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function WeeklyPopularHosts() {
  const { t, i18n } = useTranslation();
  const [hosts, setHosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchHosts() {
      // i18n이 완전히 초기화되지 않았다면 기다림
      if (!i18n.isInitialized) {
        return;
      }

      // 명시적으로 영어를 기본값으로 설정
      const currentLang = i18n.language === 'ko' ? 'ko' : 'en';

      console.log('🌐 Current language for hosts:', currentLang); // 디버깅용

      const { data, error } = await supabase
        .from('hosts')
        .select('*')
        .eq('language', currentLang)
        .order('no', { ascending: true });

      if (error) console.error('❌ Error loading hosts:', error.message);
      setHosts(data ? data.filter((host) => typeof host.no === 'number') : []);
    }

    fetchHosts();
  }, [i18n.language, i18n.isInitialized]);

  // 언어 변경 시 즉시 반영되도록 추가 useEffect
  useEffect(() => {
    if (i18n.isInitialized && hosts.length > 0) {
      // 언어가 변경되면 호스트 목록을 다시 로드
      setHosts([]); // 먼저 비워서 로딩 상태 표시
    }
  }, [i18n.language]);

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
      <div className="flex gap-1 overflow-x-auto cursor-pointer scrollbar-hide">
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
