"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { getSupabase } from "@/lib/supabase";
import { db, isLocalMode } from "@/lib/db";
import { Item, ItemInput, SortDir, SortKey, itemPhotos } from "@/lib/types";
import ItemForm from "./ItemForm";
import ItemDetail from "./ItemDetail";
import BulkAdd from "./BulkAdd";

export default function InventoryApp({
  addedBy,
}: {
  addedBy: string | null;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [viewing, setViewing] = useState<Item | null>(null);
  const [showBulk, setShowBulk] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setItems(await db.fetchItems(sortKey, sortDir));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load items");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortKey, sortDir]);

  const categories = useMemo(
    () =>
      Array.from(
        new Set(items.map((i) => i.category).filter(Boolean) as string[])
      ).sort(),
    [items]
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      if (categoryFilter && i.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        i.name.toLowerCase().includes(q) ||
        (i.location ?? "").toLowerCase().includes(q) ||
        (i.notes ?? "").toLowerCase().includes(q) ||
        (i.category ?? "").toLowerCase().includes(q)
      );
    });
  }, [items, search, categoryFilter]);

  async function handleCreate(input: ItemInput, newPhotos: File[]) {
    await db.createItem(input, newPhotos, addedBy);
    await load();
  }

  async function handleUpdate(
    input: ItemInput,
    newPhotos: File[],
    keptUrls: string[]
  ) {
    if (!editing) return;
    await db.updateItem(editing.id, input, newPhotos, keptUrls);
    await load();
  }

  async function handleDelete(item: Item) {
    if (!confirm(`Delete "${item.name}"?`)) return;
    await db.deleteItem(item.id);
    setViewing(null);
    await load();
  }

  const totalQty = visible.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="mx-auto max-w-3xl pb-28">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 p-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">📦 Inventory</h1>
          {!isLocalMode && (
            <button
              onClick={() => getSupabase().auth.signOut()}
              className="text-xs text-zinc-400 hover:text-zinc-600"
            >
              Sign out
            </button>
          )}
        </div>

        {isLocalMode && (
          <p className="mt-2 rounded-md bg-amber-100 px-2 py-1 text-xs text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
            Demo mode — items are saved only on this device. Connect Supabase
            later to share with your team.
          </p>
        )}

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, location, notes…"
          className="mt-3 w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-base outline-none focus:border-zinc-900 dark:border-zinc-700 dark:focus:border-zinc-100"
        />

        <div className="mt-2 flex flex-wrap gap-2 text-sm">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-transparent px-2 py-1.5 dark:border-zinc-700"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="rounded-lg border border-zinc-300 bg-transparent px-2 py-1.5 dark:border-zinc-700"
          >
            <option value="created_at">Date added</option>
            <option value="name">Name</option>
            <option value="category">Category</option>
            <option value="quantity">Quantity</option>
          </select>

          <button
            onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
            className="rounded-lg border border-zinc-300 px-2 py-1.5 dark:border-zinc-700"
            title="Toggle sort direction"
          >
            {sortDir === "asc" ? "↑ Asc" : "↓ Desc"}
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="p-4">
        {loading ? (
          <p className="py-12 text-center text-sm text-zinc-400">Loading…</p>
        ) : error ? (
          <p className="py-12 text-center text-sm text-red-600">{error}</p>
        ) : visible.length === 0 ? (
          <div className="py-16 text-center text-sm text-zinc-400">
            {items.length === 0
              ? "No items yet. Tap + to add your first one."
              : "No items match your search."}
          </div>
        ) : (
          <>
            <p className="mb-3 text-xs text-zinc-400">
              {visible.length} item{visible.length !== 1 ? "s" : ""} ·{" "}
              {totalQty} total qty
            </p>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {visible.map((item) => {
                const photos = itemPhotos(item);
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setViewing(item)}
                      className="w-full overflow-hidden rounded-xl border border-zinc-200 text-left transition hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
                    >
                      <div className="relative aspect-square bg-zinc-100 dark:bg-zinc-800">
                        {photos[0] ? (
                          <Image
                            src={photos[0]}
                            alt={item.name}
                            fill
                            sizes="(max-width:640px) 50vw, 33vw"
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-3xl">
                            📦
                          </div>
                        )}
                        <span className="absolute right-1 top-1 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
                          ×{item.quantity}
                        </span>
                        {photos.length > 1 && (
                          <span className="absolute left-1 top-1 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
                            📷 {photos.length}
                          </span>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="truncate text-sm font-medium">{item.name}</p>
                        {item.category && (
                          <p className="truncate text-xs text-zinc-400">
                            {item.category}
                          </p>
                        )}
                        {item.location && (
                          <p className="truncate text-xs text-zinc-400">
                            📍 {item.location}
                          </p>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>

      {/* Floating action buttons */}
      <button
        onClick={() => setShowBulk(true)}
        className="fixed bottom-24 right-6 z-20 flex h-12 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-medium text-zinc-900 shadow-lg ring-1 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-700"
        aria-label="Bulk add photos"
      >
        🗂️ Bulk
      </button>
      <button
        onClick={() => {
          setEditing(null);
          setShowForm(true);
        }}
        className="fixed bottom-6 right-6 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 text-3xl text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-900"
        aria-label="Add item"
      >
        +
      </button>

      {viewing && !showForm && (
        <ItemDetail
          item={viewing}
          onEdit={() => {
            setEditing(viewing);
            setShowForm(true);
          }}
          onDelete={() => handleDelete(viewing)}
          onClose={() => setViewing(null)}
        />
      )}

      {showForm && (
        <ItemForm
          initial={editing}
          onSubmit={editing ? handleUpdate : handleCreate}
          onClose={() => {
            setShowForm(false);
            setViewing(null);
          }}
        />
      )}

      {showBulk && (
        <BulkAdd
          addedBy={addedBy}
          onDone={load}
          onClose={() => setShowBulk(false)}
        />
      )}
    </div>
  );
}
