import Lottie from 'lottie-react';
import { Mic } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TypeAnimation } from 'react-type-animation';
import animationData from '../assets/VoiceSearch_bg2.json';

const HEADER_HEIGHT = 128;

function VoiceSearch() {
  const navigate = useNavigate();
  const [containerHeight, setContainerHeight] = useState('100vh');

  useEffect(() => {
    // history가 너무 짧으면 홈으로 이동
    if (window.history.length <= 2) {
      navigate('/');
    }

    const updateHeight = () => {
      const zoom = parseFloat(localStorage.getItem('zoomLevel')) || 1;
      const physicalViewport = window.innerHeight;
      const adjustedHeight = physicalViewport / zoom - HEADER_HEIGHT * zoom;
      setContainerHeight(`${adjustedHeight}px`);
    };

    updateHeight();
    window.addEventListener('storage', updateHeight);
    window.addEventListener('zoomChange', updateHeight);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('storage', updateHeight);
      window.removeEventListener('zoomChange', updateHeight);
      document.body.style.overflow = originalOverflow;
    };
  }, [navigate]);

  return (
    <div className="relative w-full overflow-hidden" style={{ height: containerHeight }}>
      {/* 배경 로티 애니메이션 */}
      <Lottie
        animationData={animationData}
        loop
        autoplay
        className="top-0 left-0 z-0 absolute w-full h-full object-cover"
      />

      {/* 정중앙 콘텐츠 */}
      <div className="z-10 relative flex flex-col justify-center items-center gap-12 px-4 h-full text-center">
        <p className="text-gray-500 text-2xl animate-pulse">듣는 중...</p>

        <div className="relative w-32 h-32">
          <div className="absolute inset-2 bg-slate-400 opacity-30 rounded-full animate-ping" />
          <div className="relative flex justify-center items-center bg-slate-600 rounded-full w-full h-full text-white">
            <Mic size={40} className="animate-[micGrow_1.2s_ease-in-out_infinite]" />
          </div>
        </div>

        <TypeAnimation
          sequence={['"경제 관련 팟캐스트 찾아줘"', 2000]}
          wrapper="p"
          speed={250}
          cursor={false}
          className="font-bold text-2xl md:text-3xl"
        />
      </div>
    </div>
  );
}

export default VoiceSearch;
