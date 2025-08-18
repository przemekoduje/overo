import { useState } from "react";
import LookBook from "../components/Lookbook/LookBook";
import "../styles/lookModal.scss";

const LOOKS = [
  { imageId: "look1", src: "/assets/s1.png", title: "Look #1" },
  // dodasz kolejne: { imageId:"look2", src:"/assets/s2.png", title:"Look #2" }, ...
];

export default function S3() {
  const [open, setOpen] = useState(null); // imageId otwartego modału

  return (
    <section className="sec details" aria-label="Sekcja 3: lookbook">
      <div className="details__grid">
        <div className="details__media">
          <img src="/assets/s3_details.png" alt="" />
        </div>

        <div className="details__lookbook">
          {/* siatka miniatur */}
          <div className="looksGrid">
            {LOOKS.map((l) => (
              <button key={l.imageId} className="lookThumb" onClick={() => setOpen(l.imageId)}>
                <img src={l.src} alt={l.title} />
                <span>{l.title}</span>
              </button>
            ))}
          </div>

          {/* modal powiększenia + interaktywne hotspoty */}
          {open && (
            <div className="lookModal" onClick={() => setOpen(null)}>
              <div className="lookModal__dialog" onClick={(e) => e.stopPropagation()}>
                <LookBook imageId={open} image={LOOKS.find(l=>l.imageId===open).src} alt={open} />
                <button className="lookModal__close" onClick={() => setOpen(null)}>×</button>
              </div>
            </div>
          )}

          {/* link do edytora (otwiera nowe okno) */}
          <div className="adminTools">
            <a href={`/editor?imageId=${LOOKS[0].imageId}&src=${encodeURIComponent(LOOKS[0].src)}`}
               target="_blank" rel="noopener noreferrer">Otwórz edytor dla {LOOKS[0].title}</a>
          </div>
        </div>
      </div>
    </section>
  );
}
