"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Save, ArrowLeft, ExternalLink } from "lucide-react";
import {
  PARTNERS, CATEGORIES, STYLES, MATERIALS,
  COLOR_FAMILIES, ROOM_TYPE_LABELS,
} from "@/lib/types/product";
import type { Product } from "@/lib/types/product";
import type { ProductActionResult } from "@/app/actions/products";

interface Props {
  product?: Product;
  action: (prev: ProductActionResult | null, formData: FormData) => Promise<ProductActionResult>;
  backHref?: string;
}

// ── Small UI helpers ──────────────────────────────────────────────────────────

function FieldLabel({ htmlFor, children, required }: { htmlFor: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

function TextInput({
  id, name, defaultValue, placeholder, required, type = "text",
}: {
  id: string; name: string; defaultValue?: string; placeholder?: string;
  required?: boolean; type?: string;
}) {
  return (
    <input
      id={id} name={name} type={type}
      defaultValue={defaultValue ?? ""}
      placeholder={placeholder}
      required={required}
      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-forest/50 focus:ring-2 focus:ring-forest/10 transition-shadow placeholder:text-slate-300"
    />
  );
}

function SelectInput({
  id, name, defaultValue, children, placeholder,
}: {
  id: string; name: string; defaultValue?: string;
  children: React.ReactNode; placeholder?: string;
}) {
  return (
    <select
      id={id} name={name} defaultValue={defaultValue ?? ""}
      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-forest/50 focus:ring-2 focus:ring-forest/10 cursor-pointer"
    >
      <option value="">{placeholder ?? "– auswählen –"}</option>
      {children}
    </select>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pt-2 pb-1 border-b border-slate-100">
      {children}
    </h3>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────

export function ProductForm({ product, action, backHref = "/admin/produkte" }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Active toggle (controlled)
  const [isActive, setIsActive] = useState(product?.is_active ?? true);

  // Room types multi-select
  const [selectedRooms, setSelectedRooms] = useState<string[]>(
    product?.room_types ?? []
  );

  function toggleRoom(rt: string) {
    setSelectedRooms((prev) =>
      prev.includes(rt) ? prev.filter((r) => r !== rt) : [...prev, rt]
    );
  }

  // Preview image
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? "");
  const isValidImageUrl = /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(imageUrl);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Inject controlled values
    formData.set("is_active", String(isActive));
    // Remove any pre-existing room_types entries then re-add controlled ones
    // (HTML checkboxes are handled below, but we override with state)
    // Actually, we're not using HTML checkboxes for room_types — we handle them via state
    // so we append them manually:
    selectedRooms.forEach((rt) => formData.append("room_types", rt));

    startTransition(async () => {
      const result = await action(null, formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/produkte");
        router.refresh();
      }, 600);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">

      {/* Back + status */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push(backHref)}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          Zurück zur Liste
        </button>

        {success && (
          <span className="text-sm text-emerald-600 font-medium">Gespeichert!</span>
        )}
        {error && (
          <span className="text-sm text-red-500">{error}</span>
        )}
      </div>

      {/* ── Card: Basisdaten ───────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        <div className="px-5 py-4">
          <SectionHeading>Basisdaten</SectionHeading>
        </div>

        <div className="px-5 py-5 space-y-4">
          {/* Name */}
          <div>
            <FieldLabel htmlFor="name" required>Name</FieldLabel>
            <TextInput
              id="name" name="name"
              defaultValue={product?.name}
              placeholder="z. B. Lounge-Sessel Malmö"
              required
            />
          </div>

          {/* Affiliate URL */}
          <div>
            <FieldLabel htmlFor="affiliate_url" required>Affiliate-Link</FieldLabel>
            <div className="flex gap-2">
              <TextInput
                id="affiliate_url" name="affiliate_url" type="url"
                defaultValue={product?.affiliate_url}
                placeholder="https://…"
                required
              />
              {product?.affiliate_url && (
                <a
                  href={product.affiliate_url}
                  target="_blank" rel="noopener noreferrer"
                  className="shrink-0 flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 text-slate-400 hover:text-forest hover:border-forest/30 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
                </a>
              )}
            </div>
          </div>

          {/* Image URL + preview */}
          <div>
            <FieldLabel htmlFor="image_url">Bild-URL</FieldLabel>
            <input
              id="image_url"
              name="image_url"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://…/bild.jpg"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-forest/50 focus:ring-2 focus:ring-forest/10 placeholder:text-slate-300"
            />
            {isValidImageUrl && (
              <div className="mt-2 rounded-lg border border-slate-200 overflow-hidden w-40 h-28 bg-slate-50 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Vorschau" className="max-w-full max-h-full object-contain" />
              </div>
            )}
          </div>

          {/* Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel htmlFor="price">Preis (€)</FieldLabel>
              <TextInput
                id="price" name="price" type="number"
                defaultValue={product?.price?.toString()}
                placeholder="0.00"
              />
            </div>
            <div>
              <FieldLabel htmlFor="priority">Priorität</FieldLabel>
              <TextInput
                id="priority" name="priority" type="number"
                defaultValue={product?.priority?.toString() ?? "0"}
                placeholder="0"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <FieldLabel htmlFor="description">Beschreibung</FieldLabel>
            <textarea
              id="description" name="description"
              defaultValue={product?.description ?? ""}
              rows={3}
              placeholder="Kurze Produktbeschreibung…"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-forest/50 focus:ring-2 focus:ring-forest/10 resize-y placeholder:text-slate-300"
            />
          </div>

          {/* Why fits */}
          <div>
            <FieldLabel htmlFor="why_fits">Warum passt es?</FieldLabel>
            <textarea
              id="why_fits" name="why_fits"
              defaultValue={product?.why_fits ?? ""}
              rows={2}
              placeholder="z. B. Ideal für ruhige Schlafzimmer dank gedämpfter Farben und natürlicher Materialien."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-forest/50 focus:ring-2 focus:ring-forest/10 resize-y placeholder:text-slate-300"
            />
          </div>
        </div>
      </div>

      {/* ── Card: Klassifizierung ─────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        <div className="px-5 py-4">
          <SectionHeading>Klassifizierung</SectionHeading>
        </div>

        <div className="px-5 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Partner */}
            <div>
              <FieldLabel htmlFor="partner">Partner</FieldLabel>
              <SelectInput id="partner" name="partner" defaultValue={product?.partner ?? ""}>
                {PARTNERS.map((p) => <option key={p} value={p}>{p}</option>)}
              </SelectInput>
            </div>

            {/* Module */}
            <div>
              <FieldLabel htmlFor="module">Modul</FieldLabel>
              <SelectInput id="module" name="module" defaultValue={product?.module?.toString() ?? ""} placeholder="– kein Modul –">
                {[1,2,3,4].map((m) => <option key={m} value={String(m)}>Modul {m}</option>)}
              </SelectInput>
            </div>

            {/* Category */}
            <div>
              <FieldLabel htmlFor="category">Kategorie</FieldLabel>
              <SelectInput id="category" name="category" defaultValue={product?.category ?? ""}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </SelectInput>
            </div>

            {/* Subcategory */}
            <div>
              <FieldLabel htmlFor="subcategory">Unterkategorie</FieldLabel>
              <TextInput
                id="subcategory" name="subcategory"
                defaultValue={product?.subcategory ?? ""}
                placeholder="z. B. 2-Sitzer"
              />
            </div>

            {/* Style */}
            <div>
              <FieldLabel htmlFor="style">Stilrichtung</FieldLabel>
              <SelectInput id="style" name="style" defaultValue={product?.style ?? ""}>
                {STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
              </SelectInput>
            </div>

            {/* Material */}
            <div>
              <FieldLabel htmlFor="material">Material</FieldLabel>
              <SelectInput id="material" name="material" defaultValue={product?.material ?? ""}>
                {MATERIALS.map((m) => <option key={m} value={m}>{m}</option>)}
              </SelectInput>
            </div>

            {/* Color family */}
            <div>
              <FieldLabel htmlFor="color_family">Farbfamilie</FieldLabel>
              <SelectInput id="color_family" name="color_family" defaultValue={product?.color_family ?? ""}>
                {COLOR_FAMILIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </SelectInput>
            </div>

            {/* Tags */}
            <div>
              <FieldLabel htmlFor="tags">Tags</FieldLabel>
              <TextInput
                id="tags" name="tags"
                defaultValue={(product?.tags ?? []).join(", ")}
                placeholder="modern, gemütlich, hell"
              />
              <p className="text-[11px] text-slate-400 mt-1">Kommasepariert</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Card: Raumtypen ───────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        <div className="px-5 py-4">
          <SectionHeading>Passende Raumtypen</SectionHeading>
        </div>
        <div className="px-5 py-5">
          <div className="flex flex-wrap gap-2">
            {Object.entries(ROOM_TYPE_LABELS).map(([key, label]) => {
              const active = selectedRooms.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleRoom(key)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm border transition-colors",
                    active
                      ? "bg-forest text-white border-forest"
                      : "bg-white text-slate-600 border-slate-200 hover:border-forest/40 hover:text-forest"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
          {selectedRooms.length > 0 && (
            <p className="text-xs text-slate-400 mt-3">
              Ausgewählt: {selectedRooms.map((r) => ROOM_TYPE_LABELS[r]).join(", ")}
            </p>
          )}
        </div>
      </div>

      {/* ── Card: Status ──────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 px-5 py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-700">Produkt aktiv</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Nur aktive Produkte werden Nutzern angezeigt
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsActive((v) => !v)}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full border-2 transition-colors",
              isActive
                ? "bg-forest border-forest"
                : "bg-slate-200 border-slate-200"
            )}
            role="switch"
            aria-checked={isActive}
          >
            <span
              className={cn(
                "inline-block h-4 w-4 rounded-full bg-white shadow transition-transform",
                isActive ? "translate-x-5" : "translate-x-0.5"
              )}
            />
          </button>
        </div>
      </div>

      {/* ── Submit ────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 pb-8">
        <button
          type="submit"
          disabled={pending || success}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all",
            pending || success
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-forest text-white hover:bg-forest/90"
          )}
        >
          {pending ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin shrink-0" />
              Speichern…
            </>
          ) : (
            <>
              <Save className="w-4 h-4" strokeWidth={1.5} />
              {product ? "Änderungen speichern" : "Produkt erstellen"}
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => router.push(backHref)}
          className="px-4 py-2.5 rounded-lg text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          Abbrechen
        </button>

        {error && (
          <p className="text-sm text-red-500 ml-2">{error}</p>
        )}
      </div>
    </form>
  );
}
