import { showError } from '@/components/core/common/Notification';
import { useEffect, useState } from 'react';
import ReactFC from 'react-fusioncharts';

declare global {
  interface Window {
    FusionCharts: any;
    _$loadingPromise: Promise<void> | null;
  }
}

async function loadScripts(scripts: string[]) {
  await Promise.all(
    scripts.map(
      (src) =>
        new Promise((ok, err) => {
          const s = document.createElement('script');
          s.src = src;
          s.onload = ok;
          s.onerror = err;
          document.head.appendChild(s);
        }),
    ),
  );
}

async function loadFusionCharts() {
  await loadScripts(['/fusioncharts/fusioncharts.js']);
  await loadScripts(['/fusioncharts/fusioncharts.charts.js', '/fusioncharts/themes/fusioncharts.theme.fint.js']);
  ReactFC.fcRoot(window.FusionCharts);
}

export default function useFusionLoader() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!window._$loadingPromise) {
      window._$loadingPromise = loadFusionCharts();
    }
    window._$loadingPromise
      .then(() => {
        setLoaded(true);
      })
      .catch((err) => {
        console.error(err);
        showError('Failed to load FusionCharts!');
      });
  }, []);

  return loaded;
}
