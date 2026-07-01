// One inventory item. Mirrors the `items` table in Supabase (see
// supabase-schema.sql at the project root).
export interface Item {
  id: string;
  created_at: string;
  name: string;
  category: string | null;
  quantity: number;
  location: string | null;
  notes: string | null;
  photo_url: string | null; // legacy single photo (kept as thumbnail fallback)
  photo_urls: string[]; // all photos for this item
  added_by: string | null;
}

// Fields the user fills in on the add/edit form.
export interface ItemInput {
  name: string;
  category: string;
  quantity: number;
  location: string;
  notes: string;
}

export type SortKey = "created_at" | "name" | "category" | "quantity";
export type SortDir = "asc" | "desc";

// Returns every photo for an item, tolerating older items that only have the
// single legacy `photo_url`.
export function itemPhotos(item: Item): string[] {
  if (item.photo_urls && item.photo_urls.length) return item.photo_urls;
  return item.photo_url ? [item.photo_url] : [];
}
