import Lottie from 'lottie-react';
import { Play } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { TypeAnimation } from 'react-type-animation';
import animationData from '../assets/VoiceSearch_new.json';

// EpisodeCard 컴포넌트 (깜빡거림 해결)
function EpisodeCard({ title, creator, src, id, themeSlug, audioFile, showCard = true }) {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);

  const handlePlayClick = (e) => {
    if (!audioFile) {
      showToast(title + '의 오디오 파일이 존재하지 않습니다');
      e.stopPropagation();
      return;
    }

    if (themeSlug) {
      navigate(`/episode/${id}/${themeSlug}`);
    } else {
      navigate(`/episode/${id}`);
    }
  };

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
    <div
      className={`cursor-pointer transition-opacity duration-700 ${
        showCard ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handlePlayClick}
    >
      <div className="bg-base-100">
        <figure className="relative">
          {/* 스켈레톤을 절대 위치로 배치하여 겹치지 않게 함 */}
          {!imageLoaded && (
            <div className="flex justify-center items-center bg-base-300 rounded-[12px] w-full h-64">
              <div className="bg-base-200 border-b-2 rounded-full w-8 h-8 animate-spin"></div>
            </div>
          )}
          <img
            src={src}
            alt={creator}
            className={`rounded-[12px] w-full h-auto object-cover transition-opacity duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0 absolute top-0 left-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
        </figure>
        <div className="gap-4 py-3">
          <h2 className="overflow-hidden font-semibold text-lg line-clamp-2">{title}</h2>
        </div>
      </div>
    </div>
  );
}

const HEADER_HEIGHT = 128;

