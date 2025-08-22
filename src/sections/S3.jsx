import { useEffect, useState, useRef } from "react";
import LookBook from "../components/Lookbook/LookBook";
import CollectionManager from "../components/CollectionManager/CollectionManager";
import {
  listCollections,
  listLooks,
  upsertCollection,
  addLook,
} from "../lib/lookbookStorage";

// Kluczowe importy do obsługi logowania
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

import "../styles/lookbookCarousel.scss";

/* Demo bootstrap (zostaje bez zmian) */
function ensureDemoData() {
  const collectionId = "spring25";
  if (listLooks(collectionId).length > 0) return;
  upsertCollection("spring25", { title: "Spring 2025", cover: "/assets/covers/spring25.jpg" });
  addLook("spring25", { lookId: "s25_01", src: "/assets/spring25/01.png", title: "Look 1" });
  addLook("spring25", { lookId: "s25_02", src: "/assets/spring25/02.png", title: "Look 2" });
  addLook("spring25", { lookId: "s25_03", src: "/assets/s1.png", title: "Look 3" });
}

export default function S3() {
  // Pobieramy stan zalogowania i funkcję wylogowania z naszego AuthContext
  const { currentUser, isAdmin, logout } = useAuth();
  const [collections, setCollections] = useState([]);
  const [activeCollectionId, setActiveCollectionId] = useState(null);
  const [looks, setLooks] = useState([]);
  const [activeLookId, setActiveLookId] = useState(null);
  const carouselRef = useRef(null);

  const refreshCollections = () => {
    setCollections(listCollections());
  };

  const refreshLooks = () => {
    if (activeCollectionId) {
      const updatedLooks = listLooks(activeCollectionId);
      setLooks(updatedLooks);
      if (!activeLookId && updatedLooks.length > 0) {
        setActiveLookId(updatedLooks[0].lookId);
      }
    }
  };

  useEffect(() => {
    ensureDemoData();
    const allCollections = listCollections();
    setCollections(allCollections);
    if (allCollections.length > 0 && !activeCollectionId) {
      setActiveCollectionId(allCollections[0].collectionId);
    }
  }, []);

  useEffect(() => {
    if (!activeCollectionId) {
      setLooks([]);
      setActiveLookId(null);
      return;
    }
    const collectionLooks = listLooks(activeCollectionId);
    setLooks(collectionLooks);
    if (collectionLooks.length > 0) {
      setActiveLookId(collectionLooks[0].lookId);
    } else {
      setActiveLookId(null);
    }
  }, [activeCollectionId]);

  const activeLook = looks.find((l) => l.lookId === activeLookId);

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
      {/* Pasek Admina z przyciskiem logowania/wylogowania */}
      <div className="admin-bar">
        {currentUser ? (
          <button onClick={logout}>Wyloguj</button>
        ) : (
          <Link to="/login">Admin</Link>
        )}
      </div>

      <div className="details__grid">
        {/* Warunkowe renderowanie menedżera - widoczny tylko dla zalogowanego admina */}
        {isAdmin && (
          <div className="details__media">
            <CollectionManager
              onCollectionUpdate={refreshCollections}
              onLookUpdate={refreshLooks}
            />
          </div>
        )}

        <div className="details__lookbook">
          <div className="lookbook-viewer">
            <div className="collection-tags">
              {collections.map((c) => (
                <button
                  key={c.collectionId}
                  className={`tag-button ${c.collectionId === activeCollectionId ? "is-active" : ""
                    }`}
                  onClick={() => setActiveCollectionId(c.collectionId)}
                >
                  {c.title}
                </button>
              ))}
            </div>

            {activeLook && (
              <div className="lookbook-viewer__carousel">
                <button className="carousel-nav prev" onClick={() => scrollCarousel("left")}>
                  &#8249;
                </button>
                <div className="carousel-track" ref={carouselRef}>
                  {looks.map((look) => (
                    <button
                      key={look.lookId}
                      className={`carousel-thumb ${look.lookId === activeLookId ? "is-active" : ""
                        }`}
                      onClick={() => setActiveLookId(look.lookId)}
                    >
                      <img src={look.src} alt={look.title} />
                    </button>
                  ))}
                </div>
                <button className="carousel-nav next" onClick={() => scrollCarousel("right")}>
                  &#8250;
                </button>
              </div>
            )}

            {activeLook && (
              <div className="lookbook-viewer__main">
                <LookBook
                  imageId={activeLook.lookId}
                  image={activeLook.src}
                  alt={activeLook.title}
                />
              </div>
            )}

            {!activeLook && <p>Wybierz kolekcję lub dodaj do niej stylizacje.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}