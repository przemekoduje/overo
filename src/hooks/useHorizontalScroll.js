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
    let isDragging = false; // Dodatkowa flaga do śledzenia przeciągania

    const onMouseDown = (e) => {
      isDown = true;
      el.classList.add('is-active-drag');
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
      isDragging = false; // Resetuj flagę przy każdym kliknięciu
    };

    const onMouseLeave = () => {
      isDown = false;
      el.classList.remove('is-active-drag');
    };

    const onMouseUp = (e) => {
      isDown = false;
      el.classList.remove('is-active-drag');
      // Jeśli przeciągaliśmy, zablokuj domyślne zdarzenie 'click'
      if (isDragging) {
        e.stopPropagation();
      }
    };

    const onMouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      isDragging = true; // Ustaw flagę, gdy mysz się poruszy
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.5; // Mnożnik 1.5 dla płynniejszego ruchu
      el.scrollLeft = scrollLeft - walk;
    };

    // Podpinamy eventy do elementu
    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('mouseleave', onMouseLeave);
    el.addEventListener('mouseup', onMouseUp);
    el.addEventListener('mousemove', onMouseMove);
    
    // Zapobiegamy "duchom" po puszczeniu przycisku
    // To jest kluczowe dla przycisków wewnątrz kontenera
    Array.from(el.children).forEach(child => {
      child.addEventListener('click', (e) => {
        if (isDragging) {
          e.preventDefault();
          e.stopPropagation();
        }
      }, true); // Używamy 'capture phase'
    });

    return () => {
      // Czyszczenie
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('mouseleave', onMouseLeave);
      el.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return elRef;
}