function VoiceSearch() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [containerHeight, setContainerHeight] = useState('100vh');
  const [isClicked, setIsClicked] = useState(false);
  const [showTypingAnimation, setShowTypingAnimation] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [showLeftImage, setShowLeftImage] = useState(false);
  const [showSearchText, setShowSearchText] = useState(false);

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

    // 5초 후 검색 텍스트 표시
    const timer = setTimeout(() => {
      setShowSearchText(true);
    }, 3000);

    return () => {
      window.removeEventListener('storage', updateHeight);
      window.removeEventListener('zoomChange', updateHeight);
      document.body.style.overflow = originalOverflow;
      clearTimeout(timer);
    };
  }, [navigate]);

  const handleClick = () => {
    setIsClicked(true);
    // 로고 먼저 나타남
    setTimeout(() => {
      setShowLogo(true);
    }, 300);
    // 이미지 로딩 후 타이핑 애니메이션 시작
    setTimeout(() => {
      setShowTypingAnimation(true);
    }, 800);
  };

  // 메인 카드 데이터를 상수로 정의
  const MAIN_CARD_DATA = {
    id: '3963038b-bbf6-427b-ae74-7917e32ca589',
    themeSlug: 'couple-communication',
    audioFile: 'audio1.mp3',
    title: "[명강연 컬렉션] 김지윤 소장이 말하는 '남이 되지 않는 부부 싸움의 기술'",
  };

  // showToast 함수 추가 (EpisodeCard에서 사용하는 것과 동일)
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

  // 메인 카드 재생 핸들러
  const handleMainCardPlay = () => {
    if (!MAIN_CARD_DATA.audioFile) {
      showToast(MAIN_CARD_DATA.title + '의 오디오 파일이 존재하지 않습니다');
      return;
    }

    if (MAIN_CARD_DATA.themeSlug) {
      navigate(`/episode/${MAIN_CARD_DATA.id}/${MAIN_CARD_DATA.themeSlug}`);
    } else {
      navigate(`/episode/${MAIN_CARD_DATA.id}`);
    }
  };

  return (
    <div
      className="flex justify-center items-center w-full h-full"
      style={{ height: containerHeight }}
    >
      <div className="flex justify-center items-center mx-auto px-4 w-full max-w-screen-lg">
        {isClicked ? (
          <>
            <div className="flex justify-center items-center space-x-5 w-full">
              <div className="flex justify-center items-center w-1/2">
                <div
                  className={`transition-all duration-700 ${
                    showLeftImage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                >
                  <div className="relative w-96 h-[500px]">
                    {/* 중앙 메인 카드 */}
                    <div className="top-28 z-30 absolute inset-x-4 scale-100 transform">
                      <EpisodeCard
                        title="[명강연 컬렉션] 김지윤 소장이 말하는 '남이 되지 않는 부부 싸움의 기술'"
                        creator="MBN Entertainment"
                        src="https://img.youtube.com/vi/l4Xxh6OjC4s/maxresdefault.jpg"
                        id="3963038b-bbf6-427b-ae74-7917e32ca589"
                        themeSlug="couple-communication"
                        audioFile="Live_audio.mp3"
                        showCard={showLeftImage}
                      />
                    </div>

                    {/* 상단 카드 (그라데이션 마스크로 아래쪽 페이드) */}
                    <div
                      className="top-8 z-20 absolute inset-x-8 opacity-40 scale-90 transform"
                      style={{
                        maskImage:
                          'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 40%)',
                        WebkitMaskImage:
                          'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
                      }}
                    >
                      <EpisodeCard
                        title="부부싸움!!! 쉽게 화해하는 방법!! : 연애상담"
                        creator="열쩡부부passion couple"
                        src="https://img.youtube.com/vi/QLkeyTu8yRU/maxresdefault.jpg"
                        id="3963038b-bbf6-427b-ae74-7917e32ca589"
                        themeSlug="couple-communication"
                        audioFile="Live_audio.mp3"
                        showCard={showLeftImage}
                      />
                    </div>

                    {/* 하단 카드 (그라데이션 마스크로 위쪽 페이드) - 더 많이 겹치게 */}
                    <div
                      className="bottom-0 z-30 absolute inset-x-6 opacity-40 scale-95 -translate-y-8 transform"
                      style={{
                        maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 15%)',
                        WebkitMaskImage:
                          'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 40%)',
                      }}
                    >
                      <EpisodeCard
                        title="부부갈등의 모든 것! 이혼, 별거, 성격차이, 경제력, 가정회복 [명법문만 모았다! 명중명💡 I 법륜스님]"
                        creator="깨달음을 얻는 BTN 명법문"
                        src="https://img.youtube.com/vi/bb7tT4Gxhss/maxresdefault.jpg"
                        id="3963038b-bbf6-427b-ae74-7917e32ca589"
                        themeSlug="couple-communication"
                        audioFile="Live_audio.mp3"
                        showCard={showLeftImage}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-8 w-1/2">
                <div
                  className={`transition-all duration-500 ${
                    showLogo ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                >
                  <img src="/sub_logo.png" alt="logo" className="w-[52px] h-[52px]" />
                </div>
                <div className="min-h-[120px] font-normal text-3xl leading-10">
                  {showTypingAnimation ? (
                    <TypeAnimation
                      sequence={[
                        '',
                        400,
                        '마음이 불편하셨겠어요.',
                        400,
                        '마음이 불편하셨겠어요.\n부부 간 갈등 상황에서 도움이 되는',
                        400,
                        '마음이 불편하셨겠어요.\n부부 간 갈등 상황에서 도움이 되는\n대화법 콘텐츠를 준비했어요.',
                        () => {
                          setShowButton(true);
                          setShowLeftImage(true);
                        },
                      ]}
                      wrapper="div"
                      speed={80}
                      cursor={false}
                      style={{ whiteSpace: 'pre-line' }}
                      className="font-normal text-3xl leading-10"
                    />
                  ) : (
                    <div className="opacity-0">
                      마음이 불편하셨겠어요.
                      <br />
                      부부 간 갈등 상황에서 도움이 되는
                      <br />
                      대화법 콘텐츠를 준비했어요.
                    </div>
                  )}
                </div>
                <button
                  className={`bg-gradient-to-r from-[#D77AF3] to-[#758CFF] px-6 py-6 rounded-full text-white btn transition-all duration-500 ${
                    showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  onClick={handleMainCardPlay}
                >
                  <Play size={18} stroke="white" strokeWidth={2.5} />
                  <span className="ml-1 font-medium text-lg">재생하기</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div
            className="flex flex-col justify-center items-center cursor-pointer"
            onClick={handleClick}
          >
            <Lottie
              animationData={animationData}
              loop
              autoplay
              className="w-full max-w-80 h-auto object-contain"
            />
            <div className="pt-8 text-center">
              {!showSearchText ? (
                <p
                  className="font-semibold text-2xl md:text-3xl animate-pulse"
                  style={{
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }}
                >
                  듣고 있어요
                </p>
              ) : (
                <TypeAnimation
                  sequence={[t('placeholders.search', '검색어를 말씀해보세요'), 2000]}
                  wrapper="p"
                  speed={250}
                  cursor={false}
                  className="font-semibold text-2xl md:text-3xl"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VoiceSearch;
