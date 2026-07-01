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

async function uploadMany(files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) urls.push(await uploadPhoto(file));
  return urls;
}

export async function createItem(
  input: ItemInput,
  newPhotos: File[],
  userEmail: string | null
): Promise<void> {
  const photo_urls = await uploadMany(newPhotos);
  const { error } = await getSupabase().from("items").insert({
    name: input.name,
    category: input.category || null,
    quantity: input.quantity,
    location: input.location || null,
    notes: input.notes || null,
    photo_urls,
    photo_url: photo_urls[0] ?? null,
    added_by: userEmail,
  });
  if (error) throw error;
}

export async function updateItem(
  id: string,
  input: ItemInput,
  newPhotos: File[],
  keptUrls: string[]
): Promise<void> {
  const uploaded = await uploadMany(newPhotos);
  const photo_urls = [...keptUrls, ...uploaded];
  const { error } = await getSupabase()
    .from("items")
    .update({
      name: input.name,
      category: input.category || null,
      quantity: input.quantity,
      location: input.location || null,
      notes: input.notes || null,
      photo_urls,
      photo_url: photo_urls[0] ?? null,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteItem(id: string): Promise<void> {
  const { error } = await getSupabase().from("items").delete().eq("id", id);
  if (error) throw error;
}
