import Lottie from 'lottie-react';
import { Play } from 'lucide-react';
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
  const [isClicked, setIsClicked] = useState(false);

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
      className="flex justify-center items-center w-full h-full"
      style={{ height: containerHeight }}
    >
      <div className="flex justify-center items-center mx-auto px-4 w-full max-w-screen-lg">
        {isClicked ? (
          <>
            {/* <img src="/voice_sample.png" alt="Voice Sample" className="w-full h-auto" /> */}
            <div className="flex justify-center items-center space-x-16">
              <img src="/voice_sampleContents.png" alt="Voice Contents" className="w-5/12 h-auto" />
              <div className="space-y-8">
                <img src="/sub_logo.png" alt="logo" className="w-[52px] h-[52px]" />
                <div className="font-normal text-3xl leading-10">
                  마음이 불편하셨겠어요.
                  <br />
                  부부 간 갈등 상황에서 도움이 되는
                  <br />
                  대화법 콘텐츠를 준비했어요.
                </div>
                <button className="bg-gradient-to-r from-[#D77AF3] to-[#758CFF] px-6 py-6 rounded-full text-white btn">
                  <Play size={18} stroke="white" strokeWidth={2.5} />
                  <span className="ml-1 font-medium text-lg">재생하기</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div
            className="flex flex-col justify-center items-center cursor-pointer"
            onClick={() => setIsClicked(true)}
          >
            <Lottie
              animationData={animationData}
              loop
              autoplay
              className="w-full max-w-80 h-auto object-contain"
            />
            <div className="pt-8 text-center">
              <TypeAnimation
                sequence={[t('placeholders.search', '검색어를 말씀해보세요'), 2000]}
                wrapper="p"
                speed={250}
                cursor={false}
                className="font-semibold text-2xl md:text-3xl"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VoiceSearch;
