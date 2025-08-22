// src/components/CollectionManager/CollectionManager.jsx

import { useEffect, useState } from "react";
import {
  listCollections,
  upsertCollection,
  listLooks,
  addLook,
} from "../../lib/lookbookStorage";
import "./collectionManager.scss";

export default function CollectionManager({ onCollectionUpdate, onLookUpdate }) {
  const [collections, setCollections] = useState([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);
  const [looks, setLooks] = useState([]);

  const [newCollectionData, setNewCollectionData] = useState({ id: "", title: "", cover: "" });
  const [newLookData, setNewLookData] = useState({ id: "", title: "", src: "" });

  const fetchCollections = () => {
    setCollections(listCollections());
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    if (selectedCollectionId) {
      setLooks(listLooks(selectedCollectionId));
    } else {
      setLooks([]);
    }
  }, [selectedCollectionId]);

  // --- KLUCZOWA POPRAWKA: Uniwersalna funkcja do obsługi zmian w inputach ---
  const handleCollectionInputChange = (e) => {
    const { name, value } = e.target;
    setNewCollectionData(prev => ({ ...prev, [name]: value }));
  };

  const handleLookInputChange = (e) => {
    const { name, value } = e.target;
    setNewLookData(prev => ({ ...prev, [name]: value }));
  };
  
  // --- Funkcje do obsługi formularzy (bez zmian w logice) ---
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
    setLooks(listLooks(selectedCollectionId));
    if (onLookUpdate) onLookUpdate();
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
        {/* 👇 TUTAJ ZNAJDUJE SIĘ PRZYWRÓCONY FORMULARZ KOLEKCJI 👇 */}
        <form className="add-collection-form" onSubmit={handleAddCollection}>
          <input
            type="text" name="id" placeholder="ID kolekcji (np. fall25)"
            value={newCollectionData.id} onChange={handleCollectionInputChange}
          />
          <input
            type="text" name="title" placeholder="Tytuł (np. Fall 2025)"
            value={newCollectionData.title} onChange={handleCollectionInputChange}
          />
          <input
            type="text" name="cover" placeholder="Ścieżka do okładki"
            value={newCollectionData.cover} onChange={handleCollectionInputChange}
          />
          <button type="submit">Dodaj kolekcję</button>
        </form>
      </div>

      {/* === SEKCJA 2: ZARZĄDZANIE LOOKAMI === */}
      {selectedCollectionId && (
        <div className="manager-section">
          <h5>2. Zarządzaj lookami w "{collections.find(c => c.collectionId === selectedCollectionId)?.title}"</h5>
          <ul className="look-list">
            {looks.length > 0 ? (
              looks.map(l => (
                <li key={l.lookId}>
                  <span>{l.title} <small>(ID: {l.lookId})</small></span>
                  <a
                    href={`/editor?imageId=${encodeURIComponent(l.lookId)}&src=${encodeURIComponent(l.src)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="edit-look-btn"
                  >
                    Edytuj Hotspoty
                  </a>
                </li>
              ))
            ) : (
              <p className="empty-list">Brak looków w tej kolekcji.</p>
            )}
          </ul>
          {/* 👇 TUTAJ ZNAJDUJE SIĘ PRZYWRÓCONY FORMULARZ LOOKÓW 👇 */}
          <form className="add-look-form" onSubmit={handleAddLook}>
            <input
              type="text" name="id" placeholder="ID looka (np. fall25_01)"
              value={newLookData.id} onChange={handleLookInputChange}
            />
            <input
              type="text" name="title" placeholder="Tytuł looka"
              value={newLookData.title} onChange={handleLookInputChange}
            />
            <input
              type="text" name="src" placeholder="Ścieżka do zdjęcia"
              value={newLookData.src} onChange={handleLookInputChange}
            />
            <button type="submit">Dodaj look</button>
          </form>
        </div>
      )}
    </div>
  );
}