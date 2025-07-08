import { useEffect, useRef, useState } from 'react';
import PlayerBar from '../components/PlayBar';
import PopularCategories from '../components/PopularCategories';
import TodayTheme from '../components/TodayTheme';
import WeeklySmartPick from '../components/WeeklySmartPick';
import WeeklyPopularChannels from '../components/WeekplyPopularChannels';
import WeeklyPopularHosts from '../components/WeekplyPopularHosts';
import MenuPage from './MenuPage';

function Home() {
  // 세션 스토리지를 확인해서 스플래시를 보여줄지 결정
  const [splashVisible, setSplashVisible] = useState(() => {
    return !sessionStorage.getItem('splashShown');
  });
  const [contentVisible, setContentVisible] = useState(() => {
    return sessionStorage.getItem('splashShown') === 'true';
  });
  const splashRef = useRef();

  useEffect(() => {
    // 이미 스플래시를 본 경우 바로 리턴
    if (sessionStorage.getItem('splashShown')) {
      return;
    }

    document.body.style.overflow = 'hidden';

    const t1 = setTimeout(() => {
      if (splashRef.current) {
        splashRef.current.style.opacity = '0';
        splashRef.current.style.pointerEvents = 'none';
      }
    }, 1200);

    const t2 = setTimeout(() => {
      setSplashVisible(false);
      setContentVisible(true);
      document.body.style.overflow = '';
      // 스플래시를 봤다는 것을 세션 스토리지에 저장
      sessionStorage.setItem('splashShown', 'true');
    }, 1800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <>
      {splashVisible && (
        <div
          ref={splashRef}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: '#1D232A',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            opacity: 1,
            transition: 'opacity 0.6s ease-in-out',
            pointerEvents: 'auto',
          }}
        >
          <img
            src="/Pickle_logo.svg"
            alt="Pickle Logo"
            style={{
              width: '160px',
              height: '160px',
              animation: 'logoAppear 1s ease-out forwards',
            }}
          />
          <style>{`
            @keyframes logoAppear {
              0% {
                opacity: 0;
                transform: scale(0.8);
              }
              100% {
                opacity: 1;
                transform: scale(1);
              }
            }
          `}</style>
        </div>
      )}

      <div className="drawer drawer-end">
        <input id="menu-drawer" type="checkbox" className="drawer-toggle" />
        <div
          className="space-y-8 pb-20 drawer-content"
          style={{
            opacity: contentVisible ? 1 : 0,
            transform: contentVisible ? 'none' : 'translateY(24px)',
            transition: 'all 0.6s ease-out',
          }}
        >
          <WeeklyPopularHosts />
          <WeeklySmartPick />
          <WeeklyPopularChannels />
          <TodayTheme />
          <PopularCategories />
          <PlayerBar />
        </div>

        <div className="z-50 drawer-side">
          <label htmlFor="menu-drawer" className="drawer-overlay"></label>
          <div className="bg-base-100 p-4 w-80 min-h-full">
            <div className="flex justify-end mb-2">
              <label htmlFor="menu-drawer" className="btn btn-sm btn-circle">
                ✕
              </label>
            </div>
            <MenuPage />
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
