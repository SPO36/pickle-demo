import Lottie from 'lottie-react';
import { ChevronRight, Pause, Play } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import carMotionData from '../assets/car-motion_darkmode.json';
import soundWaveData from '../assets/sound-wave_darkmode.json';

const LiveUI = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(840); // 14:00 in seconds
  const [totalTime, setTotalTime] = useState(960); // 16:00 in seconds
  const [isLiked, setIsLiked] = useState(false);
  const audioRef = useRef(null);
  const soundWaveRef = useRef(null);

  // Initialize audio
  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio('https://pickle-demo.netlify.app/Live_tgend.mp3');
    audioRef.current.loop = true;

    // Auto-play when component mounts
    const playAudio = async () => {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.log('Auto-play blocked:', error);
      }
    };

    playAudio();

    // Cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Control sound wave animation based on audio state
  useEffect(() => {
    if (soundWaveRef.current && soundWaveData) {
      const lottieInstance = soundWaveRef.current;

      if (isPlaying) {
        lottieInstance.setSpeed(1);
        lottieInstance.play();
      } else {
        lottieInstance.pause();
      }
    }
  }, [isPlaying, soundWaveData]);

  // Lottie event handlers
  const handleSoundWaveComplete = () => {
    if (soundWaveRef.current && isPlaying) {
      soundWaveRef.current.goToAndPlay(0, true);
    }
  };

  // Simulate time progress
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalTime) {
            setIsPlaying(false);
            return totalTime;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalTime]);

  // Format time helper
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle play/pause
  const togglePlayPause = async () => {
    if (audioRef.current) {
      try {
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          await audioRef.current.play();
          setIsPlaying(true);
        }
      } catch (error) {
        console.log('Audio control error:', error);
        // 오디오 재생이 실패해도 애니메이션은 작동하도록
        setIsPlaying(!isPlaying);
      }
    } else {
      // 오디오가 없어도 애니메이션 테스트를 위해
      setIsPlaying(!isPlaying);
    }
  };

  const progressPercentage = (currentTime / totalTime) * 100;

  return (
    <div className="flex flex-col justify-center">
      <div>
        {/* 윗섹션 - 햄버거 및 시간 표시 */}
        <div className="flex items-center mb-5 p-6">
          <div className="w-2/5">
            <h2 className="mb-4 font-medium text-2xl leading-9">
              오후 2시 10분,
              <br />
              가볍게 듣고 똑똑해지는 시간
              <br />
              [프리한 19]와 함께해요!
            </h2>
          </div>
          <div className="flex items-start w-3/5">
            <div className="flex flex-col">
              <div className="flex items-center space-x-3">
                <div className="flex justify-center items-center bg-slate-300 rounded-full w-14 h-14 overflow-hidden">
                  <img src="/live_ad.png" alt="Live Ad" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-medium text-xl">오늘 맥드라이브 어때요?</h3>
                  <div className="flex items-center gap-1">
                    <h2 className="font-light text-xs">맥도날드 찾기</h2>
                    <ChevronRight size={12} className="text-gray-500" />
                  </div>
                </div>
              </div>

              {/* car-motion 로티 애니메이션 */}
              <div className="flex justify-center">
                <div className="w-28 h-auto">
                  <Lottie
                    animationData={carMotionData}
                    loop={true}
                    autoplay={true}
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
              </div>
              {/* 선 패턴 */}
              <div className="flex justify-center items-center gap-1 mt-1">
                {/* 짧은 선, 긴선, 짧은선 (흰색) */}
                <div className="bg-white rounded-full w-4 h-2"></div>
                <div className="bg-white rounded-full w-20 h-2"></div>
                <div className="bg-white rounded-full w-4 h-2"></div>

                {/* 제일긴선 (노란색) */}
                <div className="bg-yellow-400 mx-1 rounded-full w-64 h-2"></div>

                {/* 짧은 선, 긴선, 짧은선 (흰색) */}
                <div className="bg-white rounded-full w-4 h-2"></div>
                <div className="bg-white rounded-full w-20 h-2"></div>
                <div className="bg-white rounded-full w-4 h-2"></div>
              </div>
              {/* 시간 표시 - 노란색 선 양 끝에만 */}
              <div className="flex justify-center items-center mt-2">
                {/* 왼쪽 빈 공간 (흰색 선들 크기와 맞춤) */}
                <div className="w-4"></div> {/* w-4 + gap */}
                <div className="w-20"></div>
                <div className="w-4"></div>
                <div className="w-1"></div> {/* mx-1의 절반 */}
                {/* 노란색 선 영역의 시간 표시 */}
                <div className="flex justify-between px-1 w-64">
                  <span className="font-light text-gray-500 text-xs">14:00</span>
                  <span className="font-light text-gray-500 text-xs">16:00</span>
                </div>
                {/* 오른쪽 빈 공간 */}
                <div className="w-1"></div> {/* mx-1의 절반 */}
                <div className="w-4"></div>
                <div className="w-20"></div>
                <div className="w-4"></div>
              </div>
            </div>
          </div>
        </div>

        {/* 아랫섹션 - 메인 카드 */}
        <div className="px-6">
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: 'linear-gradient(to right, #475A6A, #5B5D4D)' }}
          >
            <div className="flex">
              {/* 카드 좌측 - 텍스트 영역 */}
              <div className="flex flex-col justify-between p-6 w-2/5">
                <div className="text-white">
                  <h2 className="mt-2 mb-2 font-medium text-lg leading-tight">
                    [#프리한19] 우리가 잘못 알고 있던
                    <br />
                    상식들, 모두 알려드림! 🎯 알아두면
                    <br />
                    쓸모 있는 상식 zip | #티전드
                  </h2>
                  <h3 className="font-light text-gray-400 text-sm">tvN D ENT</h3>
                </div>

                {/* 하단 컨트롤 영역 */}
                <div className="flex justify-between items-center mt-8 text-white">
                  <div className="flex items-center gap-4">
                    {/* 메뉴 버튼 */}
                    <button className="hover:bg-white/10 p-2 rounded">
                      <div className="flex flex-col gap-1">
                        <div className="bg-white w-4 h-0.5"></div>
                        <div className="bg-white w-4 h-0.5"></div>
                        <div className="bg-white w-4 h-0.5"></div>
                      </div>
                    </button>

                    {/* 재생/일시정지 버튼 */}
                    <button
                      onClick={togglePlayPause}
                      className="hover:bg-white/10 p-2 rounded transition-colors"
                    >
                      {isPlaying ? (
                        <Pause size={24} fill="currentColor" />
                      ) : (
                        <Play size={24} fill="currentColor" />
                      )}
                    </button>
                  </div>

                  {/* 사운드 웨이브 - Lottie 애니메이션 또는 fallback */}
                  <div className="flex justify-center items-center w-auto h-14">
                    {soundWaveData ? (
                      <Lottie
                        key={`soundwave-${isPlaying}`}
                        lottieRef={soundWaveRef}
                        animationData={soundWaveData}
                        loop={true}
                        autoplay={isPlaying}
                        onComplete={handleSoundWaveComplete}
                        style={{ width: '100%', height: '100%' }}
                      />
                    ) : (
                      // Fallback: CSS 애니메이션 사운드 웨이브
                      <div className="flex items-center gap-1">
                        {[...Array(12)].map((_, i) => (
                          <div
                            key={i}
                            className={`bg-white rounded-full w-1 ${
                              isPlaying ? 'animate-pulse' : ''
                            }`}
                            style={{
                              height: `${Math.random() * 20 + 10}px`,
                              animationDelay: `${i * 0.1}s`,
                              opacity: isPlaying ? 1 : 0.3,
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 카드 우측 - 이미지 영역 */}
              <div className="relative w-3/5">
                <img
                  src="/live_thumbnail.png"
                  alt="Live thumbnail"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveUI;
