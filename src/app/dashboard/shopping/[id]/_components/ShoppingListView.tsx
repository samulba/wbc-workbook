"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Pencil, Trash2, Share2, Download, ExternalLink,
  Check, Sparkles, PackagePlus, ChevronDown, FolderOpen, ShoppingBag,
} from "lucide-react";
import {
  renameShoppingList, updateShoppingBudget, deleteShoppingList,
  addProductToList, addCustomItem, toggleItemPurchased,
  updateItemPriority, updateItemQuantity, deleteItem,
  toggleListShare,
} from "@/app/actions/shopping";
import {
  type ShoppingItemResolved, type ShoppingPriority,
  PRIORITY_LABELS, PRIORITY_ORDER,
} from "@/lib/types/shopping";

// ── Types ────────────────────────────────────────────────────────────────────

interface List {
  id:            string;
  name:          string;
  budget_total:  number | null;
  is_shared:     boolean;
  share_token:   string | null;
  project:       { id: string; name: string } | null;
}

interface ProductRow {
  id:            string;
  name:          string;
  image_url:     string | null;
  affiliate_url: string;
  price:         number | null;
  partner:       string | null;
  category:      string | null;
}

type FilterKey = "all" | ShoppingPriority | "purchased";
type SortKey   = "priority" | "price" | "created";

// ── Main ─────────────────────────────────────────────────────────────────────

