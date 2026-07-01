// Local demo backend. Stores items (and their photos as data URLs) in the
// browser's IndexedDB, so the whole app works with no cloud account. The
// function signatures match src/lib/items.ts so the app can swap between them.
import { Item, ItemInput, SortDir, SortKey } from "./types";

const DB_NAME = "inventory-tracker";
const STORE = "items";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx(db: IDBDatabase, mode: IDBTransactionMode): IDBObjectStore {
  return db.transaction(STORE, mode).objectStore(STORE);
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function filesToDataUrls(files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) urls.push(await fileToDataUrl(file));
  return urls;
}

export async function fetchItems(
  sortKey: SortKey,
  sortDir: SortDir
): Promise<Item[]> {
  const db = await openDb();
  const items: Item[] = await new Promise((resolve, reject) => {
    const req = tx(db, "readonly").getAll();
    req.onsuccess = () => resolve(req.result as Item[]);
    req.onerror = () => reject(req.error);
  });
  items.sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    let cmp: number;
    if (typeof av === "number" && typeof bv === "number") cmp = av - bv;
    else cmp = String(av ?? "").localeCompare(String(bv ?? ""));
    return sortDir === "asc" ? cmp : -cmp;
  });
  return items;
}

export async function createItem(
  input: ItemInput,
  newPhotos: File[],
  addedBy: string | null
): Promise<void> {
  const db = await openDb();
  const photo_urls = await filesToDataUrls(newPhotos);
  const item: Item = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    name: input.name,
    category: input.category || null,
    quantity: input.quantity,
    location: input.location || null,
    notes: input.notes || null,
    photo_urls,
    photo_url: photo_urls[0] ?? null,
    added_by: addedBy,
  };
  await new Promise<void>((resolve, reject) => {
    const req = tx(db, "readwrite").add(item);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function updateItem(
  id: string,
  input: ItemInput,
  newPhotos: File[],
  keptUrls: string[]
): Promise<void> {
  const db = await openDb();
  const existing: Item = await new Promise((resolve, reject) => {
    const req = tx(db, "readonly").get(id);
    req.onsuccess = () => resolve(req.result as Item);
    req.onerror = () => reject(req.error);
  });
  const uploaded = await filesToDataUrls(newPhotos);
  const photo_urls = [...keptUrls, ...uploaded];
  const updated: Item = {
    ...existing,
    name: input.name,
    category: input.category || null,
    quantity: input.quantity,
    location: input.location || null,
    notes: input.notes || null,
    photo_urls,
    photo_url: photo_urls[0] ?? null,
  };
  await new Promise<void>((resolve, reject) => {
    const req = tx(db, "readwrite").put(updated);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function deleteItem(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const req = tx(db, "readwrite").delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
