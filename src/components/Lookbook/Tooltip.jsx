export default function Tooltip({ x, y, title, brand, price, url, onClose }) {
    return (
      <div className="tooltip" style={{ left: x, top: y }}>
        <div className="tooltip__card" role="dialog" aria-label={`${title} — szczegóły`}>
          <div className="tooltip__head">
            <strong className="tooltip__title">{title}</strong>
            {brand && <span className="tooltip__brand">{brand}</span>}
          </div>
          {price && <div className="tooltip__price">{price}</div>}
          <div className="tooltip__actions">
            <a className="btn" href={url} target="_blank" rel="noopener noreferrer">
              Kup teraz
            </a>
            <button className="btn btn--ghost" onClick={onClose}>Zamknij</button>
          </div>
        </div>
      </div>
    );
  }
  