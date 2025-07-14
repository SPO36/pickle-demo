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
  const { hasShownSplash, setHasShownSplash } = useSplash();
  const [splashVisible, setSplashVisible] = useState(!hasShownSplash);
  const [contentVisible, setContentVisible] = useState(hasShownSplash);
  const [isContentReady, setIsContentReady] = useState(false);
  const splashRef = useRef();
  const contentRef = useRef();

  // 페이지 로드 시 즉시 스크롤 위치 고정
  useEffect(() => {
    // 스크롤 방지를 위한 즉시 실행
    const preventScroll = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    preventScroll();

    // 추가 보험: 짧은 간격으로 여러 번 실행
    const intervals = [0, 10, 50, 100, 200];
    const timeouts = intervals.map((delay) => setTimeout(preventScroll, delay));

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    if (hasShownSplash) {
      // 이미 스플래시를 본 경우 콘텐츠 준비 완료
      setIsContentReady(true);
      return;
    }

    // 스크롤 완전 비활성화
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

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

      // 콘텐츠가 나타나기 전에 스크롤 위치 고정
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // 스크롤 재활성화
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';

      // 콘텐츠 준비 완료 표시
      setTimeout(() => {
        setIsContentReady(true);
      }, 50);
    }, 1800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [hasShownSplash, setHasShownSplash]);

  // 콘텐츠가 렌더링된 후 스크롤 위치 재확인
  useEffect(() => {
    if (contentVisible && isContentReady) {
      // 다음 프레임에서 스크롤 위치 확인
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      });
    }
  }, [contentVisible, isContentReady]);

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
          ref={contentRef}
          className="space-y-8 pb-20 drawer-content"
          style={{
            opacity: contentVisible && isContentReady ? 1 : 0,
            transform: contentVisible && isContentReady ? 'none' : 'translateY(0)', // translateY 제거하여 레이아웃 변경 방지
            transition: contentVisible ? 'opacity 0.6s ease-out' : 'none', // transform 애니메이션 제거
            visibility: contentVisible ? 'visible' : 'hidden', // 완전히 숨김으로 레이아웃 영향 방지
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
