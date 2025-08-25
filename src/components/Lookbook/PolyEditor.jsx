// src/components/Lookbook/PolyEditor.jsx

import { useEffect, useMemo, useRef, useState } from "react";
import "./polyEditor.scss";

function parsePoints(str) {
  return str.trim().split(/\s+/).map((p) => {
    const [x, y] = p.split(",").map(Number);
    if (!Number.isFinite(x) || !Number.isFinite(y)) throw new Error("bad format");
    return [x, y];
  });
}

/* Pomocniczy komponent rysujący "gumkę" do kursora */
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
    const stage = wrapRef.current;
    stage.addEventListener("mousemove", onMove);
    return () => stage.removeEventListener("mousemove", onMove);
  }, [wrapRef, natural.w, natural.h]);

  if (!cursor || points.length === 0) return null;
  const [x0, y0] = points[points.length - 1];
  const [cx, cy] = cursor;
  return <line x1={x0} y1={y0} x2={cx} y2={cy} className="pe__rubber" />;
}

export default function PolyEditor({ image, alt = "look", initialItems = [], onExport }) {
  const wrapRef = useRef(null);
  const imgRef = useRef(null);
  const [natural, setNatural] = useState({ w: 1000, h: 1000 });
  const [points, setPoints] = useState([]);
  const [isClosed, setIsClosed] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);

  const toPxPoints = (pointsStr) => {
    if (!pointsStr) return "";
    return pointsStr.trim().split(/\s+/).map((p) => {
      const [xn, yn] = p.split(",").map(Number);
      return `${(xn / 1000) * natural.w},${(yn / 1000) * natural.h}`;
    }).join(" ");
  };

  const onImgLoad = () => {
    if (imgRef.current) {
      setNatural({ w: imgRef.current.naturalWidth || 1000, h: imgRef.current.naturalHeight || 1000 });
    }
  };

  const clientToNatural = (e) => {
    const rect = wrapRef.current.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
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
    e.stopPropagation(); // Zapobiegaj uruchomieniu addPoint
    setDragIndex(idx);
  };

  const onMouseMove = (e) => {
    if (dragIndex === null) return;
    const [nx, ny] = clientToNatural(e);
    setPoints((p) => {
      const copy = [...p];
      copy[dragIndex] = [nx, ny];
      return copy;
    });
  };

  const onMouseUp = () => setDragIndex(null);
  const onMouseLeave = () => setDragIndex(null);
  const undo = () => {
    setIsClosed(false);
    setPoints((p) => p.slice(0, -1));
  };
  const reset = () => {
    setPoints([]);
    setIsClosed(false);
  };
  const close = () => {
    if (points.length >= 3) setIsClosed(true);
  };

  const exportPoints = () => {
    if (points.length < 3) return;
    const norm = points.map(([x, y]) => [
      Math.round((x / natural.w) * 1000),
      Math.round((y / natural.h) * 1000),
    ]);
    const str = norm.map(([x, y]) => `${x},${y}`).join(" ");
  
    if (onExport) onExport(str); // Wywołaj funkcję z EditorPage
  
    reset(); // Wyczyść edytor
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
        <button onClick={undo} disabled={points.length === 0}>Cofnij punkt</button>
        <button onClick={reset} disabled={points.length === 0}>Resetuj</button>
        <button onClick={close} disabled={isClosed || points.length < 3}>Zamknij kształt</button>
        <button onClick={exportPoints} disabled={points.length < 3}>Dodaj Hotspot</button>
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
        <svg
          className="polyEditor__overlay"
          viewBox={`0 0 ${natural.w} ${natural.h}`}
          preserveAspectRatio="none"
        >
          {initialItems.map(item => (
            <polygon key={item.id} points={toPxPoints(item.points)} className="pe__path is-saved" />
          ))}
          {points.length > 0 && (
            <path d={pathD} className={`pe__path ${isClosed ? "is-closed" : ""}`} />
          )}
          
          {/* 👇 TEN FRAGMENT ZOSTAŁ PRZYWRÓCONY 👇 */}
          {!isClosed && points.length > 0 && (
            <PolylineToCursor points={points} wrapRef={wrapRef} natural={natural} />
          )}
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
          {/* ------------------------------------ */}
        </svg>
      </div>
    </div>
  );
}