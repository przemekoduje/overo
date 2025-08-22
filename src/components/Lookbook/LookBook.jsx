import { useEffect, useRef, useState } from "react";
import "./lookBook.scss";
import Tooltip from "./Tooltip";
import { getItems } from "../../lib/lookbookStorage";

/** props:
 * imageId: unikalny klucz (np. "look1")
 * image: ścieżka do obrazu
 */
export default function LookBook({ imageId, image, alt = "" }) {
  const wrapRef = useRef(null);
  const imgRef   = useRef(null);

  const [nat, setNat] = useState({ w: 1000, h: 1500 });
  const [items, setItems] = useState([]);

  /// ZMIANA: useEffect do wczytywania poligonów jest teraz asynchroniczny
  useEffect(() => {
    async function loadItems() {
      if (imageId) {
        const itemsFromDB = await getItems(imageId); // Czekamy na dane z Firestore
        setItems(itemsFromDB);
      }
    }
    loadItems();
  }, [imageId]); // Uruchomi się za każdym razem, gdy zmieni się imageId

  // dopasuj viewBox do naturalnych wymiarów obrazu
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    const onLoad = () =>
      setNat({ w: img.naturalWidth || 1000, h: img.naturalHeight || 1000 });
    if (img.complete) onLoad();
    else img.addEventListener("load", onLoad, { once: true });
  }, []);

  // zamykanie: klik poza + Esc
  useEffect(() => {
    const onDocPointer = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) close();
    };
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("pointerdown", onDocPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDocPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // centroid w układzie 0..1000
  const centroid = (pointsStr) => {
    const pts = pointsStr.trim().split(/\s+/).map(p => p.split(",").map(Number));
    let a = 0, cx = 0, cy = 0;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [x0, y0] = pts[j], [x1, y1] = pts[i];
      const f = x0 * y1 - x1 * y0;
      a += f; cx += (x0 + x1) * f; cy += (y0 + y1) * f;
    }
    a *= 0.5;
    if (Math.abs(a) < 1e-7) {
      const m = pts.reduce((acc, [x, y]) => [acc[0] + x, acc[1] + y], [0, 0]);
      return [m[0] / pts.length, m[1] / pts.length];
    }
    return [cx / (6 * a), cy / (6 * a)];
  };

  // "0..1000" => "px" dla <polygon points>
  const toPxPoints = (pointsStr, w, h) =>
    pointsStr.trim().split(/\s+/).map(p => {
      const [xn, yn] = p.split(",").map(Number);
      return `${(xn / 1000) * w},${(yn / 1000) * h}`;
    }).join(" ");

  const [activeId, setActiveId] = useState(null);
  const [tooltip, setTooltip]   = useState(null); // { x, y, item }

  const hasHover =
    typeof window !== "undefined" && matchMedia("(hover: hover)").matches;

  const open = (item) => {
    setActiveId(item.id);
    const [cxN, cyN] = centroid(item.points);
    setTooltip({ x: cxN, y: cyN, item });
  };

  const close = () => {
    setActiveId(null);
    setTooltip(null);
  };

  return (
    <div className="lookbook" ref={wrapRef}>
      <img
        ref={imgRef}
        className="lookbook__image"
        src={image}
        alt={alt}
        draggable="false"
      />

      <svg
        className="lookbook__overlay"
        viewBox={`0 0 ${nat.w} ${nat.h}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        {items.map((it) => {
          const pxPoints = toPxPoints(it.points, nat.w, nat.h);
          const [cxN, cyN] = centroid(it.points);
          const cx = (cxN / 1000) * nat.w;
          const cy = (cyN / 1000) * nat.h;

          return (
            <g
              key={it.id}
              role="button"
              tabIndex={0}
              className={`poly ${activeId === it.id ? "is-active" : ""}`}
              // Otwórz na hover/focus, ale NIE zamykaj na mouseleave — użytkownik może wejść na tooltip
              onMouseEnter={() => hasHover && open(it)}
              onFocus={() => open(it)}
              onClick={() => (activeId === it.id ? close() : open(it))}
              aria-label={`${it.title || ""}${it.brand ? " — " + it.brand : ""}`}
            >
              <polygon className="poly__shape" points={pxPoints} />
              <circle className="poly__pin" r="12" cx={cx} cy={cy} />
            </g>
          );
        })}
      </svg>

      {tooltip && (
        <div
          className="lookbook__tooltip-anchor"
          style={{ "--tx": tooltip.x, "--ty": tooltip.y }}
        >
          <Tooltip
            x={0}
            y={0}
            onClose={close}
            title={tooltip.item.title}
            brand={tooltip.item.brand}
            price={tooltip.item.price}
            url={tooltip.item.url}
          />
        </div>
      )}
    </div>
  );
}
