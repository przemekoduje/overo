// src/pages/EditorPage/EditorPage.jsx

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getItems, addItem, removeItem, setItems } from "../../lib/lookbookStorage";
import "./editorPage.scss";
import PolyEditor from "../../components/Lookbook/PolyEditor";

// Komponent dla formularza nowego hotspotu
function NewHotspotForm({ points, collectionId, imageId, onSave }) {
  const [title, setTitle] = useState("Nowy Hotspot");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [url, setUrl] = useState("#");

  const handleSave = async () => {
    const id = `item_${Date.now()}`;
    const newItem = { id, title, brand, price, url, points };
    await addItem(collectionId, imageId, newItem);
    onSave(); // Poinformuj stronę nadrzędną o zapisie
  };

  return (
    <div className="new-hotspot-form">
      <h4>Dodaj dane dla nowego hotspotu</h4>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tytuł" />
      <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Marka" />
      <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Cena" />
      <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL do sklepu" />
      <button className="btn" onClick={handleSave}>Zapisz Hotspot w Bazie</button>
    </div>
  );
}

export default function EditorPage() {
  const [searchParams] = useSearchParams();
  const collectionId = searchParams.get("collectionId");
  const imageId = searchParams.get("imageId");
  const src = searchParams.get("src");

  const [items, setStateItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newHotspotPoints, setNewHotspotPoints] = useState(null); // Stan na przechowanie punktów

  const fetchItems = async () => {
    if (collectionId && imageId) {
      const itemsFromDB = await getItems(collectionId, imageId);
      setStateItems(itemsFromDB);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchItems().finally(() => setIsLoading(false));
  }, [collectionId, imageId]);
  
  // Ta funkcja jest teraz bardzo prosta - tylko zapisuje punkty w stanie
  const handleExport = (points) => {
    setNewHotspotPoints(points);
  };

  const handleSaveNewHotspot = () => {
    setNewHotspotPoints(null); // Ukryj formularz
    fetchItems(); // Odśwież listę hotspotów
  };

  // ... funkcje saveAll i handleRemoveItem bez zmian ...

  if (isLoading) {
    return <div className="editorPage"><p>Ładowanie...</p></div>;
  }

  return (
    <div className="editorPage">
      <header>{/* ... bez zmian ... */}</header>

      {src ? (
        <section className="stage">
          <PolyEditor image={src} initialItems={items} onExport={handleExport} />
        </section>
      ) : (
        <p>Brak obrazu do edycji.</p>
      )}

      {/* 👇 NOWY FORMULARZ, WIDOCZNY TYLKO PO NARYSOWANIU KSZTAŁTU 👇 */}
      {newHotspotPoints && (
        <NewHotspotForm
          points={newHotspotPoints}
          collectionId={collectionId}
          imageId={imageId}
          onSave={handleSaveNewHotspot}
        />
      )}

      <section className="list">
        <h2>Istniejące hotspoty</h2>
        {/* ... lista istniejących hotspotów bez zmian ... */}
      </section>
    </div>
  );
}