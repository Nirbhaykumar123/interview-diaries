import { useState, useEffect } from 'react';

interface WindowSize {
  width: number;
  height: number;
}

/**
 * Reusable hook to monitor window dimensions.
 * Listens to browser resizing events to adapt layout parameters dynamically.
 */
export default function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Set resize listener
    window.addEventListener('resize', handleResize);
    
    // Clean up listener on unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}
