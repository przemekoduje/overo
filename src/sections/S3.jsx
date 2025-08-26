// src/sections/S3.jsx

import React, { useEffect, useState, useRef } from "react";
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
import { useHorizontalScroll } from '../hooks/useHorizontalScroll'; // Importujemy nasz hook do przewijania
import "../styles/lookbookCarousel.scss";

// Funkcja do tworzenia danych demo, jeśli baza jest pusta
async function ensureDemoData() {
  const allCollections = await listCollections();
  if (allCollections.length > 0) return;

  await upsertCollection("spring25", { title: "Spring 2025" });
  await addLook("spring25", { lookId: "s25_01", src: "/assets/spring25/01.png", title: "Look 1" });
  await addLook("spring25", { lookId: "s25_02", src: "/assets/spring25/02.png", title: "Look 2" });
}

export default function S3() {
  // --- Inicjalizacja Stanów i Hooków ---
  const { currentUser, isAdmin, logout } = useAuth();
  const [collections, setCollections] = useState([]);
  const [activeCollectionId, setActiveCollectionId] = useState(null);
  const [looks, setLooks] = useState([]);
  const [activeLookId, setActiveLookId] = useState(null);

  // Wywołujemy hook DWA RAZY - po jednym dla każdego elementu
  const tagsRef = useHorizontalScroll();
  const carouselRef = useHorizontalScroll();

  // --- Funkcje do Zarządzania Danymi ---
  const refreshCollections = async () => {
    const collectionsFromDB = await listCollections();
    setCollections(collectionsFromDB);
  };

  const refreshLooks = async () => {
    if (activeCollectionId) {
      const updatedLooks = await listLooks(activeCollectionId);
      setLooks(updatedLooks);
      const activeLookStillExists = updatedLooks.some((look) => look.lookId === activeLookId);
      if (updatedLooks.length > 0) {
        if (!activeLookStillExists) {
          setActiveLookId(updatedLooks[0].lookId);
        }
      } else {
        setActiveLookId(null);
      }
    }
  };

  // --- Efekty (Ładowanie Danych) ---
  useEffect(() => {
    async function loadInitialData() {
      // await ensureDemoData();
      const allCollections = await listCollections();
      setCollections(allCollections);
      if (allCollections.length > 0) {
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

  // Zmienna pomocnicza do znalezienia aktywnego looka
  const activeLook = looks.find((l) => l.lookId === activeLookId);

  // --- Renderowanie Komponentu (JSX) ---
  return (
    <section className="sec details" aria-label="Lookbook kolekcje">
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
            <div className="collection-tags" ref={tagsRef}>
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
                <p>Wybierz kolekcję lub dodaj do niej stylizacje.</p>
              </div>
            )}

            {activeLook && (
              <div className="lookbook-viewer__carousel">
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
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}