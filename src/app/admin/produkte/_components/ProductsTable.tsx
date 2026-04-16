"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Pencil, Trash2, Plus, Search, X,
  ChevronDown, ToggleLeft, ToggleRight,
} from "lucide-react";
import { deleteProduct, toggleProductActive } from "@/app/actions/products";
import type { Product } from "@/lib/types/product";

interface Props {
  products: Product[];
}

export function ProductsTable({ products }: Props) {
  const router    = useRouter();
  const [pending, startTransition] = useTransition();

  const [search,   setSearch]   = useState("");
  const [filterModule,   setFilterModule]   = useState<string>("all");
  const [filterPartner,  setFilterPartner]  = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [togglingId,    setTogglingId]    = useState<string | null>(null);

  // ── Derived filter options ────────────────────────────────────
  const allPartners    = useMemo(() => Array.from(new Set(products.map((p) => p.partner).filter(Boolean) as string[])).sort(), [products]);
  const allCategories  = useMemo(() => Array.from(new Set(products.map((p) => p.category).filter(Boolean) as string[])).sort(), [products]);

  // ── Filtered list ─────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q)) return false;
      if (filterModule !== "all" && String(p.module) !== filterModule) return false;
      if (filterPartner !== "all" && p.partner !== filterPartner) return false;
      if (filterCategory !== "all" && p.category !== filterCategory) return false;
      return true;
    });
  }, [products, search, filterModule, filterPartner, filterCategory]);

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteProduct(id);
      if (result.ok) {
        setConfirmDelete(null);
        router.refresh();
      }
    });
  }

  function handleToggle(id: string, current: boolean) {
    setTogglingId(id);
    startTransition(async () => {
      await toggleProductActive(id, !current);
      setTogglingId(null);
      router.refresh();
    });
  }

  const hasFilters = search || filterModule !== "all" || filterPartner !== "all" || filterCategory !== "all";

  function clearFilters() {
    setSearch("");
    setFilterModule("all");
    setFilterPartner("all");
    setFilterCategory("all");
  }

  return (
    <div className="space-y-4">

      {/* ── Toolbar ──────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Produktname suchen…"
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-forest/50 focus:ring-2 focus:ring-forest/10"
          />
        </div>

        {/* Module filter */}
        <div className="relative">
          <select
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-forest/50 cursor-pointer"
          >
            <option value="all">Alle Module</option>
            {[1,2,3,4].map((m) => (
              <option key={m} value={String(m)}>Modul {m}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" strokeWidth={1.5} />
        </div>

        {/* Partner filter */}
        {allPartners.length > 0 && (
          <div className="relative">
            <select
              value={filterPartner}
              onChange={(e) => setFilterPartner(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-forest/50 cursor-pointer"
            >
              <option value="all">Alle Partner</option>
              {allPartners.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" strokeWidth={1.5} />
          </div>
        )}

        {/* Category filter */}
        {allCategories.length > 0 && (
          <div className="relative">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-forest/50 cursor-pointer"
            >
              <option value="all">Alle Kategorien</option>
              {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" strokeWidth={1.5} />
          </div>
        )}

        {/* Clear filters */}
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            <X className="w-3.5 h-3.5" strokeWidth={1.5} />
            Zurücksetzen
          </button>
        )}

        {/* New product */}
        <Link
          href="/admin/produkte/neu"
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-forest text-white text-sm font-medium rounded-lg hover:bg-forest/90 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          Neues Produkt
        </Link>
      </div>

      {/* ── Result count ─────────────────────────────────────── */}
      <p className="text-xs text-slate-400">
        {filtered.length} von {products.length} Produkten
      </p>

      {/* ── Table ────────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-slate-400">Keine Produkte gefunden.</p>
          </div>
        ) : (
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-12">Bild</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Partner</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Kategorie</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Modul</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Aktiv</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((product, idx) => (
                <tr
                  key={product.id}
                  className={cn(
                    "group transition-colors hover:bg-slate-50",
                    idx % 2 === 1 ? "bg-slate-50/50" : "bg-white"
                  )}
                >
                  {/* Image */}
                  <td className="px-4 py-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                      {product.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] text-slate-300">–</span>
                      )}
                    </div>
                  </td>

                  {/* Name */}
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800 truncate max-w-[180px]">{product.name}</p>
                    {product.tags.length > 0 && (
                      <p className="text-xs text-slate-400 truncate max-w-[180px] mt-0.5">
                        {product.tags.slice(0, 3).join(", ")}
                      </p>
                    )}
                  </td>

                  {/* Partner */}
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-slate-600">{product.partner ?? "–"}</span>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-slate-600">{product.category ?? "–"}</span>
                  </td>

                  {/* Module badge */}
                  <td className="px-4 py-3 text-center hidden sm:table-cell">
                    {product.module ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-forest/10 text-forest text-xs font-semibold">
                        {product.module}
                      </span>
                    ) : (
                      <span className="text-slate-300">–</span>
                    )}
                  </td>

                  {/* Active toggle */}
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      disabled={togglingId === product.id || pending}
                      onClick={() => handleToggle(product.id, product.is_active)}
                      className="transition-opacity disabled:opacity-40"
                      title={product.is_active ? "Deaktivieren" : "Aktivieren"}
                    >
                      {product.is_active ? (
                        <ToggleRight className="w-6 h-6 text-emerald-500" strokeWidth={1.5} />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-slate-300" strokeWidth={1.5} />
                      )}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    {confirmDelete === product.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs text-slate-500">Löschen?</span>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => handleDelete(product.id)}
                          className="px-2.5 py-1 bg-red-500 text-white text-xs font-medium rounded-md hover:bg-red-600 disabled:opacity-50 transition-colors"
                        >
                          Ja
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(null)}
                          className="px-2.5 py-1 bg-slate-200 text-slate-600 text-xs font-medium rounded-md hover:bg-slate-300 transition-colors"
                        >
                          Nein
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/admin/produkte/${product.id}/edit`}
                          className="p-1.5 rounded-md text-slate-400 hover:text-forest hover:bg-forest/8 transition-colors"
                          title="Bearbeiten"
                        >
                          <Pencil className="w-4 h-4" strokeWidth={1.5} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(product.id)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Löschen"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
