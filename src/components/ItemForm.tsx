"use client";

import { useState } from "react";
import Image from "next/image";
import { Item, ItemInput } from "@/lib/types";

interface Props {
  initial?: Item | null;
  onSubmit: (input: ItemInput, photo: File | null) => Promise<void>;
  onClose: () => void;
}

export default function ItemForm({ initial, onSubmit, onClose }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [quantity, setQuantity] = useState(initial?.quantity ?? 1);
  const [location, setLocation] = useState(initial?.location ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(initial?.photo_url ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setPhoto(file);
    if (file) setPreview(URL.createObjectURL(file));
    // Phones name every camera shot "image.jpg", so the input's value doesn't
    // change between captures and onChange won't fire again. Clearing it lets
    // you take/replace a photo as many times as you like.
    e.target.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit(
        { name, category, quantity, location, notes },
        photo
      );
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSaving(false);
    }
  }

  const field =
    "w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base outline-none focus:border-zinc-900 dark:border-zinc-700 dark:focus:border-zinc-100";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="max-h-dvh w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 dark:bg-zinc-900 sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">
            {initial ? "Edit item" : "Add item"}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="relative flex aspect-video w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800">
            {preview ? (
              <>
                <Image
                  src={preview}
                  alt="Preview"
                  width={400}
                  height={225}
                  className="h-full w-full object-cover"
                  unoptimized
                />
                <span className="absolute bottom-1 right-1 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
                  📷 Tap to change
                </span>
              </>
            ) : (
              <span className="text-sm text-zinc-400">📷 Tap to take or upload a photo</span>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handlePhoto}
              className="hidden"
            />
          </label>

          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Item name *"
            className={field}
          />
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category (e.g. Equipment)"
            className={field}
          />
          <div className="flex gap-3">
            <input
              type="number"
              min={0}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              placeholder="Qty"
              className={`${field} w-24`}
            />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location (e.g. Storage A)"
              className={field}
            />
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes"
            rows={2}
            className={field}
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="mt-1 rounded-lg bg-zinc-900 px-4 py-3 font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {saving ? "Saving…" : initial ? "Save changes" : "Add item"}
          </button>
        </form>
      </div>
    </div>
  );
}
