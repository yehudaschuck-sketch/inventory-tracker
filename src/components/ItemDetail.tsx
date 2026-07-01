"use client";

import Image from "next/image";
import { Item, itemPhotos } from "@/lib/types";

interface Props {
  item: Item;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function ItemDetail({ item, onEdit, onDelete, onClose }: Props) {
  const photos = itemPhotos(item);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="max-h-dvh w-full max-w-md overflow-y-auto rounded-t-2xl bg-white dark:bg-zinc-900 sm:rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-2">
          <h2 className="text-lg font-bold">{item.name}</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Photo gallery: swipe horizontally when there are several */}
        {photos.length > 0 ? (
          <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-2">
            {photos.map((url, i) => (
              <div
                key={url}
                className="relative aspect-square w-full flex-none snap-center overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800"
                style={{ maxWidth: photos.length > 1 ? "85%" : "100%" }}
              >
                <Image
                  src={url}
                  alt={`${item.name} photo ${i + 1}`}
                  fill
                  sizes="(max-width:640px) 85vw, 400px"
                  className="object-cover"
                  unoptimized
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="mx-4 flex aspect-square items-center justify-center rounded-xl bg-zinc-100 text-5xl dark:bg-zinc-800">
            📦
          </div>
        )}

        {photos.length > 1 && (
          <p className="px-4 text-center text-xs text-zinc-400">
            {photos.length} photos — swipe to see more
          </p>
        )}

        {/* Details */}
        <dl className="grid grid-cols-3 gap-x-3 gap-y-3 p-4 text-sm">
          <dt className="text-zinc-400">Quantity</dt>
          <dd className="col-span-2 font-medium">{item.quantity}</dd>

          {item.category && (
            <>
              <dt className="text-zinc-400">Category</dt>
              <dd className="col-span-2">{item.category}</dd>
            </>
          )}
          {item.location && (
            <>
              <dt className="text-zinc-400">Location</dt>
              <dd className="col-span-2">📍 {item.location}</dd>
            </>
          )}
          {item.notes && (
            <>
              <dt className="text-zinc-400">Notes</dt>
              <dd className="col-span-2 whitespace-pre-wrap">{item.notes}</dd>
            </>
          )}
          <dt className="text-zinc-400">Added</dt>
          <dd className="col-span-2 text-zinc-500">
            {new Date(item.created_at).toLocaleDateString()}
            {item.added_by ? ` · ${item.added_by}` : ""}
          </dd>
        </dl>

        {/* Actions */}
        <div className="flex gap-2 border-t border-zinc-200 p-4 dark:border-zinc-800">
          <button
            onClick={onEdit}
            className="flex-1 rounded-lg bg-zinc-900 px-4 py-2.5 font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="rounded-lg border border-red-300 px-4 py-2.5 font-medium text-red-600 dark:border-red-800"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
