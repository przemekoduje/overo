// src/hooks/useHorizontalScroll.js
import { useRef, useEffect } from 'react';

export function useHorizontalScroll() {
  const elRef = useRef();

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    let isDown = false;
    let startX;
    let scrollLeft;

    const onMouseDown = (e) => {
      isDown = true;
      el.classList.add('is-grabbing');
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
      console.log('--- MouseDown (START) ---'); // Diagnostyka
    };

    const onMouseUp = () => {
      isDown = false;
      el.classList.remove('is-grabbing');
      console.log('--- MouseUp (KONIEC) ---'); // Diagnostyka
    };

    const onMouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault(); // Zapobiegaj zaznaczaniu tekstu
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX); // Usunęliśmy mnożnik, aby ruch był 1:1
      el.scrollLeft = scrollLeft - walk;
      console.log('MouseMove: Przesuwam...'); // Diagnostyka
    };

    el.addEventListener('mousedown', onMouseDown);
    // Zmieniamy onMouseLeave na onMouseUp, aby było bardziej niezawodne
    el.addEventListener('mouseup', onMouseUp); 
    el.addEventListener('mouseleave', onMouseUp); // Puść przycisk, jeśli wyjedziesz poza obszar
    el.addEventListener('mousemove', onMouseMove);

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('mouseleave', onMouseUp);
      el.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return elRef;
}