// src/components/CollectionManager/CollectionManager.jsx

import { useEffect, useState } from "react";
import {
  listCollections,
  upsertCollection,
  listLooks,
  addLook,
} from "../../lib/lookbookStorage";
import "./collectionManager.scss";

// Dodajemy nowy prop: onLookUpdate, aby odświeżyć karuzelę w S3
export default function CollectionManager({ onCollectionUpdate, onLookUpdate }) {
  const [collections, setCollections] = useState([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);
  const [looks, setLooks] = useState([]);

  // Stany dla formularzy
  const [newCollectionData, setNewCollectionData] = useState({ id: "", title: "", cover: "" });
  const [newLookData, setNewLookData] = useState({ id: "", title: "", src: "" });

  // --- Funkcje pomocnicze ---
  const fetchCollections = () => {
    setCollections(listCollections());
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  // Reaguj na wybór kolekcji i wczytaj jej looki
  useEffect(() => {
    if (selectedCollectionId) {
      setLooks(listLooks(selectedCollectionId));
    } else {
      setLooks([]); // Wyczyść listę, jeśli żadna kolekcja nie jest wybrana
    }
  }, [selectedCollectionId]);

  // --- Handlery zdarzeń ---
  const handleAddCollection = (e) => {
    e.preventDefault();
    const { id, title, cover } = newCollectionData;
    if (!id || !title || !cover) return alert("Wypełnij wszystkie pola kolekcji!");
    
    upsertCollection(id, { title, cover });
    setNewCollectionData({ id: "", title: "", cover: "" });
    fetchCollections();
    if (onCollectionUpdate) onCollectionUpdate();
  };

  const handleAddLook = (e) => {
    e.preventDefault();
    const { id, title, src } = newLookData;
    if (!id || !title || !src) return alert("Wypełnij wszystkie pola looka!");
    if (!selectedCollectionId) return alert("Najpierw wybierz kolekcję!");

    addLook(selectedCollectionId, { lookId: id, title, src });
    setNewLookData({ id: "", title: "", src: "" });
    setLooks(listLooks(selectedCollectionId)); // Odśwież listę looków w menedżerze
    if (onLookUpdate) onLookUpdate(); // Poinformuj S3, żeby odświeżyło karuzelę
  };

  return (
    <div className="collection-manager">
      <h4>Menedżer Kolekcji</h4>

      {/* === SEKCJA 1: ZARZĄDZANIE KOLEKCJAMI === */}
      <div className="manager-section">
        <h5>1. Wybierz lub dodaj kolekcję</h5>
        <ul className="collection-list selectable">
          {collections.map((c) => (
            <li
              key={c.collectionId}
              className={c.collectionId === selectedCollectionId ? "is-active" : ""}
              onClick={() => setSelectedCollectionId(c.collectionId)}
            >
              {c.title}
            </li>
          ))}
        </ul>
        <form className="add-collection-form" onSubmit={handleAddCollection}>
          <input
            type="text" name="id" placeholder="ID kolekcji (np. fall25)"
            value={newCollectionData.id} onChange={(e) => setNewCollectionData({...newCollectionData, id: e.target.value})}
          />
          {/* ... pozostałe inputy bez zmian ... */}
        </form>
      </div>

      {/* === SEKCJA 2: ZARZĄDZANIE LOOKAMI W WYBRANEJ KOLEKCJI === */}
      {selectedCollectionId && (
        <div className="manager-section">
          <h5>2. Dodaj look do "{collections.find(c => c.collectionId === selectedCollectionId)?.title}"</h5>
          <ul className="look-list">
            {looks.map(l => <li key={l.lookId}>{l.title}</li>)}
          </ul>
          <form className="add-look-form" onSubmit={handleAddLook}>
            <input
              type="text" name="id" placeholder="ID looka (np. fall25_01)"
              value={newLookData.id} onChange={(e) => setNewLookData({...newLookData, id: e.target.value})}
            />
            <input
              type="text" name="title" placeholder="Tytuł looka (np. Stylizacja 1)"
              value={newLookData.title} onChange={(e) => setNewLookData({...newLookData, title: e.target.value})}
            />
            <input
              type="text" name="src" placeholder="Ścieżka do zdjęcia (np. /assets/looks/fall25_01.png)"
              value={newLookData.src} onChange={(e) => setNewLookData({...newLookData, src: e.target.value})}
            />
            <button type="submit">Dodaj look</button>
          </form>
        </div>
      )}
      {/* 👇 DODAJ TEN LINK NA SAMYM DOLE 👇 */}
      {selectedCollectionId && (
        <a 
          className="editor-link-button"
          href={`/editor?imageId=${looks[0]?.lookId || ''}&src=${looks[0]?.src || ''}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Otwórz Edytor Hotspotów
        </a>
      )}
    </div>
  );
}