export function ShoppingListView({
  list,
  items,
  products,
}: {
  list:     List;
  items:    ShoppingItemResolved[];
  products: ProductRow[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // Local optimistic state
  const [currentItems, setItems] = useState(items);
  const [listName, setListName]  = useState(list.name);
  const [budget,   setBudget]    = useState(list.budget_total);
  const [shared,   setShared]    = useState({ is: list.is_shared, token: list.share_token });

  // Modal state
  const [showBudget, setShowBudget]     = useState(false);
  const [showRecos, setShowRecos]       = useState(false);
  const [showCustom, setShowCustom]     = useState(false);
  const [showShare, setShowShare]       = useState(false);

  // Filter / sort
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort,   setSort]   = useState<SortKey>("priority");

  // ── Derived totals ─────────────────────────────────────────────
  const totals = useMemo(() => {
    const byPriority: Record<ShoppingPriority, number> = { must_have: 0, nice_to_have: 0, maybe_later: 0 };
    let total = 0;
    let purchased = 0;
    for (const i of currentItems) {
      const line = (i.price ?? 0) * i.quantity;
      total += line;
      byPriority[i.priority] += line;
      if (i.is_purchased) purchased++;
    }
    return { total, purchased, byPriority };
  }, [currentItems]);

  const budgetPct = budget && budget > 0 ? (totals.total / budget) * 100 : 0;
  const budgetColor =
    budgetPct > 100 ? "text-terracotta" :
    budgetPct > 80  ? "text-amber-500" :
                      "text-mint";
  const budgetRingColor =
    budgetPct > 100 ? "#823509" :
    budgetPct > 80  ? "#f59e0b" :
                      "#94c1a4";

  // ── Filter + sort ──────────────────────────────────────────────
  const visibleItems = useMemo(() => {
    let arr = [...currentItems];
    if (filter === "purchased") {
      arr = arr.filter((i) => i.is_purchased);
    } else if (filter !== "all") {
      arr = arr.filter((i) => i.priority === filter);
    }

    if (sort === "priority") {
      arr.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
    } else if (sort === "price") {
      arr.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    } else {
      arr.sort((a, b) => a.created_at.localeCompare(b.created_at));
    }
    return arr;
  }, [currentItems, filter, sort]);

  // ── Handlers ───────────────────────────────────────────────────
  async function handleRename(name: string) {
    if (name.trim() === listName || !name.trim()) return;
    setListName(name);
    startTransition(async () => { await renameShoppingList(list.id, name); });
  }

  async function handleBudget(n: number | null) {
    setBudget(n);
    setShowBudget(false);
    startTransition(async () => { await updateShoppingBudget(list.id, n); });
  }

  async function handleDeleteList() {
    if (!confirm("Liste wirklich löschen?")) return;
    startTransition(async () => {
      const res = await deleteShoppingList(list.id);
      if (res.ok) router.push("/dashboard/shopping");
    });
  }

  async function handleTogglePurchased(itemId: string) {
    setItems((prev) => prev.map((i) => i.id === itemId ? { ...i, is_purchased: !i.is_purchased } : i));
    startTransition(async () => { await toggleItemPurchased(itemId, list.id); });
  }

  async function handlePriority(itemId: string, priority: ShoppingPriority) {
    setItems((prev) => prev.map((i) => i.id === itemId ? { ...i, priority } : i));
    startTransition(async () => { await updateItemPriority(itemId, list.id, priority); });
  }

  async function handleQty(itemId: string, qty: number) {
    const q = Math.max(1, Math.min(99, qty));
    setItems((prev) => prev.map((i) => i.id === itemId ? { ...i, quantity: q } : i));
    startTransition(async () => { await updateItemQuantity(itemId, list.id, q); });
  }

  async function handleDelete(itemId: string) {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    startTransition(async () => { await deleteItem(itemId, list.id); });
  }

  async function handleToggleShare() {
    startTransition(async () => {
      const res = await toggleListShare(list.id);
      if (res.ok) setShared({ is: res.token !== null, token: res.token });
    });
  }

  function shareUrl(): string {
    if (!shared.token) return "";
    return `${typeof window !== "undefined" ? window.location.origin : ""}/shared/shopping/${shared.token}`;
  }

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0 flex-1">
          <EditableTitle value={listName} onSave={handleRename} />
          {list.project && (
            <Link
              href={`/dashboard/projekte/${list.project.id}`}
              className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full bg-mint/20 text-forest dark:text-mint text-xs font-medium"
            >
              <FolderOpen className="w-3 h-3" strokeWidth={1.5} />
              {list.project.name}
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowShare(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <Share2 className="w-3.5 h-3.5" /> Teilen
          </button>
          <a
            href={`/api/export/shopping/${list.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <Download className="w-3.5 h-3.5" /> PDF
          </a>
          <button
            onClick={handleDeleteList}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-terracotta/30 text-sm text-terracotta hover:bg-terracotta/5"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Budget widget */}
      <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 flex items-center gap-6 flex-wrap">
        <ProgressRing percent={Math.min(100, budgetPct)} color={budgetRingColor} />
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Budget</p>
          {budget ? (
            <>
              <p className={`text-3xl font-bold font-mono tabular-nums ${budgetColor}`}>
                € {totals.total.toLocaleString("de-DE", { maximumFractionDigits: 0 })}
                <span className="text-gray-400 text-xl"> / € {budget.toLocaleString("de-DE", { maximumFractionDigits: 0 })}</span>
              </p>
              <p className="text-sm mt-1 text-gray-600 dark:text-gray-300">
                {budget - totals.total >= 0
                  ? <>Noch <strong>€ {(budget - totals.total).toLocaleString("de-DE", { maximumFractionDigits: 0 })}</strong> verfügbar</>
                  : <span className="text-terracotta">Budget um € {(totals.total - budget).toLocaleString("de-DE", { maximumFractionDigits: 0 })} überschritten</span>
                }
              </p>
            </>
          ) : (
            <p className="text-gray-500 italic">Noch kein Budget gesetzt</p>
          )}
        </div>
        <button
          onClick={() => setShowBudget(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-forest text-white text-sm font-medium hover:bg-forest/90"
        >
          <Pencil className="w-3.5 h-3.5" /> Budget anpassen
        </button>
      </section>

      {/* Add buttons */}
      <section className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setShowRecos(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-mint/20 text-forest dark:text-mint text-sm font-medium hover:bg-mint/30 border border-mint/30"
        >
          <Sparkles className="w-3.5 h-3.5" /> Aus Empfehlungen
        </button>
        <button
          onClick={() => setShowCustom(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <PackagePlus className="w-3.5 h-3.5" /> Eigenes Produkt
        </button>
      </section>

      {/* Filter + sort */}
      <section className="flex items-center gap-2 flex-wrap">
        <FilterChip active={filter === "all"}          onClick={() => setFilter("all")}>Alle ({currentItems.length})</FilterChip>
        <FilterChip active={filter === "must_have"}    onClick={() => setFilter("must_have")}>Must-have</FilterChip>
        <FilterChip active={filter === "nice_to_have"} onClick={() => setFilter("nice_to_have")}>Nice-to-have</FilterChip>
        <FilterChip active={filter === "maybe_later"}  onClick={() => setFilter("maybe_later")}>Maybe später</FilterChip>
        <FilterChip active={filter === "purchased"}    onClick={() => setFilter("purchased")}>Gekauft ({totals.purchased})</FilterChip>
        <div className="flex-1" />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 h-8 px-2"
        >
          <option value="priority">Nach Priorität</option>
          <option value="price">Nach Preis</option>
          <option value="created">Nach Datum</option>
        </select>
      </section>

      {/* Items list */}
      <section className="space-y-2">
        {visibleItems.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800/40 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-10 text-center text-gray-400 text-sm">
            Keine Einträge für diesen Filter.
          </div>
        ) : (
          visibleItems.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              onTogglePurchased={handleTogglePurchased}
              onPriority={handlePriority}
              onQty={handleQty}
              onDelete={handleDelete}
            />
          ))
        )}
      </section>

      {/* Summary */}
      <section className="bg-cream dark:bg-gray-800 border border-forest/10 dark:border-gray-700 rounded-2xl p-5">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-forest/60 dark:text-mint/60 mb-3">
          Zusammenfassung
        </h3>
        <dl className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
          <SummaryStat label="Artikel"        value={`${currentItems.length}`} />
          <SummaryStat label="Gekauft"        value={`${totals.purchased}`} />
          <SummaryStat label="Gesamt"         value={`€ ${totals.total.toLocaleString("de-DE", { maximumFractionDigits: 0 })}`} accent />
          <SummaryStat label="Must-haves"     value={`€ ${totals.byPriority.must_have.toLocaleString("de-DE", { maximumFractionDigits: 0 })}`} />
          <SummaryStat label="Nice-to-haves"  value={`€ ${totals.byPriority.nice_to_have.toLocaleString("de-DE", { maximumFractionDigits: 0 })}`} />
        </dl>
      </section>

      {/* ── Modals ─── */}
      {showBudget && (
        <BudgetModal
          current={budget}
          onClose={() => setShowBudget(false)}
          onSave={handleBudget}
        />
      )}
      {showRecos && (
        <RecosModal
          products={products}
          listId={list.id}
          onClose={() => setShowRecos(false)}
          onAdded={() => router.refresh()}
        />
      )}
      {showCustom && (
        <CustomModal
          listId={list.id}
          onClose={() => setShowCustom(false)}
          onAdded={() => router.refresh()}
        />
      )}
      {showShare && (
        <ShareModal
          shared={shared}
          url={shareUrl()}
          onToggle={handleToggleShare}
          onClose={() => setShowShare(false)}
          pending={pending}
        />
      )}

      {pending && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-full shadow-lg z-40">
          Speichere …
        </div>
      )}
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function EditableTitle({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(value);

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => { setDraft(value); setEditing(true); }}
        className="group inline-flex items-baseline gap-2 text-left"
      >
        <h1 className="font-headline text-3xl sm:text-4xl text-forest dark:text-mint leading-tight">
          {value}
        </h1>
        <Pencil className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    );
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSave(draft); setEditing(false); }}
      className="flex items-center gap-2"
    >
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => { onSave(draft); setEditing(false); }}
        className="font-headline text-3xl sm:text-4xl text-forest dark:text-mint bg-transparent border-b-2 border-forest/30 focus:outline-none focus:border-forest"
      />
    </form>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
        active
          ? "bg-forest text-white"
          : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-forest/30"
      }`}
    >
      {children}
    </button>
  );
}

function SummaryStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-0.5">{label}</p>
      <p className={`font-mono font-semibold tabular-nums ${accent ? "text-forest dark:text-mint text-lg" : "text-gray-800 dark:text-gray-200 text-base"}`}>
        {value}
      </p>
    </div>
  );
}

function ProgressRing({ percent, color }: { percent: number; color: string }) {
  const size = 120, stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="currentColor" strokeWidth={stroke} fill="none" className="text-gray-100 dark:text-gray-700" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - percent / 100)}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold tabular-nums" style={{ color }}>
          {Math.round(percent)}%
        </span>
      </div>
    </div>
  );
}

