import { useEffect, useState } from 'react';

const ZOOM_KEY = 'zoomLevel';

function MenuPage() {
  const [zoomLevel, setZoomLevel] = useState(1.4); // 기본값 1.4

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
  };

  return (
    <div className="space-y-4 p-4">
      <h1 className="font-bold text-2xl">화면 배율</h1>
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
  );
}

export default MenuPage;
