import { useEffect, useState, useRef } from "react";
import LookBook from "../components/Lookbook/LookBook";
import {
  listCollections,
  listLooks,
  upsertCollection,
  addLook,
} from "../lib/lookbookStorage";

// Importujemy NOWE style karuzeli, stare 'lookModal.scss' nie będzie już potrzebne
import "../styles/lookbookCarousel.scss";

/* Demo bootstrap (zostaje bez zmian) */
function ensureDemoData() {
  const collectionId = "spring25";
  if (listLooks(collectionId).length > 0) return;

  upsertCollection("spring25", {
    title: "Spring 2025",
    cover: "/assets/covers/spring25.jpg",
  });
  addLook("spring25", {
    lookId: "s25_01",
    src: "/assets/spring25/01.png",
    title: "Look 1",
  });
  addLook("spring25", {
    lookId: "s25_02",
    src: "/assets/spring25/02.png",
    title: "Look 2",
  });
  addLook("spring25", {
    lookId: "s25_03",
    src: "/assets/s1.png",
    title: "Look 3",
  });
}

export default function S3() {
  const [collections, setCollections] = useState([]);
  const [activeCollection, setActiveCollection] = useState(null);
  const [looks, setLooks] = useState([]);

  // Zamiast 'openLook' mamy 'activeLookId' do śledzenia wybranego zdjęcia
  const [activeLookId, setActiveLookId] = useState(null);
  const carouselRef = useRef(null); // Referencja do przewijania karuzeli

  useEffect(() => {
    ensureDemoData();
    setCollections(listCollections());
  }, []);

  // Ten useEffect teraz nie tylko wczytuje looki, ale też ustawia pierwszy jako aktywny
  useEffect(() => {
    if (!activeCollection) {
      setLooks([]);
      setActiveLookId(null);
      return;
    }
    const collectionLooks = listLooks(activeCollection);
    setLooks(collectionLooks);

    if (collectionLooks.length > 0) {
      setActiveLookId(collectionLooks[0].lookId);
    } else {
      setActiveLookId(null);
    }
  }, [activeCollection]);

  const activeLook = looks.find((l) => l.lookId === activeLookId);

  // Funkcja do przewijania karuzeli
  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.offsetWidth * 0.8;
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="sec details" aria-label="Lookbook kolekcje">
      <div className="details__grid">
        {/* Lewa kolumna bez zmian */}
        <div className="details__media">
          <img src="/assets/s3_details.png" alt="Szczegóły kolekcji" />
        </div>

        {/* Prawa kolumna - logika wyboru kolekcji zostaje, widok looków się zmienia */}
        <div className="details__lookbook">
          {!activeCollection ? (
            // 1. Widok wyboru kolekcji (bez zmian)
            <>
              <h2 className="lb__h">Kolekcje</h2>
              <div className="collectionsGrid">
                {collections.map((c) => (
                  <button
                    key={c.collectionId}
                    className="collectionCard"
                    onClick={() => setActiveCollection(c.collectionId)}
                  >
                    <img src={c.cover} alt={c.title} />
                    <strong>{c.title}</strong>
                  </button>
                ))}
              </div>
            </>
          ) : (
            // 2. NOWY Widok aktywnej kolekcji z karuzelą (zamiast siatki i modala)
            <div className="lookbook-viewer">
              <div className="lb__head">
                <button
                  className="btn"
                  onClick={() => setActiveCollection(null)}
                >
                  ← Wróć
                </button>
                <h2 className="lb__h">
                  {
                    collections.find((x) => x.collectionId === activeCollection)
                      ?.title
                  }
                </h2>

                {/* 👇 DODAJ TEN LINK 👇 */}
                {activeLook && (
                  <a
                    className="editor-link" // Damy mu osobną klasę do stylizacji
                    href={`/editor?imageId=${encodeURIComponent(
                      activeLook.lookId
                    )}&src=${encodeURIComponent(activeLook.src)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Edytuj ten look
                  </a>
                )}
              </div>

              {activeLook ? (
                <>
                  {/* Duży, interaktywny obraz */}
                  <div className="lookbook-viewer__main">
                    <LookBook
                      imageId={activeLook.lookId}
                      image={activeLook.src}
                      alt={activeLook.title}
                    />
                  </div>

                  {/* Karuzela z miniaturami */}
                  <div className="lookbook-viewer__carousel">
                    <button
                      className="carousel-nav prev"
                      onClick={() => scrollCarousel("left")}
                    >
                      &#8249;
                    </button>
                    <div className="carousel-track" ref={carouselRef}>
                      {looks.map((look) => (
                        <button
                          key={look.lookId}
                          className={`carousel-thumb ${
                            look.lookId === activeLookId ? "is-active" : ""
                          }`}
                          onClick={() => setActiveLookId(look.lookId)}
                        >
                          <img src={look.src} alt={look.title} />
                        </button>
                      ))}
                    </div>
                    <button
                      className="carousel-nav next"
                      onClick={() => scrollCarousel("right")}
                    >
                      &#8250;
                    </button>
                  </div>
                </>
              ) : (
                <p>Brak stylizacji w tej kolekcji.</p>
              )}
            </div>
          )}

          {/* Usunęliśmy całą logikę modala, bo nie jest już potrzebna */}
        </div>
      </div>
    </section>
  );
}
