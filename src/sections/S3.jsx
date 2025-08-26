// src/sections/S3.jsx

import React, { useEffect, useState, useRef } from "react"; // 1. Upewnij się, że 'React' jest zaimportowany
import LookBook from "../components/Lookbook/LookBook";
import CollectionManager from "../components/CollectionManager/CollectionManager";
import {
  listCollections,
  listLooks,
  upsertCollection,
  addLook,
} from "../lib/lookbookStorage";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { useHorizontalScroll } from '../hooks/useHorizontalScroll';
import "../styles/lookbookCarousel.scss";

// Funkcja ensureDemoData bez zmian
async function ensureDemoData() {
  const collectionId = "spring25";
  const looks = await listLooks(collectionId);
  if (looks.length > 0) return;
  await upsertCollection("spring25", { title: "Spring 2025" });
  await addLook("spring25", { lookId: "s25_01", src: "/assets/spring25/01.png", title: "Look 1" });
  await addLook("spring25", { lookId: "s25_02", src: "/assets/spring25/02.png", title: "Look 2" });
  await addLook("spring25", { lookId: "s25_03", src: "/assets/s1.png", title: "Look 3" });
}

// 2. "Opakowujemy" całą definicję komponentu w React.forwardRef
const S3 = React.forwardRef((props, ref) => {
  // 3. Cała logika i stany komponentu znajdują się w środku
  const { currentUser, isAdmin, logout } = useAuth();
  const [collections, setCollections] = useState([]);
  const [activeCollectionId, setActiveCollectionId] = useState(null);
  const [looks, setLooks] = useState([]);
  const [activeLookId, setActiveLookId] = useState(null);
  const carouselRef = useHorizontalScroll();

  const refreshCollections = async () => {
    const collectionsFromDB = await listCollections();
    setCollections(collectionsFromDB);
  };

  const refreshLooks = async () => {
    if (activeCollectionId) {
      const updatedLooks = await listLooks(activeCollectionId);
      setLooks(updatedLooks);
      const activeLookStillExists = updatedLooks.some(
        (look) => look.lookId === activeLookId
      );
      if (updatedLooks.length > 0) {
        if (!activeLookStillExists) {
          setActiveLookId(updatedLooks[0].lookId);
        }
      } else {
        setActiveLookId(null);
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

  // Funkcja scrollCarousel została usunięta, ponieważ logikę przejął hook useHorizontalScroll

  return (
    <section className="sec details" aria-label="Lookbook kolekcje">
      {/* <div className="admin-bar">
        {currentUser ? (
          <button onClick={logout}>Wyloguj</button>
        ) : (
          <Link to="/login">Admin</Link>
        )}
      </div> */}

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
          {/* NOWA STRUKTURA WEWNĄTRZ LOOKBOOK-VIEWER */}
          <div className="lookbook-viewer">
            {/* 1. Tagi kolekcji na samej górze */}
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

            {/* 2. Duży, interaktywny obraz w centrum */}
            {activeLook ? (
              <div className="lookbook-viewer__main">
                <LookBook
                  collectionId={activeCollectionId}
                  imageId={activeLook.lookId}
                  image={activeLook.src}
                  alt={activeLook.title}
                />
              </div>
            ) : (
               <div className="lookbook-viewer__main is-empty">
                  <p>Wybierz kolekcję.</p>
               </div>
            )}


            {/* 3. Karuzela miniatur na samym dole */}
            {activeLook && (
              <div className="lookbook-viewer__carousel">
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
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
});

export default S3;