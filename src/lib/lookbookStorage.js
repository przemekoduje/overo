// src/lib/lookbookStorage.js

import { db } from "../firebaseConfig";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";

/* --- API KOLEKCJI --- */

export async function listCollections() {
  const collectionsCol = collection(db, "collections");
  const collectionSnapshot = await getDocs(collectionsCol);
  return collectionSnapshot.docs.map((doc) => ({
    collectionId: doc.id,
    ...doc.data(),
  }));
}

export async function upsertCollection(collectionId, data) {
  const collectionRef = doc(db, "collections", collectionId);
  await setDoc(collectionRef, data, { merge: true });
}

/* --- API LOOKÓW (STYLIZACJI) --- */

export async function listLooks(collectionId) {
  const looksCol = collection(db, "collections", collectionId, "looks");
  const looksSnapshot = await getDocs(looksCol);
  return looksSnapshot.docs.map((doc) => ({
    lookId: doc.id,
    ...doc.data(),
  }));
}

export async function addLook(collectionId, lookData) {
  const { lookId, ...data } = lookData;
  const lookRef = doc(db, "collections", collectionId, "looks", lookId);
  await setDoc(lookRef, data);
}

/* --- API HOTSPOTÓW (ITEMS) --- */

export async function getItems(collectionId, lookId) {
  if (!collectionId || !lookId) return [];
  const itemsCol = collection(db, "collections", collectionId, "looks", lookId, "items");
  const itemsSnapshot = await getDocs(itemsCol);
  return itemsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function addItem(collectionId, lookId, itemData) {
  const { id, ...data } = itemData;
  const itemRef = doc(db, "collections", collectionId, "looks", lookId, "items", id);
  await setDoc(itemRef, data);
}

export async function removeItem(collectionId, lookId, itemId) {
  const itemRef = doc(db, "collections", collectionId, "looks", lookId, "items", itemId);
  await deleteDoc(itemRef);
}

export async function setItems(collectionId, lookId, items) {
  const batch = writeBatch(db);
  const itemsColRef = collection(db, "collections", collectionId, "looks", lookId, "items");
  
  const oldItemsSnapshot = await getDocs(itemsColRef);
  oldItemsSnapshot.docs.forEach((doc) => batch.delete(doc.ref));

  items.forEach((item) => {
    const { id, ...data } = item;
    const itemRef = doc(db, "collections", collectionId, "looks", lookId, "items", id);
    batch.set(itemRef, data);
  });
  await batch.commit();
}