import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ZOOM_KEY = 'zoomLevel';

function ZoomProvider() {
  const location = useLocation();

  useEffect(() => {
    const savedZoom = localStorage.getItem(ZOOM_KEY);
    const zoom = savedZoom ? parseFloat(savedZoom) : 1;

    // console.log('[ZoomProvider] applying zoom', zoom, 'on path:', location.pathname);

    const timeout = setTimeout(() => {
      document.documentElement.style.zoom = zoom;
    }, 0);

    return () => clearTimeout(timeout);
  }, [location]);

  return null;
}

export default ZoomProvider;
