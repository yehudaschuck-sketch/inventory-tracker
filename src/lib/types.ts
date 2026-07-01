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
  photo_url: string | null;
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
