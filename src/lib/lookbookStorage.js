const KEY = "overo_lookbook_v1";

/* --- Core helpers --- */
function getAll() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { collections: {}, images: {} };
    const data = JSON.parse(raw);

    // MIGRACJA: jeśli stary format (np. tylko images), dokończ strukturę
    return {
      collections: data.collections || {},
      images: data.images || {},
    };
  } catch {
    return { collections: {}, images: {} };
  }
}

function setAll(db) {
  const safe = {
    collections: db?.collections || {},
    images: db?.images || {},
  };
  localStorage.setItem(KEY, JSON.stringify(safe));
}

/* --- Collections API --- */
export function listCollections() {
  const db = getAll();
  const col = db.collections || {};
  return Object.entries(col).map(([collectionId, c]) => ({ collectionId, ...c }));
}

export function getCollection(collectionId) {
  const db = getAll();
  const col = db.collections || {};
  return col[collectionId] || { title: "", cover: "", looks: [] };
}

export function upsertCollection(collectionId, data) {
  const db = getAll();
  const col = db.collections || {};
  const prev = col[collectionId] || { title: "", cover: "", looks: [] };
  col[collectionId] = { ...prev, ...data, looks: prev.looks || [] };
  setAll({ ...db, collections: col });
}

export function addLook(collectionId, look) {
  // look: { lookId, src, title }
  const db = getAll();
  const col = db.collections || {};
  const images = db.images || {};

  if (!col[collectionId]) {
    col[collectionId] = { title: "", cover: "", looks: [] };
  }
  const exists = (col[collectionId].looks || []).some((l) => l.lookId === look.lookId);
  if (!exists) {
    col[collectionId].looks = [...(col[collectionId].looks || []), look];
  }

  images[look.lookId] = images[look.lookId] || { meta: {}, items: [] };
  images[look.lookId].meta = {
    ...(images[look.lookId].meta || {}),
    collectionId,
    src: look.src,
  };

  setAll({ collections: col, images });
}

export function listLooks(collectionId) {
  return getCollection(collectionId).looks || [];
}

/* --- Images / hotspots API --- */
export function getItems(imageId) {
  const db = getAll();
  const images = db.images || {};
  return images[imageId]?.items || [];
}

export function setItems(imageId, items, meta = {}) {
  const db = getAll();
  const images = db.images || {};
  images[imageId] = images[imageId] || { meta: {}, items: [] };
  images[imageId].items = items || [];
  images[imageId].meta = { ...(images[imageId].meta || {}), ...meta };
  setAll({ ...db, images });
}

export function addItem(imageId, item) {
  const db = getAll();
  const images = db.images || {};
  images[imageId] = images[imageId] || { meta: {}, items: [] };
  images[imageId].items = [...(images[imageId].items || []), item];
  setAll({ ...db, images });
}

export function removeItem(imageId, id) {
  const db = getAll();
  const images = db.images || {};
  if (!images[imageId]) return;
  images[imageId].items = (images[imageId].items || []).filter((it) => it.id !== id);
  setAll({ ...db, images });
}

export function updateItem(imageId, id, patch) {
  const db = getAll();
  const images = db.images || {};
  if (!images[imageId]) return;
  images[imageId].items = (images[imageId].items || []).map((it) =>
    it.id === id ? { ...it, ...patch } : it
  );
  setAll({ ...db, images });
}
