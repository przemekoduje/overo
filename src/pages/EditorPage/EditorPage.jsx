import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getItems, setItems, addItem, removeItem } from "../../lib/lookbookStorage";
import "./editorPage.scss";
import PolyEditor from "../../components/Lookbook/PolyEditor";

export default function EditorPage() {
  const [searchParams] = useSearchParams();

  // Dane są teraz pobierane tylko do odczytu z adresu URL
  const collectionId = searchParams.get("collectionId");
  const imageId = searchParams.get("imageId");
  const src = searchParams.get("src");

  const [items, setStateItems] = useState([]);

  useEffect(() => {
    async function loadItems() {
      if (collectionId && imageId) {
        const itemsFromDB = await getItems(collectionId, imageId);
        setStateItems(itemsFromDB);
      }
    }
    loadItems();
  }, [collectionId, imageId]);

  const handleExport = async (points) => {
    const id = `item_${Date.now()}`;
    const newItem = { id, title: "", brand: "", price: "", url: "#", points };
    await addItem(collectionId, imageId, newItem);
    const updatedItems = await getItems(collectionId, imageId);
    setStateItems(updatedItems);
  };

  const saveAll = async () => {
    await setItems(collectionId, imageId, items);
    alert("Zapisano w Firestore!");
  };

  const handleRemoveItem = async (itemId) => {
    await removeItem(collectionId, imageId, itemId);
    const updatedItems = await getItems(collectionId, imageId);
    setStateItems(updatedItems);
  };

  return (
    <div className="editorPage">
      <header>
        <h1>Lookbook Editor</h1>
        <div className="row">
          <label>
            Collection ID:
            {/* POPRAWKA: Pole jest teraz tylko do odczytu */}
            <input value={collectionId || ""} readOnly />
          </label>
          <label>
            Image ID:
            {/* POPRAWKA: Pole jest teraz tylko do odczytu */}
            <input value={imageId || ""} readOnly />
          </label>
          <label>
            Image Source:
            {/* POPRAWKA: Pole jest teraz tylko do odczytu */}
            <input value={src || ""} readOnly />
          </label>
          <button className="btn" onClick={saveAll}>
            Zapisz zmiany
          </button>
        </div>
      </header>

      {/* Sprawdzamy, czy mamy src, zanim wyrenderujemy edytor */}
      {src ? (
        <section className="stage">
          <PolyEditor image={src} onExport={handleExport} />
        </section>
      ) : (
        <p>Brak wybranego obrazu do edycji.</p>
      )}

      <section className="list">
        <h2>Oznaczone elementy</h2>
        <ul>
          {items.map((it) => (
            <li key={it.id} className="itemRow">
              <input
                placeholder="Tytuł"
                value={it.title || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setStateItems((p) =>
                    p.map((x) => (x.id === it.id ? { ...x, title: val } : x))
                  );
                }}
              />
              {/* Tutaj możesz dodać resztę inputów (brand, price, url) */}
              <button className="btn" onClick={() => handleRemoveItem(it.id)}>
                Usuń
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}