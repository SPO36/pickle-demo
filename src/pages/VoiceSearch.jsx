import Lottie from 'lottie-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { TypeAnimation } from 'react-type-animation';
import animationData from '../assets/VoiceSearch_new.json';

const HEADER_HEIGHT = 128;

function VoiceSearch() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [containerHeight, setContainerHeight] = useState('100vh');

  useEffect(() => {
    if (window.history.length <= 2) navigate('/');

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
    <div
      className="flex justify-center items-center px-4 w-full"
      style={{ height: containerHeight }}
    >
      {/* 중앙 컨테이너 */}
      <div className="relative flex flex-col w-full max-w-xl h-full min-h-[450px]">
        {/* 로띠 영역 (가변 높이) */}
        <div className="flex flex-grow justify-center items-center overflow-hidden">
          <Lottie
            animationData={animationData}
            loop
            autoplay
            className="w-full max-w-80 h-auto object-contain"
          />
        </div>

        {/* 텍스트 하단 고정 + 간격 확보 */}
        <div className="pb-8 text-center">
          <TypeAnimation
            sequence={[t('placeholders.search'), 2000]}
            wrapper="p"
            speed={250}
            cursor={false}
            className="font-semibold text-2xl md:text-3xl"
          />
        </div>
      </div>
    </div>
  );
}

export default VoiceSearch;