// ── Item Row ─────────────────────────────────────────────────────────────────

function ItemRow({
  item,
  onTogglePurchased,
  onPriority,
  onQty,
  onDelete,
}: {
  item: ShoppingItemResolved;
  onTogglePurchased: (id: string) => void;
  onPriority:        (id: string, p: ShoppingPriority) => void;
  onQty:             (id: string, q: number) => void;
  onDelete:          (id: string) => void;
}) {
  const [priOpen, setPriOpen] = useState(false);
  const line = (item.price ?? 0) * item.quantity;

  return (
    <div className={`group relative flex items-center gap-3 p-3 rounded-xl border transition-all ${
      item.is_purchased
        ? "bg-gray-50 dark:bg-gray-800/40 border-gray-100 dark:border-gray-800 opacity-70"
        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-forest/30"
    }`}>
      {/* Checkbox */}
      <button
        onClick={() => onTogglePurchased(item.id)}
        className={`w-6 h-6 shrink-0 rounded-md border-2 flex items-center justify-center transition-all ${
          item.is_purchased
            ? "bg-mint border-mint text-white"
            : "border-gray-300 dark:border-gray-600 hover:border-forest"
        }`}
        aria-label={item.is_purchased ? "Als nicht gekauft markieren" : "Als gekauft markieren"}
      >
        {item.is_purchased && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
      </button>

      {/* Image */}
      <div className="w-12 h-12 shrink-0 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden relative">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="48px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
          </div>
        )}
      </div>

      {/* Name + details */}
      <div className="flex-1 min-w-0">
        {item.url ? (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-sm font-medium hover:underline inline-flex items-center gap-1 ${
              item.is_purchased ? "line-through text-gray-400" : "text-gray-900 dark:text-gray-100"
            }`}
          >
            {item.name}
            <ExternalLink className="w-3 h-3 opacity-50" />
          </a>
        ) : (
          <p className={`text-sm font-medium ${item.is_purchased ? "line-through text-gray-400" : "text-gray-900 dark:text-gray-100"}`}>
            {item.name}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {/* Priority pill */}
          <div className="relative">
            <button
              onClick={() => setPriOpen((v) => !v)}
              className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${priorityStyle(item.priority)}`}
            >
              {PRIORITY_LABELS[item.priority]}
              <ChevronDown className="w-2.5 h-2.5" />
            </button>
            {priOpen && (
              <div className="absolute top-full mt-1 left-0 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg min-w-[140px]">
                {(["must_have", "nice_to_have", "maybe_later"] as ShoppingPriority[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => { onPriority(item.id, p); setPriOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {PRIORITY_LABELS[p]}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Quantity stepper */}
          <div className="inline-flex items-center gap-0.5 rounded bg-gray-100 dark:bg-gray-700 text-xs">
            <button
              onClick={() => onQty(item.id, item.quantity - 1)}
              className="w-6 h-6 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-l"
            >−</button>
            <span className="px-1 font-mono tabular-nums min-w-[20px] text-center">{item.quantity}</span>
            <button
              onClick={() => onQty(item.id, item.quantity + 1)}
              className="w-6 h-6 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-r"
            >+</button>
          </div>
        </div>
      </div>

      {/* Price */}
      <div className="text-right shrink-0">
        <p className="text-sm font-mono font-semibold tabular-nums text-gray-900 dark:text-gray-100">
          € {line.toLocaleString("de-DE", { maximumFractionDigits: 0 })}
        </p>
        {item.quantity > 1 && item.price && (
          <p className="text-[10px] text-gray-400">
            {item.quantity} × € {item.price.toLocaleString("de-DE", { maximumFractionDigits: 0 })}
          </p>
        )}
      </div>

      {/* Delete */}
      <button
        onClick={() => onDelete(item.id)}
        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-terracotta transition-all p-1"
        aria-label="Entfernen"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function priorityStyle(p: ShoppingPriority): string {
  switch (p) {
    case "must_have":    return "bg-terracotta/15 text-terracotta";
    case "nice_to_have": return "bg-mint/25 text-forest dark:text-mint";
    case "maybe_later":  return "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400";
  }
}

// ── Modals ───────────────────────────────────────────────────────────────────

function BudgetModal({ current, onClose, onSave }: { current: number | null; onClose: () => void; onSave: (n: number | null) => void }) {
  const [v, setV] = useState(current?.toString() ?? "");
  return (
    <ModalShell title="Budget anpassen" onClose={onClose}>
      <div className="space-y-3">
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Gesamtbudget in €</label>
        <input
          type="number" min={0} step={50} value={v} autoFocus
          onChange={(e) => setV(e.target.value)}
          className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-mint"
        />
        <div className="flex justify-between gap-2 pt-2">
          <button onClick={() => onSave(null)} className="text-xs text-gray-500 hover:text-terracotta">
            Budget entfernen
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="text-sm px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
              Abbrechen
            </button>
            <button
              onClick={() => onSave(v ? Number(v) : null)}
              className="text-sm px-4 py-2 rounded-lg bg-forest text-white font-medium hover:bg-forest/90"
            >
              Speichern
            </button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

function CustomModal({ listId, onClose, onAdded }: { listId: string; onClose: () => void; onAdded: () => void }) {
  const [name, setName]         = useState("");
  const [price, setPrice]       = useState("");
  const [url, setUrl]           = useState("");
  const [image, setImage]       = useState("");
  const [priority, setPriority] = useState<ShoppingPriority>("nice_to_have");
  const [pending, start]        = useTransition();
  const [error, setError]       = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await addCustomItem({
        listId,
        name,
        price: price ? Number(price) : null,
        url, image, priority,
      });
      if (!res.ok) { setError(res.error); return; }
      onAdded();
      onClose();
    });
  }

  return (
    <ModalShell title="Eigenes Produkt hinzufügen" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Name *">
          <input autoFocus required value={name} onChange={(e) => setName(e.target.value)} className="modal-input" placeholder="z. B. Vintage Sessel" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Preis in €">
            <input type="number" min={0} step={0.01} value={price} onChange={(e) => setPrice(e.target.value)} className="modal-input" placeholder="149" />
          </Field>
          <Field label="Priorität">
            <select value={priority} onChange={(e) => setPriority(e.target.value as ShoppingPriority)} className="modal-input">
              <option value="must_have">Must-have</option>
              <option value="nice_to_have">Nice-to-have</option>
              <option value="maybe_later">Maybe später</option>
            </select>
          </Field>
        </div>
        <Field label="URL (optional)">
          <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} className="modal-input" placeholder="https://…" />
        </Field>
        <Field label="Bild-URL (optional)">
          <input type="url" value={image} onChange={(e) => setImage(e.target.value)} className="modal-input" placeholder="https://…" />
        </Field>
        {error && <p className="text-xs text-terracotta">{error}</p>}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="text-sm px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">Abbrechen</button>
          <button type="submit" disabled={pending || !name.trim()} className="text-sm px-4 py-2 rounded-lg bg-forest text-white font-medium hover:bg-forest/90 disabled:opacity-50">
            {pending ? "Füge hinzu …" : "Hinzufügen"}
          </button>
        </div>
      </form>
      <style jsx>{`
        :global(.modal-input) {
          width: 100%; height: 2.5rem; padding: 0 0.75rem;
          border-radius: 0.5rem;
          border: 1px solid rgb(229 231 235);
          background: white; font-size: 0.875rem;
        }
        :global(.dark .modal-input) { background: rgb(31 41 55); border-color: rgb(55 65 81); color: rgb(229 231 235); }
        :global(.modal-input:focus) { outline: none; box-shadow: 0 0 0 2px rgb(148 193 164); }
      `}</style>
    </ModalShell>
  );
}

function RecosModal({
  products,
  listId,
  onClose,
  onAdded,
}: {
  products: ProductRow[];
  listId:   string;
  onClose:  () => void;
  onAdded:  () => void;
}) {
  const [query, setQuery]       = useState("");
  const [adding, setAdding]     = useState<string | null>(null);
  const [addedIds, setAdded]    = useState<Set<string>>(new Set());
  const [, start]               = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      (p.category ?? "").toLowerCase().includes(q) ||
      (p.partner  ?? "").toLowerCase().includes(q),
    );
  }, [products, query]);

  async function add(productId: string) {
    setAdding(productId);
    start(async () => {
      const res = await addProductToList({ listId, productId });
      if (res.ok) {
        setAdded((prev) => new Set(prev).add(productId));
        onAdded();
      }
      setAdding(null);
    });
  }

  return (
    <ModalShell title="Aus Empfehlungen hinzufügen" onClose={onClose} wide>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Suche nach Name, Kategorie oder Partner …"
        className="w-full h-10 px-3 mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-mint"
      />
      <div className="max-h-[60vh] overflow-y-auto -mx-1 px-1 space-y-2">
        {filtered.map((p) => {
          const added = addedIds.has(p.id);
          return (
            <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden shrink-0 relative">
                {p.image_url && (
                  <Image src={p.image_url} alt={p.name} fill sizes="48px" className="object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{p.name}</p>
                <p className="text-[11px] text-gray-500 truncate">
                  {p.partner ? `${p.partner} · ` : ""}{p.category ?? ""}{p.price ? ` · € ${p.price.toLocaleString("de-DE")}` : ""}
                </p>
              </div>
              <button
                onClick={() => add(p.id)}
                disabled={added || adding === p.id}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  added
                    ? "bg-mint/20 text-forest dark:text-mint"
                    : "bg-forest text-white hover:bg-forest/90"
                }`}
              >
                {added ? "✓ Hinzugefügt" : adding === p.id ? "…" : <>+ Liste</>}
              </button>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-xs text-center text-gray-400 py-8">Keine Treffer.</p>
        )}
      </div>
      <div className="flex justify-end pt-4">
        <button onClick={onClose} className="text-sm px-4 py-2 rounded-lg bg-forest text-white font-medium hover:bg-forest/90">
          Fertig
        </button>
      </div>
    </ModalShell>
  );
}

function ShareModal({
  shared, url, onToggle, onClose, pending,
}: {
  shared:   { is: boolean; token: string | null };
  url:      string;
  onToggle: () => void;
  onClose:  () => void;
  pending:  boolean;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <ModalShell title="Liste teilen" onClose={onClose}>
      <div className="space-y-4 text-sm">
        <p className="text-gray-600 dark:text-gray-300">
          Erstelle einen Read-only Link, den du mit Partnern oder Familie teilen kannst.
          Sie sehen deine Shopping-Liste ohne Bearbeitung.
        </p>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={shared.is}
            onChange={onToggle}
            disabled={pending}
            className="w-4 h-4 accent-forest"
          />
          <span className="text-gray-800 dark:text-gray-200">Öffentlich teilbar machen</span>
        </label>

        {shared.is && url && (
          <div className="flex gap-2">
            <input
              readOnly
              value={url}
              className="flex-1 h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-mono"
              onFocus={(e) => e.currentTarget.select()}
            />
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="text-xs px-3 py-2 rounded-lg bg-forest text-white font-medium hover:bg-forest/90"
            >
              {copied ? "✓ Kopiert" : "Kopieren"}
            </button>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button onClick={onClose} className="text-sm px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            Schließen
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function ModalShell({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full ${wide ? "max-w-2xl" : "max-w-md"}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm">✕</button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      {children}
    </div>
  );
}
