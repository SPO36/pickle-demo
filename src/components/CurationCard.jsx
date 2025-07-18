import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

function CurationCard({
  subTitle,
  title,
  tagId,
  to,
  image,
  textColor,
  aspectRatio,
  isCompact = false,
  badgeImage,
  slug,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (to) {
      navigate(to);
    } else if (tagId) {
      navigate(`/tags/${tagId}`);
    }
  };

  const handlePlayClick = (e) => {
    e.stopPropagation(); // 카드 클릭 막기
    // navigate('/episode'); // 임시로 고정된 재생 페이지로 이동
  };

  // 자연스러운 이미지 크기를 위한 조건부 클래스
  const getCardClasses = () => {
    if (aspectRatio === 'natural') {
      return `relative flex flex-col border border-base-300 overflow-hidden rounded-[12px] cursor-pointer ${
        image ? '' : 'bg-base-100'
      }`;
    }

    return `relative flex flex-col w-full border border-base-300 overflow-hidden rounded-[12px] ${
      aspectRatio ? '' : isCompact ? 'h-56' : 'h-60'
    } cursor-pointer ${image ? '' : 'bg-base-100'} ${
      aspectRatio === '4/5' ? 'aspect-[4/5]' : aspectRatio === '16/9' ? 'aspect-[16/9]' : ''
    }`;
  };

  const getImageClasses = () => {
    if (aspectRatio === 'natural') {
      return 'z-0 block rounded-[12px] w-auto h-auto max-h-48 object-contain';
    }

    return 'z-0 absolute inset-0 rounded-[12px] w-full h-full object-cover';
  };

  return (
    <div onClick={handleCardClick} className={getCardClasses()}>
      {image && (
        <>
          <img src={image} alt={title} className={getImageClasses()} />
          {/* {aspectRatio !== 'natural' && (
            <div className="z-0 absolute inset-0 bg-black/5 backdrop-brightness-75 rounded-[12px]" />
          )} */}
        </>
      )}
      {aspectRatio !== 'natural' && (
        <div
          className={`relative z-10 p-4 flex flex-col flex-1 justify-between ${
            textColor ?? 'text-base-content'
          }`}
        >
          {/* Contents Live 로고 - 우측 상단 (slug가 'live'인 경우에만) */}
          {tagId === 'live' && (
            <div className="top-4 right-4 z-30 absolute">
              <img
                src="/Contents_live.png"
                alt="Contents Live"
                className="opacity-80 w-15 h-9 object-contain"
              />
            </div>
          )}

          {/* Contents 로고 - 좌측 하단 (P!CKLE MOOD가 아닌 경우에만) */}
          {subTitle !== 'P!CKLE MOOD' && (
            <div className="bottom-4 left-4 z-30 absolute">
              <img
                src="/Contents_logo.png"
                alt="Contents Logo"
                className="opacity-80 w-8 h-8 object-contain"
              />
            </div>
          )}

          {/* P!CKLE MOOD 레이아웃 */}
          {subTitle === 'P!CKLE MOOD' ? (
            <>
              {/* subTitle은 원래 위치에 */}
              <div className="z-20">
                <p
                  className="opacity-80 mb-1 text-sm"
                  style={{
                    color:
                      tagId === 'commute-balance'
                        ? '#E3FF97'
                        : tagId === 'morning-english'
                        ? '#FF664B'
                        : tagId === 'news-briefing'
                        ? '#CEDAFC'
                        : 'inherit',
                  }}
                >
                  {subTitle}
                </p>
              </div>

              {/* title은 우측 하단에 */}
              <div className="right-4 bottom-4 z-30 absolute">
                <h2
                  className="text-xl text-right leading-tight whitespace-pre-line card-title"
                  style={{
                    color:
                      tagId === 'commute-balance'
                        ? '#E3FF97'
                        : tagId === 'morning-english'
                        ? '#FF664B'
                        : tagId === 'news-briefing'
                        ? '#CEDAFC'
                        : 'inherit',
                  }}
                >
                  {title.replace(/\\n/g, '\n')}
                </h2>
              </div>
            </>
          ) : (
            /* 기본 레이아웃 */
            <div className="z-20">
              <p className="opacity-80 mb-1 text-sm">{subTitle}</p>
              <h2 className="text-xl leading-tight whitespace-pre-line card-title">
                {title.replace(/\\n/g, '\n')}
              </h2>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CurationCard;
