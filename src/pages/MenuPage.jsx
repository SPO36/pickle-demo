import { AudioLines, CircleUserRound, Heart, LogOut, Settings, Star } from 'lucide-react';
import { useEffect, useState } from 'react';

const ZOOM_KEY = 'zoomLevel';

function MenuPage() {
  const [zoomLevel, setZoomLevel] = useState(1.4);

  // 초기 마운트 시 로컬스토리지에서 줌 값 불러오기
  useEffect(() => {
    const savedZoom = localStorage.getItem(ZOOM_KEY);
    if (savedZoom) {
      setZoomLevel(parseFloat(savedZoom));
      document.documentElement.style.zoom = parseFloat(savedZoom);
    } else {
      document.documentElement.style.zoom = 1.4;
    }
  }, []);

  // 줌 값 변경 시 적용 및 저장
  const handleZoomChange = (e) => {
    const newZoom = parseFloat(e.target.value);
    setZoomLevel(newZoom);
    document.documentElement.style.zoom = newZoom;
    localStorage.setItem(ZOOM_KEY, newZoom);
    window.dispatchEvent(new Event('zoomChange'));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2 overflow-x-auto">
        {/* profile */}
        <ul className="bg-base-100 rounded-box list">
          <li className="flex justify-between items-center list-row">
            <div className="flex flex-row gap-4">
              <div>
                <img
                  className="rounded-box size-10"
                  src="https://img.daisyui.com/images/profile/demo/3@94.webp"
                />
              </div>
              <div className="list-col-grow">
                <div>OBIGO</div>
                <div className="opacity-60 font-semibold text-xs uppercase">obigo@obigo.co.kr</div>
              </div>
            </div>
            <div className="hover:bg-base-300 p-3 rounded-xl cursor-pointer">
              <LogOut size={20} />
            </div>
          </li>
        </ul>
        {/* my */}
        <table className="table">
          <tbody>
            <tr className="hover:bg-base-300 cursor-pointer">
              <td className="flex flex-row gap-3">
                <CircleUserRound strokeWidth={1.5} size={24} />
                <div>마이페이지</div>
              </td>
            </tr>
            <tr className="hover:bg-base-300 cursor-pointer">
              <td className="flex flex-row gap-3">
                <Star strokeWidth={1.5} size={24} />
                <div>최근 청취</div>
              </td>
            </tr>
            <tr className="hover:bg-base-300 cursor-pointer">
              <td className="flex flex-row gap-3">
                <Heart strokeWidth={1.5} size={24} />
                <div>보관함</div>
              </td>
            </tr>
            <tr className="hover:bg-base-300 cursor-pointer">
              <td className="flex flex-row gap-3">
                <AudioLines strokeWidth={1.5} size={24} />
                <div>사운드</div>
              </td>
            </tr>
            <tr className="hover:bg-base-300 cursor-pointer">
              <td className="flex flex-row gap-3">
                <Settings strokeWidth={1.5} size={24} />
                <div>설정</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {/* setting */}
      <div className='p-3'>
        <h1 className="mb-3 font-semibold text-lg">화면 배율</h1>
        <label className="flex items-center gap-2">
          <select className="select-bordered select" value={zoomLevel} onChange={handleZoomChange}>
            <option value={1}>100%</option>
            <option value={1.2}>120%</option>
            <option value={1.4}>140%</option>
            <option value={1.6}>160%</option>
            <option value={1.8}>180%</option>
            <option value={2.0}>200%</option>
          </select>
        </label>
      </div>
    </div>
  );
}

export default MenuPage;
