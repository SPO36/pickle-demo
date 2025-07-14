import Lottie from 'lottie-react';
import { Play } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { TypeAnimation } from 'react-type-animation';
import animationData from '../assets/VoiceSearch_new.json';

// EpisodeCard 컴포넌트 (임시로 여기에 정의)
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

  // 카드가 표시되지 않을 때는 스켈레톤만 표시
  if (!showCard) {
    return (
      <div className="bg-base-100">
        <figure className="relative">
          <div className="flex justify-center items-center bg-base-100 rounded-[12px] w-full h-64 animate-pulse">
            <div className="border-slate-300 border-b-2 rounded-full w-8 h-8 animate-spin"></div>
          </div>
        </figure>
        <div className="gap-4 py-2">
          <div className="bg-base-100 mb-2 rounded h-6 animate-pulse"></div>
          <div className="bg-base-100 rounded w-3/4 h-4 animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="cursor-pointer" onClick={handlePlayClick}>
      <div className="bg-base-100">
        <figure className="relative">
          {!imageLoaded && (
            <div className="flex justify-center items-center bg-base-300 rounded-[12px] w-full h-64 animate-pulse">
              <div className="bg-base-200 border-b-2 rounded-full w-8 h-8 animate-spin"></div>
            </div>
          )}
          <img
            src={src}
            alt={creator}
            className={`rounded-[12px] w-full h-auto object-cover transition-opacity duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            style={imageLoaded ? {} : { position: 'absolute', top: 0, left: 0 }}
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

  const handleImageLoad = (imageName) => {
    // 로고 이미지 로딩만 처리
  };

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

  const ImageWithLoader = ({ src, alt, className, imageName }) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
      <div className="inline-block relative">
        {!imageLoaded && (
          <div
            className={`${className} bg-base-100 animate-pulse rounded-lg flex items-center justify-center`}
          >
            <div className="border-b-2 border-base-300 rounded-full w-8 h-8 animate-spin"></div>
          </div>
        )}
        <img
          src={src}
          alt={alt}
          className={`${className} transition-opacity duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          style={imageLoaded ? {} : { position: 'absolute', top: 0, left: 0 }}
        />
      </div>
    );
  };

  return (
    <div
      className="flex justify-center items-center w-full h-full"
      style={{ height: containerHeight }}
    >
      <div className="flex justify-center items-center mx-auto px-4 w-full max-w-screen-lg">
        {isClicked ? (
          <>
            <div className="flex justify-center items-center w-full">
              <div className="flex justify-center items-center w-1/2">
                {!showLeftImage && (
                  <div className="flex justify-center items-center bg-gray-700 rounded-lg w-96 h-80 animate-pulse">
                    <div className="border-gray-500 border-b-2 rounded-full w-12 h-12 animate-spin"></div>
                  </div>
                )}
                <div
                  className={`transition-all duration-700 ${
                    showLeftImage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  } ${showLeftImage ? '' : 'absolute'}`}
                >
                  <div className="relative w-96 h-[500px]">
                    {/* 중앙 메인 카드 */}
                    <div className="top-12 z-30 absolute inset-x-4 scale-100 transform">
                      <EpisodeCard
                        title="[명강연 컬렉션] 김지윤 소장이 말하는 '남이 되지 않는 부부 싸움의 기술' [Full영상]"
                        creator="추천 콘텐츠_메인"
                        src="https://img.youtube.com/vi/l4Xxh6OjC4s/maxresdefault.jpg"
                        id="main"
                        themeSlug="couple-communication"
                        audioFile="audio1.mp3"
                        showCard={showLeftImage}
                      />
                    </div>

                    {/* 상단 카드 (그라데이션 마스크로 아래쪽 페이드) */}
                    <div
                      className="top-0 z-20 absolute inset-x-8 opacity-60 scale-90 transform"
                      style={{
                        maskImage:
                          'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 65%)',
                        WebkitMaskImage:
                          'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
                      }}
                    >
                      <EpisodeCard
                        title="위 부부싸움!!! 쉽게 화해하는 방법!! : 연애상담"
                        creator="추천 콘텐츠_서브"
                        src="https://img.youtube.com/vi/QLkeyTu8yRU/maxresdefault.jpg"
                        id="top"
                        themeSlug="couple-dialogue"
                        audioFile="audio2.mp3"
                        showCard={showLeftImage}
                      />
                    </div>

                    {/* 하단 카드 (그라데이션 마스크로 위쪽 페이드) - 더 많이 겹치게 */}
                    <div
                      className="bottom-0 z-30 absolute inset-x-6 opacity-60 scale-95 -translate-y-8 transform"
                      style={{
                        maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 65%)',
                        WebkitMaskImage:
                          'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
                      }}
                    >
                      <EpisodeCard
                        title="부부갈등의 모든 것! 이혼, 별거, 성격차이, 경제력, 가정회복 [명법문만 모았다! 명중명💡 I 법륜스님]"
                        creator="추천 콘텐츠_서브"
                        src="https://img.youtube.com/vi/bb7tT4Gxhss/maxresdefault.jpg"
                        id="bottom"
                        themeSlug="couple-counseling"
                        audioFile="audio3.mp3"
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
                  <ImageWithLoader
                    src="/sub_logo.png"
                    alt="logo"
                    className="w-[52px] h-[52px]"
                    imageName="logo"
                  />
                </div>
                <div className="min-h-[120px] font-normal text-3xl leading-10">
                  {showTypingAnimation ? (
                    <TypeAnimation
                      sequence={[
                        '',
                        500,
                        '마음이 불편하셨겠어요.',
                        1000,
                        '마음이 불편하셨겠어요.\n부부 간 갈등 상황에서 도움이 되는',
                        1000,
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
