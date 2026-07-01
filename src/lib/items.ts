import { getSupabase, PHOTO_BUCKET } from "./supabase";
import { Item, ItemInput, SortDir, SortKey } from "./types";

export async function fetchItems(
  sortKey: SortKey,
  sortDir: SortDir
): Promise<Item[]> {
  const { data, error } = await getSupabase()
    .from("items")
    .select("*")
    .order(sortKey, { ascending: sortDir === "asc" });
  if (error) throw error;
  return data as Item[];
}

// Uploads a photo to the storage bucket and returns its public URL.
async function uploadPhoto(file: File): Promise<string> {
  const supabase = getSupabase();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function createItem(
  input: ItemInput,
  photo: File | null,
  userEmail: string | null
): Promise<void> {
  const photo_url = photo ? await uploadPhoto(photo) : null;
  const { error } = await getSupabase().from("items").insert({
    name: input.name,
    category: input.category || null,
    quantity: input.quantity,
    location: input.location || null,
    notes: input.notes || null,
    photo_url,
    added_by: userEmail,
  });
  if (error) throw error;
}

export async function updateItem(
  id: string,
  input: ItemInput,
  photo: File | null
): Promise<void> {
  const patch: Record<string, unknown> = {
    name: input.name,
    category: input.category || null,
    quantity: input.quantity,
    location: input.location || null,
    notes: input.notes || null,
  };
  if (photo) patch.photo_url = await uploadPhoto(photo);
  const { error } = await getSupabase().from("items").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteItem(id: string): Promise<void> {
  const { error } = await getSupabase().from("items").delete().eq("id", id);
  if (error) throw error;
}
