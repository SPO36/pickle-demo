import { ChevronLeft, CircleUserRound, Heart, LogOut, Settings, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useOEM } from '../context/OEMContext';

const ZOOM_KEY = 'zoomLevel';

function MenuPage() {
  const { t, i18n } = useTranslation();
  const { oemToggles, setOemToggles } = useOEM();
  const [zoomLevel, setZoomLevel] = useState(1.4);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleOEM = (brand) => {
    setOemToggles((prev) => ({
      ...prev,
      [brand]: !prev[brand],
    }));
  };

  useEffect(() => {
    const savedZoom = localStorage.getItem(ZOOM_KEY);
    const zoom = savedZoom ? parseFloat(savedZoom) : 1.4;
    setZoomLevel(zoom);
    document.documentElement.style.zoom = zoom;
  }, []);

  // 기본 언어를 영어로 설정
  useEffect(() => {
    if (i18n.language !== 'en') {
      i18n.changeLanguage('en');
    }
  }, [i18n]);

  const handleZoomChange = (e) => {
    const newZoom = parseFloat(e.target.value);
    setZoomLevel(newZoom);
    document.documentElement.style.zoom = newZoom;
    localStorage.setItem(ZOOM_KEY, newZoom);
    window.dispatchEvent(new Event('zoomChange'));
  };

  return (
    <div className="max-h-screen overflow-y-auto">
      {isSettingsOpen ? (
        <>
          {/* 설정 화면 */}
          <div className="flex items-center gap-2 mb-4">
            <button className="btn btn-sm btn-ghost" onClick={() => setIsSettingsOpen(false)}>
              <ChevronLeft size={20} />
            </button>
            <h2 className="font-semibold text-lg">{t('menu.settings')}</h2>
          </div>

          <div className="space-y-6 p-3">
            {/* Zoom */}
            <div>
              <h1 className="mb-2 font-semibold text-md">{t('menu.zoom')}</h1>
              <select
                className="w-full select-bordered select"
                value={zoomLevel}
                onChange={handleZoomChange}
              >
                {[1, 1.2, 1.4, 1.6, 1.8, 2.0].map((z) => (
                  <option key={z} value={z}>
                    {Math.round(z * 100)}%
                  </option>
                ))}
              </select>
            </div>

            {/* Language */}
            <div>
              <h1 className="mb-2 font-semibold text-md">{t('menu.language')}</h1>
              <select
                className="w-full select-bordered select"
                value={i18n.language}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
              >
                <option value="en">en</option>
                <option value="ko">ko</option>
              </select>
            </div>

            {/* OEM Contents */}
            <div>
              <h1 className="mb-2 font-semibold text-md">{t('menu.oem')}</h1>

              {['Hyundai', 'RKM'].map((brand) => (
                <label
                  key={brand}
                  className="flex justify-between items-center bg-base-100 py-2 rounded-md"
                >
                  <span className="opacity-60">{brand}</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={oemToggles[brand]}
                    onChange={() => toggleOEM(brand)}
                  />
                </label>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* 프로필 */}
          <ul className="bg-base-100 mb-4 rounded-box list">
            <li className="flex justify-between items-center list-row">
              <div className="flex gap-4">
                <img
                  className="rounded-box size-10"
                  src="https://img.daisyui.com/images/profile/demo/3@94.webp"
                />
                <div>
                  <div>OBIGO</div>
                  <div className="opacity-60 font-semibold text-xs uppercase">
                    obigo@obigo.co.kr
                  </div>
                </div>
              </div>
              <div className="hover:bg-base-300 p-3 rounded-xl cursor-pointer">
                <LogOut size={20} />
              </div>
            </li>
          </ul>

          {/* 메뉴 리스트 */}
          <table className="table">
            <tbody>
              <tr className="hover:bg-base-300 cursor-pointer">
                <td className="flex gap-3">
                  <CircleUserRound strokeWidth={1.5} size={24} />
                  <div>{t('menu.mypage')}</div>
                </td>
              </tr>
              <tr className="hover:bg-base-300 cursor-pointer">
                <td className="flex gap-3">
                  <Star strokeWidth={1.5} size={24} />
                  <div>{t('menu.recent')}</div>
                </td>
              </tr>
              <tr className="hover:bg-base-300 cursor-pointer" onClick={() => navigate('/likes')}>
                <td className="flex gap-3">
                  <Heart strokeWidth={1.5} size={24} />
                  <div>{t('menu.library')}</div>
                </td>
              </tr>
              {/* <tr className="hover:bg-base-300 cursor-pointer">
                <td className="flex gap-3">
                  <AudioLines strokeWidth={1.5} size={24} />
                  <div>{t('menu.sound')}</div>
                </td>
              </tr> */}
              <tr
                className="hover:bg-base-300 cursor-pointer"
                onClick={() => setIsSettingsOpen(true)}
              >
                <td className="flex gap-3">
                  <Settings strokeWidth={1.5} size={24} />
                  <div>{t('menu.settings')}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default MenuPage;
