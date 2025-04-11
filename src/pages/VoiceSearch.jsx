import Lottie from 'lottie-react';
import { Mic } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TypeAnimation } from 'react-type-animation';
import animationData from '../assets/VoiceSearch_bg2.json';

function VoiceSearch() {
  const navigate = useNavigate();

  // 뒤로가기 없을 때 홈으로 이동
  useEffect(() => {
    if (window.history.length <= 2) {
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* 전체 콘텐츠 + 배경 함께 감싸기 */}
      <div className="z-10 absolute inset-0 flex flex-col justify-center items-center gap-12 px-4 text-center -translate-y-20 transform">
        {/* 배경 로티 */}
        <Lottie
          animationData={animationData}
          loop
          autoplay
          className="top-0 left-0 z-0 absolute w-full h-full object-cover"
        />

        {/* 텍스트 콘텐츠 */}
        <p className="z-10 text-gray-500 text-2xl animate-pulse">듣는 중...</p>

        <div className="z-10 relative w-32 h-32">
          <div className="absolute inset-0 bg-slate-400 opacity-40 rounded-full animate-ping" />
          <div className="relative flex justify-center items-center bg-slate-600 rounded-full w-full h-full text-white">
            <Mic size={40} />
          </div>
        </div>

        <TypeAnimation
          sequence={['"경제 관련 팟캐스트 찾아줘"', 2000]}
          wrapper="p"
          speed={250}
          cursor={false}
          className="z-10 font-semibold text-2xl md:text-3xl"
        />
      </div>
    </div>
  );
}

export default VoiceSearch;
