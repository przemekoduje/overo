// src/components/CollectionManager/CollectionManager.jsx

import { useEffect, useState } from "react";
import {
  listCollections,
  upsertCollection,
  listLooks,
  addLook,
  deleteCollection,
  deleteLook,
} from "../../lib/lookbookStorage";
import "./collectionManager.scss";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebaseConfig";

export default function CollectionManager({
  onCollectionUpdate,
  onLookUpdate,
}) {
  const [collections, setCollections] = useState([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);
  const [looks, setLooks] = useState([]);
  const [deletingCollectionId, setDeletingCollectionId] = useState(null);
  const [deletingLookId, setDeletingLookId] = useState(null);

  const [newCollectionData, setNewCollectionData] = useState({
    id: "",
    title: "",
  });
  const [newLookData, setNewLookData] = useState({
    id: "",
    title: "",
    src: "",
  });
  const [imageFile, setImageFile] = useState(null);

  // ZMIANA: Ta funkcja jest teraz asynchroniczna
  const fetchCollections = async () => {
    const collectionsFromDB = await listCollections(); // Czekamy na dane z Firestore
    setCollections(collectionsFromDB);
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    // ZMIANA: Ten useEffect też musi być asynchroniczny
    const fetchLooks = async () => {
      if (selectedCollectionId) {
        const looksFromDB = await listLooks(selectedCollectionId); // Czekamy na looki
        setLooks(looksFromDB);
      } else {
        setLooks([]);
      }
    };
    fetchLooks();
  }, [selectedCollectionId]);

  // --- KLUCZOWA POPRAWKA: Uniwersalna funkcja do obsługi zmian w inputach ---
  const handleCollectionInputChange = (e) => {
    const { name, value } = e.target;
    setNewCollectionData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLookInputChange = (e) => {
    const { name, value } = e.target;
    setNewLookData((prev) => ({ ...prev, [name]: value }));
  };

  // ZMIANA: Funkcja obsługi formularza musi być asynchroniczna
  const handleAddCollection = async (e) => {
    e.preventDefault();
    const { id, title } = newCollectionData;
    if (!id || !title) return alert("Wypełnij wszystkie pola kolekcji!");

    await upsertCollection(id, { title }); // Czekamy na zakończenie zapisu
    setNewCollectionData({ id: "", title: "" });

    await fetchCollections(); // Odświeżamy listę
    if (onCollectionUpdate) onCollectionUpdate();
  };

  // ZMIANA: Ta funkcja również staje się asynchroniczna
  const handleAddLook = async (e) => {
    e.preventDefault();
    const { id, title } = newLookData; // Nie potrzebujemy już 'src' z inputa

    // Zabezpieczenia
    if (!id || !title) return alert("Wypełnij ID i Tytuł looka!");
    if (!imageFile) return alert("Wybierz plik ze zdjęciem!");
    if (!selectedCollectionId) return alert("Najpierw wybierz kolekcję!");

    // Logika przesyłania pliku
    const filePath = `looks/${selectedCollectionId}/${id}_${imageFile.name}`;
    const storageRef = ref(storage, filePath);

    // Przesyłamy plik do Firebase Storage
    const snapshot = await uploadBytes(storageRef, imageFile);

    // Pobieramy publiczny URL do przesłanego pliku
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Zapisujemy look w Firestore, używając URL z Firebase Storage
    await addLook(selectedCollectionId, {
      lookId: id,
      title,
      src: downloadURL,
    });

    const updatedLooks = await listLooks(selectedCollectionId); // Odświeżamy listę
    setLooks(updatedLooks);
    if (onLookUpdate) onLookUpdate();
  };

  // funkcja do obsługi usuwania
  const handleDeleteCollection = async (collectionId) => {
    // Pytamy ostatecznie, chociaż mamy UI
    if (
      window.confirm(
        "Czy na pewno chcesz trwale usunąć tę kolekcję i wszystkie jej looki?"
      )
    ) {
      await deleteCollection(collectionId);
      setDeletingCollectionId(null); // Zresetuj stan

      // Odśwież widok
      if (onCollectionUpdate) onCollectionUpdate();
    } else {
      setDeletingCollectionId(null); // Anuluj, jeśli użytkownik kliknie "Nie"
    }
  };

  const handleDeleteLook = async (lookId) => {
    if (!selectedCollectionId) return;

    await deleteLook(selectedCollectionId, lookId);
    setDeletingLookId(null); // Zresetuj stan

    // 👇 KLUCZOWA POPRAWKA: Odśwież lokalną listę looków w tym komponencie 👇
  const updatedLooks = await listLooks(selectedCollectionId);
  setLooks(updatedLooks);


    // Odśwież widok
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
              className={`${
                c.collectionId === selectedCollectionId ? "is-active" : ""
              } ${
                c.collectionId === deletingCollectionId ? "is-deleting" : ""
              }`}
              onClick={() => setSelectedCollectionId(c.collectionId)}
            >
              {/* 4. Zaktualizuj JSX listy kolekcji */}
              {deletingCollectionId === c.collectionId ? (
                <div className="delete-confirm">
                  <span>Na pewno usunąć?</span>
                  <div>
                    <button
                      onClick={() => handleDeleteCollection(c.collectionId)}
                    >
                      Tak
                    </button>
                    <button onClick={() => setDeletingCollectionId(null)}>
                      Nie
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <span>{c.title}</span>
                  <div className="actions">
                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingCollectionId(c.collectionId);
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
        {/* 👇 TUTAJ ZNAJDUJE SIĘ PRZYWRÓCONY FORMULARZ KOLEKCJI 👇 */}
        <form className="add-collection-form" onSubmit={handleAddCollection}>
          <input
            type="text"
            name="id"
            placeholder="ID kolekcji (np. fall25)"
            value={newCollectionData.id}
            onChange={handleCollectionInputChange}
          />
          <input
            type="text"
            name="title"
            placeholder="Tytuł (np. Fall 2025)"
            value={newCollectionData.title}
            onChange={handleCollectionInputChange}
          />
          {/* <input
            type="text" name="cover" placeholder="Ścieżka do okładki"
            value={newCollectionData.cover} onChange={handleCollectionInputChange}
          /> */}
          <button type="submit">Dodaj kolekcję</button>
        </form>
      </div>

      {/* === SEKCJA 2: ZARZĄDZANIE LOOKAMI === */}
      {selectedCollectionId && (
        <div className="manager-section">
          <h5>
            2. Zarządzaj lookami w "
            {
              collections.find((c) => c.collectionId === selectedCollectionId)
                ?.title
            }
            "
          </h5>
          <ul className="look-list">
            {looks.length > 0 ? (
              looks.map((l) => (
                <li
                  key={l.lookId}
                  className={l.lookId === deletingLookId ? "is-deleting" : ""}
                >
                  {deletingLookId === l.lookId ? (
                    <div className="delete-confirm">
                      <span>Na pewno usunąć?</span>
                      <div>
                        <button onClick={() => handleDeleteLook(l.lookId)}>
                          Tak
                        </button>
                        <button onClick={() => setDeletingLookId(null)}>
                          Nie
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span>{l.title}</span>
                      <div className="actions">
                        <a
                          href={`/editor?collectionId=${encodeURIComponent(
                            selectedCollectionId
                          )}&imageId=${encodeURIComponent(
                            l.lookId
                          )}&src=${encodeURIComponent(l.src)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="edit-look-btn"
                        >
                          Edytuj Hotspoty
                        </a>
                        <button
                          className="delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingLookId(l.lookId);
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))
            ) : (
              <p className="empty-list">Brak looków w tej kolekcji.</p>
            )}
          </ul>
          {/* 👇 TUTAJ ZNAJDUJE SIĘ PRZYWRÓCONY FORMULARZ LOOKÓW 👇 */}
          <form className="add-look-form" onSubmit={handleAddLook}>
            <input
              type="text"
              name="id"
              placeholder="ID looka (np. fall25_01)"
              value={newLookData.id}
              onChange={handleLookInputChange}
            />
            <input
              type="text"
              name="title"
              placeholder="Tytuł looka"
              value={newLookData.title}
              onChange={handleLookInputChange}
            />
            <input
              type="file"
              accept="image/png, image/jpeg"
              onChange={(e) => setImageFile(e.target.files[0])}
            />

            <button type="submit">Dodaj look</button>
          </form>
        </div>
      )}
    </div>
  );
}
