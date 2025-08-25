// src/hooks/useScrollDirection.js

import { useState, useEffect, useRef } from 'react';

export function useScrollDirection(elementRef) {
  const [scrollDirection, setScrollDirection] = useState(null);
  
  // Używamy useRef, aby przechowywać ostatnią pozycję BEZ powodowania re-renderów.
  const lastScrollY = useRef(0);

  useEffect(() => {
    const targetElement = elementRef.current;
    if (!targetElement) return; // Jeśli elementu nie ma, nic nie rób

    const updateScrollDirection = () => {
      const currentScrollY = targetElement.scrollTop;

      // Ignoruj małe "drgania" scrolla
      if (Math.abs(currentScrollY - lastScrollY.current) < 10) {
        return;
      }

      // Określ kierunek
      const direction = currentScrollY > lastScrollY.current ? "down" : "up";

      // Ustaw nowy kierunek w stanie TYLKO jeśli się zmienił
      // To zapobiega niepotrzebnym re-renderowaniom
      setScrollDirection((prevDirection) => {
        if (direction !== prevDirection) {
          return direction;
        }
        return prevDirection;
      });
      
      lastScrollY.current = currentScrollY > 0 ? currentScrollY : 0;
    };

    // KLUCZOWA ZMIANA: Nasłuchiwacz jest dodawany tylko raz
    targetElement.addEventListener("scroll", updateScrollDirection, { passive: true });

    // Funkcja "sprzątająca" usuwa nasłuchiwacz, gdy komponent znika
    return () => {
      targetElement.removeEventListener("scroll", updateScrollDirection);
    };
  }, [elementRef]); // Efekt zależy TYLKO od referencji do elementu, a nie od stanu

  return scrollDirection;
}