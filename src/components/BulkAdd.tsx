"use client";

import { useState } from "react";
import Image from "next/image";
import { db } from "@/lib/db";

interface Props {
  addedBy: string | null;
  onClose: () => void;
  onDone: () => void;
}

interface Row {
  file: File;
  preview: string;
  name: string;
}

export default function BulkAdd({ addedBy, onClose, onDone }: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  // Shared fields applied to every item created in this batch.
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  function addPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setRows((prev) => [
      ...prev,
      ...files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        name: "",
      })),
    ]);
    e.target.value = "";
  }

  function setName(index: number, name: string) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, name } : r)));
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (rows.length === 0) return;
    setSaving(true);
    setError(null);
    setProgress({ done: 0, total: rows.length });
    try {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        await db.createItem(
          {
            name: row.name.trim() || `Item ${i + 1}`,
            category,
            quantity,
            location,
            notes: "",
          },
          [row.file],
          addedBy
        );
        setProgress({ done: i + 1, total: rows.length });
      }
      onDone();
      onClose();
    } catch (err) {
      setError(
        (err instanceof Error ? err.message : "Something went wrong") +
          ` (saved ${progress.done} of ${rows.length})`
      );
      setSaving(false);
    }
  }

  const field =
    "w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base outline-none focus:border-zinc-900 dark:border-zinc-700 dark:focus:border-zinc-100";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="flex max-h-dvh w-full max-w-md flex-col rounded-t-2xl bg-white dark:bg-zinc-900 sm:rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-2">
          <h2 className="text-lg font-bold">Bulk add photos</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-2">
          {/* Shared fields */}
          <p className="mb-2 text-xs text-zinc-400">
            These apply to every item in this batch (you can edit any item later):
          </p>
          <div className="mb-3 flex flex-col gap-2">
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Category for all (optional)"
              className={field}
            />
            <div className="flex gap-2">
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
                placeholder="Location for all (optional)"
                className={field}
              />
            </div>
          </div>

          {/* Pick photos */}
          <label className="mb-3 flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800">
            📷 {rows.length === 0 ? "Select photos" : "Add more photos"}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={addPhotos}
              className="hidden"
            />
          </label>

          {/* One row per photo */}
          {rows.length > 0 && (
            <ul className="flex flex-col gap-2">
              {rows.map((row, i) => (
                <li key={row.preview} className="flex items-center gap-2">
                  <div className="relative h-14 w-14 flex-none overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                    <Image
                      src={row.preview}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <input
                    value={row.name}
                    onChange={(e) => setName(i, e.target.value)}
                    placeholder={`Name (optional) — defaults to "Item ${i + 1}"`}
                    className={`${field} py-2`}
                  />
                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    className="flex-none px-1 text-zinc-400 hover:text-red-600"
                    aria-label="Remove"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
          {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
          <button
            onClick={handleSave}
            disabled={saving || rows.length === 0}
            className="w-full rounded-lg bg-zinc-900 px-4 py-3 font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {saving
              ? `Saving ${progress.done}/${progress.total}…`
              : rows.length === 0
                ? "Select photos to begin"
                : `Add ${rows.length} item${rows.length !== 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}
