const KEY = "overo_lookbook_v1";

/** pobierz cały obiekt z localStorage */
function getAll() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || { images: {} };
  } catch {
    return { images: {} };
  }
}

/** zapisz cały obiekt */
function setAll(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

/** lista imageId z metadanymi */
export function listImages() {
  const db = getAll();
  return Object.entries(db.images).map(([imageId, rec]) => ({ imageId, ...rec.meta }));
}

/** pobierz items (poligony) dla obrazka */
export function getItems(imageId) {
  const db = getAll();
  return db.images[imageId]?.items || [];
}

/** ustaw items (nadpisz) */
export function setItems(imageId, items, meta = {}) {
  const db = getAll();
  if (!db.images[imageId]) db.images[imageId] = { meta: {}, items: [] };
  db.images[imageId].items = items;
  db.images[imageId].meta = { ...(db.images[imageId].meta || {}), ...meta };
  setAll(db);
}

/** dodaj item */
export function addItem(imageId, item) {
  const db = getAll();
  if (!db.images[imageId]) db.images[imageId] = { meta: {}, items: [] };
  db.images[imageId].items.push(item);
  setAll(db);
}

/** usuń item po id */
export function removeItem(imageId, id) {
  const db = getAll();
  if (!db.images[imageId]) return;
  db.images[imageId].items = db.images[imageId].items.filter((it) => it.id !== id);
  setAll(db);
}

/** podmień item po id */
export function updateItem(imageId, id, patch) {
  const db = getAll();
  if (!db.images[imageId]) return;
  db.images[imageId].items = db.images[imageId].items.map((it) =>
    it.id === id ? { ...it, ...patch } : it
  );
  setAll(db);
}
