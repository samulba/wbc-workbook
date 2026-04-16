"use client";

import { useState, useEffect } from "react";
import {
  Plus, Trash2, FolderOpen, ChevronRight,
  ArrowLeft, Loader2, X, Check, Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Collection {
  id:          string;
  name:        string;
  description: string | null;
  cover_url:   string | null;
  item_count:  number;
  created_at:  string;
}

interface CollectionItem {
  id:             string;
  added_at:       string;
  inspiration_id: string | null;
  custom_url:     string | null;
  custom_title:   string | null;
  inspiration_images: {
    id:         string;
    image_url:  string;
    title:      string | null;
    room_effect: string | null;
    room_type:  string | null;
    colors:     string[];
  } | null;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function CollectionsTab() {
  const [collections,    setCollections]    = useState<Collection[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [activeId,       setActiveId]       = useState<string | null>(null);
  const [items,          setItems]          = useState<CollectionItem[]>([]);
  const [itemsLoading,   setItemsLoading]   = useState(false);

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [newName,    setNewName]    = useState("");
  const [newDesc,    setNewDesc]    = useState("");
  const [creating,   setCreating]   = useState(false);

  // Fetch collections
  useEffect(() => {
    fetch("/api/collections")
      .then(r => r.ok ? r.json() : [])
      .then((d: Collection[]) => { setCollections(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Open a collection
  async function openCollection(id: string) {
    setActiveId(id);
    setItemsLoading(true);
    const data = await fetch(`/api/collections/${id}/items`).then(r => r.ok ? r.json() : []).catch(() => []);
    setItems(data);
    setItemsLoading(false);
  }

  // Create collection
  async function createCollection(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    const res = await fetch("/api/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), description: newDesc.trim() || undefined }),
    });
    if (res.ok) {
      const created: Collection = await res.json();
      setCollections(p => [created, ...p]);
      setNewName("");
      setNewDesc("");
      setShowCreate(false);
    }
    setCreating(false);
  }

  // Delete collection
  async function deleteCollection(id: string) {
    if (!confirm("Sammlung wirklich löschen?")) return;
    const res = await fetch(`/api/collections/${id}`, { method: "DELETE" });
    if (res.ok) setCollections(p => p.filter(c => c.id !== id));
  }

  // Remove item from collection
  async function removeItem(collectionId: string, itemId: string) {
    const res = await fetch(`/api/collections/${collectionId}/items`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    });
    if (res.ok) {
      setItems(p => p.filter(i => i.id !== itemId));
      setCollections(p => p.map(c =>
        c.id === collectionId ? { ...c, item_count: Math.max(c.item_count - 1, 0) } : c
      ));
    }
  }

  // ── COLLECTION DETAIL VIEW ─────────────────────────────────────────────────

  if (activeId) {
    const coll = collections.find(c => c.id === activeId);
    return (
      <div>
        {/* Back + title */}
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => { setActiveId(null); setItems([]); }}
            className="flex items-center gap-1.5 text-sm font-sans text-gray-500 hover:text-gray-900 transition-colors min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            Alle Sammlungen
          </button>
          <span className="text-gray-300">/</span>
          <h2 className="font-headline text-lg text-gray-900 truncate">{coll?.name}</h2>
        </div>

        {itemsLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 text-forest/50 animate-spin" strokeWidth={1.5} />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <ImageIcon className="w-10 h-10 text-gray-200 mx-auto mb-3" strokeWidth={1} />
            <p className="text-gray-400 font-sans text-sm">Noch keine Bilder in dieser Sammlung.</p>
            <p className="text-gray-400 font-sans text-xs mt-1">
              Öffne ein Bild im Feed und klicke auf &ldquo;Sammlung&rdquo;.
            </p>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
            {items.map(item => {
              const img = item.inspiration_images;
              const src = img?.image_url ?? item.custom_url ?? "";
              const ttl = img?.title ?? item.custom_title ?? "Bild";
              return (
                <div key={item.id} className="break-inside-avoid mb-3 group relative">
                  <div className="relative rounded-xl overflow-hidden bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {src ? (
                      <img
                        src={src}
                        alt={ttl}
                        className="w-full block object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="aspect-[3/4] flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-300" strokeWidth={1} />
                      </div>
                    )}
                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeItem(activeId, item.id)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 hover:bg-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X className="w-3.5 h-3.5 text-white" strokeWidth={2} />
                    </button>
                  </div>
                  {ttl && (
                    <p className="text-[11px] font-sans text-gray-500 mt-1.5 px-0.5 line-clamp-1">{ttl}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── COLLECTIONS LIST ───────────────────────────────────────────────────────

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-headline text-xl text-gray-900 dark:text-gray-100">Meine Sammlungen</h2>
        <button
          type="button"
          onClick={() => setShowCreate(v => !v)}
          className="flex items-center gap-1.5 h-9 px-4 rounded-full border border-gray-200 bg-white text-sm font-sans font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2} />
          Neue Sammlung
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <form
          onSubmit={createCollection}
          className="mb-6 p-4 rounded-xl border border-forest/20 bg-forest/5"
        >
          <p className="text-sm font-sans font-medium text-gray-700 mb-3">Neue Sammlung erstellen</p>
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Name der Sammlung"
              required
              className="h-10 px-4 rounded-lg border border-gray-200 bg-white text-sm font-sans text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest/40"
            />
            <input
              type="text"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              placeholder="Beschreibung (optional)"
              className="h-10 px-4 rounded-lg border border-gray-200 bg-white text-sm font-sans text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest/40"
            />
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={creating || !newName.trim()}
                className="flex items-center gap-2 h-9 px-4 rounded-lg bg-forest text-white text-sm font-sans font-medium disabled:opacity-50 transition-opacity"
              >
                {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.5} /> : <Check className="w-3.5 h-3.5" strokeWidth={2} />}
                Erstellen
              </button>
              <button
                type="button"
                onClick={() => { setShowCreate(false); setNewName(""); setNewDesc(""); }}
                className="h-9 px-4 rounded-lg border border-gray-200 text-sm font-sans text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 text-forest/50 animate-spin" strokeWidth={1.5} />
        </div>
      )}

      {/* Empty state */}
      {!loading && collections.length === 0 && (
        <div className="text-center py-16">
          <FolderOpen className="w-12 h-12 text-gray-200 mx-auto mb-3" strokeWidth={1} />
          <p className="font-headline text-xl text-gray-300 mb-2">Keine Sammlungen</p>
          <p className="text-sm text-gray-400 font-sans max-w-xs mx-auto">
            Erstelle deine erste Sammlung und füge Bilder aus dem Feed hinzu.
          </p>
        </div>
      )}

      {/* Collections grid */}
      {collections.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map(c => (
            <div
              key={c.id}
              className={cn(
                "group relative rounded-xl border border-gray-200 bg-white overflow-hidden hover:border-forest/30 hover:shadow-sm transition-all cursor-pointer"
              )}
              onClick={() => openCollection(c.id)}
            >
              {/* Cover or placeholder */}
              <div className="aspect-[16/9] bg-gradient-to-br from-forest/8 to-mint/10 flex items-center justify-center overflow-hidden">
                {c.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.cover_url} alt={c.name} className="w-full h-full object-cover" />
                ) : (
                  <FolderOpen className="w-8 h-8 text-forest/25" strokeWidth={1} />
                )}
              </div>

              {/* Info */}
              <div className="p-3.5 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-sans font-semibold text-gray-900 truncate">{c.name}</p>
                  {c.description && (
                    <p className="text-xs text-gray-500 font-sans truncate mt-0.5">{c.description}</p>
                  )}
                  <p className="text-[11px] text-gray-400 font-sans mt-0.5">
                    {c.item_count === 1 ? "1 Bild" : `${c.item_count} Bilder`}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 mt-0.5 group-hover:text-forest transition-colors" strokeWidth={1.5} />
              </div>

              {/* Delete button (top-right on hover) */}
              <button
                type="button"
                onClick={e => { e.stopPropagation(); deleteCollection(c.id); }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 hover:bg-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-3 h-3 text-white" strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
