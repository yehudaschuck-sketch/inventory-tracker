"use client";

import { useState } from "react";
import Image from "next/image";
import { Item, ItemInput, itemPhotos } from "@/lib/types";

interface Props {
  initial?: Item | null;
  onSubmit: (
    input: ItemInput,
    newPhotos: File[],
    keptUrls: string[]
  ) => Promise<void>;
  onClose: () => void;
}

export default function ItemForm({ initial, onSubmit, onClose }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [quantity, setQuantity] = useState(initial?.quantity ?? 1);
  const [location, setLocation] = useState(initial?.location ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  // Photos already saved on this item that we're keeping.
  const [keptUrls, setKeptUrls] = useState<string[]>(
    initial ? itemPhotos(initial) : []
  );
  // Newly picked files, each paired with a preview URL for display.
  const [newPhotos, setNewPhotos] = useState<
    { file: File; preview: string }[]
  >([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleAddPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setNewPhotos((prev) => [
      ...prev,
      ...files.map((file) => ({ file, preview: URL.createObjectURL(file) })),
    ]);
    // Reset so the same file/camera capture can be added again.
    e.target.value = "";
  }

  function removeKept(url: string) {
    setKeptUrls((prev) => prev.filter((u) => u !== url));
  }

  function removeNew(preview: string) {
    setNewPhotos((prev) => prev.filter((p) => p.preview !== preview));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit(
        { name, category, quantity, location, notes },
        newPhotos.map((p) => p.file),
        keptUrls
      );
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSaving(false);
    }
  }

  const field =
    "w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base outline-none focus:border-zinc-900 dark:border-zinc-700 dark:focus:border-zinc-100";

  const totalPhotos = keptUrls.length + newPhotos.length;

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
          {/* Photo thumbnails + add tile */}
          <div className="grid grid-cols-3 gap-2">
            {keptUrls.map((url) => (
              <div
                key={url}
                className="relative aspect-square overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700"
              >
                <Image
                  src={url}
                  alt="Item photo"
                  fill
                  sizes="120px"
                  className="object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => removeKept(url)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white"
                  aria-label="Remove photo"
                >
                  ✕
                </button>
              </div>
            ))}
            {newPhotos.map((p) => (
              <div
                key={p.preview}
                className="relative aspect-square overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700"
              >
                <Image
                  src={p.preview}
                  alt="New photo"
                  fill
                  sizes="120px"
                  className="object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => removeNew(p.preview)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white"
                  aria-label="Remove photo"
                >
                  ✕
                </button>
              </div>
            ))}
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 text-center text-xs text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800">
              <span className="text-2xl leading-none">＋</span>
              <span className="mt-1">
                {totalPhotos === 0 ? "Add photo" : "Add more"}
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleAddPhotos}
                className="hidden"
              />
            </label>
          </div>

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
