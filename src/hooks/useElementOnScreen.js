// src/hooks/useElementOnScreen.js
import { useState, useEffect, useMemo } from 'react';

export function useElementOnScreen(ref) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  const observer = useMemo(() => 
    new IntersectionObserver(([entry]) => 
      setIsIntersecting(entry.isIntersecting)
    ), []);

  useEffect(() => {
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => {
      observer.disconnect();
    };
  }, [ref, observer]);

  return isIntersecting;
}