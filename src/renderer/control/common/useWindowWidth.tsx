import { useEffect, useState } from 'react';

const getWidth = () => window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

export function useWindowWidth() {
  const [widthInfo, setWidthInfo] = useState({ width: getWidth(), offset: 0 });

  useEffect(() => {
    const resizeListener = () => {
      setWidthInfo((cur) => {
        return { width: getWidth(), offset: getWidth() - cur.width };
      });
    };
    window.addEventListener('resize', resizeListener);

    return () => window.removeEventListener('resize', resizeListener);
  }, []);

  return widthInfo;
}
