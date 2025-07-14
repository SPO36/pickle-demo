import { useEffect, useRef, useState } from 'react';
import PlayerBar from '../components/PlayBar';
import PopularCategories from '../components/PopularCategories';
import TodayTheme from '../components/TodayTheme';
import WeeklySmartPick from '../components/WeeklySmartPick';
import WeeklyPopularChannels from '../components/WeekplyPopularChannels';
import WeeklyPopularHosts from '../components/WeekplyPopularHosts';
import { useSplash } from '../context/SplashContext';
import MenuPage from './MenuPage';

function Home() {
  const { hasShownSplash, setHasShownSplash } = useSplash(); // 추가
  const [splashVisible, setSplashVisible] = useState(!hasShownSplash);
  const [contentVisible, setContentVisible] = useState(hasShownSplash);
  const splashRef = useRef();

  useEffect(() => {
    if (hasShownSplash) {
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
      setHasShownSplash(true);
      document.body.style.overflow = '';
    }, 1800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      document.body.style.overflow = '';
    };
  }, [hasShownSplash, setHasShownSplash]);

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
