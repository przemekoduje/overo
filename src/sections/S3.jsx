// src/sections/S3.jsx

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

// Funkcja ensureDemoData bez zmian
async function ensureDemoData() {
  const collectionId = "spring25";
  const looks = await listLooks(collectionId);
  if (looks.length > 0) return;
  await upsertCollection("spring25", { title: "Spring 2025", cover: "/assets/covers/spring25.jpg" });
  await addLook("spring25", { lookId: "s25_01", src: "/assets/spring25/01.png", title: "Look 1" });
  await addLook("spring25", { lookId: "s25_02", src: "/assets/spring25/02.png", title: "Look 2" });
  await addLook("spring25", { lookId: "s25_03", src: "/assets/s1.png", title: "Look 3" });
}

export default function S3() {
  // POPRAWKA: Pobieramy 'currentUser', 'isAdmin' i 'logout' z kontekstu
  const { currentUser, isAdmin, logout } = useAuth();

  // Cała reszta logiki stanów i useEffect pozostaje bez zmian
  const [collections, setCollections] = useState([]);
  const [activeCollectionId, setActiveCollectionId] = useState(null);
  const [looks, setLooks] = useState([]);
  const [activeLookId, setActiveLookId] = useState(null);
  const carouselRef = useRef(null);

  const refreshCollections = async () => {
    const collectionsFromDB = await listCollections();
    setCollections(collectionsFromDB);
  };

  const refreshLooks = async () => {
    if (activeCollectionId) {
      const updatedLooks = await listLooks(activeCollectionId);
      setLooks(updatedLooks);
      if (!activeLookId && updatedLooks.length > 0) {
        setActiveLookId(updatedLooks[0].lookId);
      }
    }
  };

  useEffect(() => {
    async function loadInitialData() {
      await ensureDemoData();
      const allCollections = await listCollections();
      setCollections(allCollections);
      if (allCollections.length > 0 && !activeCollectionId) {
        setActiveCollectionId(allCollections[0].collectionId);
      }
    }
    loadInitialData();
  }, []);

  useEffect(() => {
    async function loadLooksForCollection() {
      if (!activeCollectionId) {
        setLooks([]);
        setActiveLookId(null);
        return;
      }
      const collectionLooks = await listLooks(activeCollectionId);
      setLooks(collectionLooks);
      if (collectionLooks.length > 0) {
        setActiveLookId(collectionLooks[0].lookId);
      } else {
        setActiveLookId(null);
      }
    }
    loadLooksForCollection();
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

  // 👇 TUTAJ BYŁ BŁĄD - ZASTĘPUJEMY CAŁĄ SEKCJĘ RETURN 👇
  return (
    <section className="sec details" aria-label="Lookbook kolekcje">
      <div className="admin-bar">
        {currentUser ? (
          <button onClick={logout}>Wyloguj</button>
        ) : (
          <Link to="/login">Admin</Link>
        )}
      </div>
      <div className="details__grid">
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
                  className={`tag-button ${
                    c.collectionId === activeCollectionId ? "is-active" : ""
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
                      className={`carousel-thumb ${
                        look.lookId === activeLookId ? "is-active" : ""
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