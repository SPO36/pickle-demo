import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ZOOM_KEY = 'zoomLevel';

function ZoomProvider() {
  const location = useLocation();

  useEffect(() => {
    const savedZoom = localStorage.getItem(ZOOM_KEY);
    const zoom = savedZoom ? parseFloat(savedZoom) : 1;
    document.documentElement.style.zoom = zoom;
  }, [location]);

  return null; // 아무것도 렌더하지 않음
}

export default ZoomProvider;
