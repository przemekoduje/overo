import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getItems, setItems, addItem, removeItem } from "../../lib/lookbookStorage";
import "./editorPage.scss";
import PolyEditor from "../../components/Lookbook/PolyEditor";

/** Strona admina: /editor?imageId=look1&src=/assets/s1.png */
export default function EditorPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialImageId = searchParams.get("imageId") || "look1";
  const initialSrc = searchParams.get("src") || "/assets/s1.png";

  const [imageId, setImageId] = useState(initialImageId);
  const [src, setSrc] = useState(initialSrc);
  const [items, setStateItems] = useState(() => getItems(initialImageId));

  // kiedy zmieni się imageId (np. po wpisaniu w input), przeładuj items
  useEffect(() => {
    setStateItems(getItems(imageId));
  }, [imageId]);

  // utrzymuj URL w sync ze stanem (wygodne do odświeżenia / udostępnienia)
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    next.set("imageId", imageId);
    next.set("src", src);
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageId, src]);

  const handleExport = (points) => {
    const id = `item_${Date.now()}`;
    const newItem = { id, title: "", brand: "", price: "", url: "#", points };
    addItem(imageId, newItem);
    setStateItems(getItems(imageId));
  };

  const saveAll = () => {
    setItems(imageId, items, { src, updatedAt: Date.now() });
    alert("Zapisano do localStorage");
  };

  return (
    <div className="editorPage">
      <header>
        <h1>Lookbook Editor</h1>
        <div className="row">
          <label>
            imageId:
            <input
              value={imageId}
              onChange={(e) => {
                const v = e.target.value.trim();
                setImageId(v || "look1");
              }}
            />
          </label>

          <label>
            src:
            <input
              value={src}
              onChange={(e) => setSrc(e.target.value)}
              placeholder="/assets/s1.png"
            />
          </label>

          <a
            className="btn"
            href={`/?imageId=${encodeURIComponent(imageId)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Podgląd
          </a>

          <button className="btn" onClick={saveAll}>
            Zapisz
          </button>
        </div>
      </header>

      <section className="stage">
        <PolyEditor image={src} onExport={handleExport} />
      </section>

      <section className="list">
        <h2>Elementy</h2>
        <ul>
          {items.map((it) => (
            <li key={it.id} className="itemRow">
              <input
                placeholder="Tytuł"
                value={it.title || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setStateItems((prev) =>
                    prev.map((x) => (x.id === it.id ? { ...x, title: val } : x))
                  );
                }}
              />
              <input
                placeholder="Brand"
                value={it.brand || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setStateItems((prev) =>
                    prev.map((x) => (x.id === it.id ? { ...x, brand: val } : x))
                  );
                }}
              />
              <input
                placeholder="Cena"
                value={it.price || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setStateItems((prev) =>
                    prev.map((x) => (x.id === it.id ? { ...x, price: val } : x))
                  );
                }}
              />
              <input
                placeholder="URL"
                value={it.url || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setStateItems((prev) =>
                    prev.map((x) => (x.id === it.id ? { ...x, url: val } : x))
                  );
                }}
              />
              <button
                className="btn"
                onClick={() => {
                  removeItem(imageId, it.id);
                  setStateItems(getItems(imageId));
                }}
              >
                Usuń
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
