import { useEffect,useState } from "react";
import LookBook from "../components/Lookbook/LookBook";
import "../styles/lookModal.scss";
import { listCollections, listLooks, upsertCollection, addLook } from "../lib/lookbookStorage";

/* Demo bootstrap (opcjonalnie: tylko na start, jeśli localStorage puste) */
function ensureDemoData() {
    const hasAny = listCollections().length > 0;
    if (hasAny) return;
    upsertCollection("spring25", { title: "Spring 2025", cover: "/assets/covers/spring25.jpg" });
    addLook("spring25", { lookId: "s25_01", src: "/assets/spring25/01.png", title: "Look 1" });
    addLook("spring25", { lookId: "s25_02", src: "/assets/spring25/02.png", title: "Look 2" });
  }
  
  export default function S3() {
    const [collections, setCollections] = useState([]);
    const [activeCollection, setActiveCollection] = useState(null); // collectionId
    const [looks, setLooks] = useState([]);                         // looks in collection
    const [openLook, setOpenLook] = useState(null);                 // lookId (== imageId)
  
    useEffect(() => {
      ensureDemoData();
      setCollections(listCollections());
    }, []);
  
    useEffect(() => {
      if (!activeCollection) return;
      setLooks(listLooks(activeCollection));
    }, [activeCollection]);
  
    return (
      <section className="sec details" aria-label="Lookbook kolekcje">
        <div className="details__grid">
          {/* panel z detalami po lewej — zostawiamy jak masz */}
          <div className="details__media">
            <img src="/assets/s3_details.png" alt="" />
          </div>
  
          {/* prawa kolumna: najpierw lista kolekcji, potem lista looków */}
          <div className="details__lookbook">
            {!activeCollection ? (
              <>
                <h2 className="lb__h">Kolekcje</h2>
                <div className="collectionsGrid">
                  {collections.map((c) => (
                    <button key={c.collectionId} className="collectionCard" onClick={() => setActiveCollection(c.collectionId)}>
                      <img src={c.cover} alt={c.title} />
                      <strong>{c.title}</strong>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="lb__head">
                  <button className="btn" onClick={() => setActiveCollection(null)}>← Wróć</button>
                  <h2 className="lb__h">{collections.find(x => x.collectionId === activeCollection)?.title}</h2>
                </div>
                <div className="looksGrid">
                  {looks.map((l) => (
                    <button key={l.lookId} className="lookThumb" onClick={() => setOpenLook(l.lookId)}>
                      <img src={l.src} alt={l.title} />
                      <span>{l.title}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
  
            {/* Modal: powiększony look z hotspotami */}
            {openLook && (
              <div className="lookModal" onClick={() => setOpenLook(null)}>
                <div className="lookModal__dialog" onClick={(e) => e.stopPropagation()}>
                  <LookBook
                    imageId={openLook}
                    image={looks.find(l => l.lookId === openLook)?.src}
                    alt={looks.find(l => l.lookId === openLook)?.title || ""}
                  />
                  <div className="lookModal__tools">
                    <a
                      className="btn"
                      href={`/editor?imageId=${encodeURIComponent(openLook)}&src=${encodeURIComponent(looks.find(l => l.lookId === openLook)?.src || "")}`}
                      target="_blank" rel="noopener noreferrer"
                    >
                      Otwórz w edytorze
                    </a>
                    <button className="btn" onClick={() => setOpenLook(null)}>Zamknij</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }