import { useEffect, useMemo, useRef, useState } from "react";
import "./polyEditor.scss";

/**
 * Prosty edytor poligonów:
 * - Klik = dodaj punkt
 * - Drag = przeciągnij istniejący punkt (dłuższe przytrzymanie lub złapanie pinu)
 * - Undo, Reset, Close (zamyka wielokąt)
 * - Copy (kopiuje "x1,y1 x2,y2 ..." w skali 0..1000)
 * - Load (wklej points, by edytować)
 */
export default function PolyEditor({
  image,
  alt = "look",
  initialPoints = "",       // opcjonalnie: punkty startowe "x,y x,y ..."
  onExport,                 // callback(pointsString)
}) {
  const wrapRef = useRef(null);
  const imgRef = useRef(null);
  const [natural, setNatural] = useState({ w: 1000, h: 1000 });
  const [points, setPoints] = useState([]); // współrzędne w pikselach (naturalne)
  const [isClosed, setIsClosed] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);

  // wczytanie initialPoints (0..1000) -> na piksele "natural"
  useEffect(() => {
    if (!initialPoints) return;
    const pts = parsePoints(initialPoints).map(([x, y]) => [
      (x / 1000) * natural.w,
      (y / 1000) * natural.h,
    ]);
    setPoints(pts);
    setIsClosed(true); // zakładamy, że przy ładowaniu mamy pełny kształt
  }, [initialPoints, natural.w, natural.h]);

  // kiedy obraz się załaduje, pobierz naturalne wymiary
  const onImgLoad = () => {
    if (imgRef.current) {
      setNatural({
        w: imgRef.current.naturalWidth || 1000,
        h: imgRef.current.naturalHeight || 1000,
      });
    }
  };

  // pozycje kursora → piksele w naturalnym układzie
  const clientToNatural = (e) => {
    const rect = wrapRef.current.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    // wrapper skaluje obraz do szer./wys. boxa; musimy przeliczyć na naturę
    const scaleX = natural.w / rect.width;
    const scaleY = natural.h / rect.height;
    return [relX * scaleX, relY * scaleY];
  };

  const addPoint = (e) => {
    if (isClosed || dragIndex !== null) return;
    const [nx, ny] = clientToNatural(e);
    setPoints((p) => [...p, [nx, ny]]);
  };

  const onMouseDownPin = (idx) => (e) => {
    e.preventDefault();
    setDragIndex(idx);
  };
  const onMouseMove = (e) => {
    if (dragIndex === null) return;
    const [nx, ny] = clientToNatural(e);
    setPoints((p) => {
      const copy = p.slice();
      copy[dragIndex] = [nx, ny];
      return copy;
    });
  };
  const onMouseUp = () => setDragIndex(null);
  const onMouseLeave = () => setDragIndex(null);

  const undo = () => {
    if (points.length === 0) return;
    setPoints((p) => p.slice(0, -1));
  };
  const reset = () => {
    setPoints([]);
    setIsClosed(false);
  };
  const close = () => {
    if (points.length >= 3) setIsClosed(true);
  };

  // eksport: natural px → 0..1000
  const exportPoints = () => {
    if (points.length < 3) return;
    const norm = points.map(([x, y]) => [
      Math.round((x / natural.w) * 1000),
      Math.round((y / natural.h) * 1000),
    ]);
    const str = norm.map(([x, y]) => `${x},${y}`).join(" ");
    navigator.clipboard?.writeText(str).catch(() => {});
    onExport && onExport(str);
    alert("Skopiowano points do schowka:\n" + str);
  };

  // wczytaj z pola tekstowego (0..1000)
  const [importText, setImportText] = useState("");
  const importFromText = () => {
    try {
      const norm = parsePoints(importText);
      const px = norm.map(([x, y]) => [(x / 1000) * natural.w, (y / 1000) * natural.h]);
      setPoints(px);
      setIsClosed(true);
    } catch {
      alert("Nieprawidłowy format points (oczekiwane: \"x1,y1 x2,y2 ...\")");
    }
  };

  const pathD = useMemo(() => {
    if (points.length === 0) return "";
    const [x0, y0] = points[0];
    const rest = points.slice(1).map(([x, y]) => `L ${x} ${y}`).join(" ");
    return `M ${x0} ${y0} ${rest} ${isClosed ? "Z" : ""}`;
  }, [points, isClosed]);

  return (
    <div className="polyEditor">
      <div className="polyEditor__bar">
        <button onClick={undo} disabled={!points.length}>Undo</button>
        <button onClick={reset} disabled={!points.length}>Reset</button>
        <button onClick={close} disabled={isClosed || points.length < 3}>Close</button>
        <button onClick={exportPoints} disabled={points.length < 3}>Copy points</button>
        <div className="polyEditor__import">
          <input
            placeholder='Wklej "x1,y1 x2,y2 ..." (0..1000)'
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
          />
          <button onClick={importFromText}>Load</button>
        </div>
      </div>

      <div
        className="polyEditor__stage"
        ref={wrapRef}
        onClick={addPoint}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
      >
        <img ref={imgRef} src={image} alt={alt} onLoad={onImgLoad} draggable="false" />
        {/* overlay SVG w naturalnych pikselach */}
        <svg
          className="polyEditor__overlay"
          viewBox={`0 0 ${natural.w} ${natural.h}`}
          preserveAspectRatio="none"
        >
          {/* podgląd ścieżki */}
          {points.length > 0 && (
            <path d={pathD} className={`pe__path ${isClosed ? "is-closed" : ""}`} />
          )}
          {/* odcinek do kursora (gdy otwarty i >=1 punkt) */}
          {!isClosed && points.length > 0 && (
            <PolylineToCursor points={points} wrapRef={wrapRef} natural={natural} />
          )}
          {/* piny */}
          {points.map(([x, y], idx) => (
            <g key={idx} transform={`translate(${x}, ${y})`}>
              <circle r="8" className="pe__pin" />
              <circle
                r="16"
                className="pe__pinHit"
                onMouseDown={onMouseDownPin(idx)}
              />
              <text className="pe__idx" y="-10">{idx + 1}</text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

/* pomocniczy komponent rysujący "gumkę" do kursora */
function PolylineToCursor({ points, wrapRef, natural }) {
  const [cursor, setCursor] = useState(null);

  useEffect(() => {
    const onMove = (e) => {
      if (!wrapRef.current) return;
      const rect = wrapRef.current.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;
      const x = (relX / rect.width) * natural.w;
      const y = (relY / rect.height) * natural.h;
      setCursor([x, y]);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [wrapRef, natural.w, natural.h]);

  if (!cursor) return null;
  const [x0, y0] = points[points.length - 1];
  const [cx, cy] = cursor;
  return <line x1={x0} y1={y0} x2={cx} y2={cy} className="pe__rubber" />;
}

/* parser "x,y x,y ..." -> [[x,y],...] */
function parsePoints(str) {
  return str
    .trim()
    .split(/\s+/)
    .map((p) => {
      const [x, y] = p.split(",").map((n) => Number(n));
      if (!Number.isFinite(x) || !Number.isFinite(y)) throw new Error("bad");
      return [x, y];
    });
}
