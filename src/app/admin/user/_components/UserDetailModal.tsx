"use client";

import { useEffect, useState } from "react";
import {
  X, Loader2, FolderOpen, CalendarDays, ShieldCheck,
  ToggleLeft, ToggleRight, Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

interface UserRow {
  id:              string;
  full_name:       string | null;
  email:           string;
  avatar_url:      string | null;
  role:            string;
  is_active:       boolean;
  created_at:      string;
  last_sign_in_at: string | null;
  project_count:   number;
}

interface Details {
  projects:       { id: string; name: string; status: string; created_at: string }[];
  bookings_count: number;
  email:          string;
  last_sign_in:   string | null;
  confirmed_at:   string | null;
}

interface Props {
  user:      UserRow;
  onClose:   () => void;
  onUpdate:  (patch: Partial<UserRow>) => void;
  onDelete:  () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string>  = { admin: "Admin", internal: "Intern", customer: "Kunde" };
const ROLE_COLORS: Record<string, string>  = {
  admin:    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  internal: "bg-blue-100   text-blue-700   dark:bg-blue-900/40   dark:text-blue-300",
  customer: "bg-gray-100   text-gray-600   dark:bg-gray-700      dark:text-gray-300",
};
const STATUS_COLORS: Record<string, string> = {
  entwurf:       "bg-gray-100  text-gray-500",
  aktiv:         "bg-green-100 text-green-700",
  abgeschlossen: "bg-blue-100  text-blue-700",
  archiviert:    "bg-amber-100 text-amber-700",
};

function fmt(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function getInitials(name: string | null, email: string) {
  if (name) return name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
  return email.slice(0, 2).toUpperCase();
}

// ── Component ─────────────────────────────────────────────────────────────────

export function UserDetailModal({ user, onClose, onUpdate, onDelete }: Props) {
  const [details, setDetails] = useState<Details | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [localUser, setLocalUser] = useState(user);

  useEffect(() => {
    setLocalUser(user);
  }, [user]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/users/${user.id}/details`)
      .then(r => r.ok ? r.json() : null)
      .then(d => setDetails(d))
      .finally(() => setLoading(false));
  }, [user.id]);

  async function patch(update: Partial<UserRow>) {
    setActionLoading(true);
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(update),
    });
    if (res.ok) {
      const updated = { ...localUser, ...update };
      setLocalUser(updated);
      onUpdate(update);
    }
    setActionLoading(false);
  }

  async function handleDelete() {
    setActionLoading(true);
    const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
    if (res.ok) { onDelete(); onClose(); }
    else setActionLoading(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg shadow-2xl max-h-[90dvh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-forest/15 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-forest">
                {getInitials(localUser.full_name, localUser.email)}
              </span>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-tight">
                {localUser.full_name ?? "—"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{localUser.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mt-0.5"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        <div className="p-5 space-y-5">

          {/* Meta badges */}
          <div className="flex flex-wrap gap-2">
            <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", ROLE_COLORS[localUser.role] ?? ROLE_COLORS.customer)}>
              {ROLE_LABELS[localUser.role] ?? localUser.role}
            </span>
            <span className={cn(
              "text-xs font-medium px-2.5 py-1 rounded-full",
              localUser.is_active
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            )}>
              {localUser.is_active ? "Aktiv" : "Deaktiviert"}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500 px-2 py-1">
              Registriert: {fmt(localUser.created_at)}
            </span>
          </div>

          {/* Projects */}
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5" strokeWidth={1.5} />
              Projekte ({loading ? "…" : details?.projects.length ?? 0})
            </p>
            {loading ? (
              <div className="flex items-center gap-2 text-xs text-gray-400 py-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.5} />
                Wird geladen …
              </div>
            ) : !details?.projects.length ? (
              <p className="text-xs text-gray-400 dark:text-gray-500 italic">Keine Projekte</p>
            ) : (
              <div className="space-y-1.5">
                {details.projects.map(p => (
                  <div key={p.id} className="flex items-center justify-between gap-2 py-1.5 px-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{p.name}</span>
                    <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded", STATUS_COLORS[p.status] ?? "bg-gray-100 text-gray-500 dark:bg-gray-700")}>
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Coaching bookings */}
          {!loading && details && (
            <div className="flex items-center gap-2">
              <CalendarDays className="w-3.5 h-3.5 text-gray-400" strokeWidth={1.5} />
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-semibold">{details.bookings_count}</span>
                {" "}Coaching-Buchung{details.bookings_count !== 1 ? "en" : ""}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aktionen</p>

            {/* Role change */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
                <span className="text-sm text-gray-700 dark:text-gray-300">Rolle ändern</span>
              </div>
              <select
                value={localUser.role}
                onChange={e => patch({ role: e.target.value })}
                disabled={actionLoading}
                className="h-8 pl-3 pr-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-forest/20 disabled:opacity-50"
              >
                <option value="customer">Kunde</option>
                <option value="internal">Intern</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Toggle active */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {localUser.is_active
                  ? <ToggleRight className="w-4 h-4 text-green-500" strokeWidth={1.5} />
                  : <ToggleLeft  className="w-4 h-4 text-gray-400"  strokeWidth={1.5} />
                }
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Account {localUser.is_active ? "deaktivieren" : "aktivieren"}
                </span>
              </div>
              <button
                onClick={() => patch({ is_active: !localUser.is_active })}
                disabled={actionLoading}
                className={cn(
                  "text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50",
                  localUser.is_active
                    ? "border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                    : "border-green-200 text-green-600 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/20"
                )}
              >
                {localUser.is_active ? "Deaktivieren" : "Aktivieren"}
              </button>
            </div>

            {/* Delete */}
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                disabled={actionLoading}
                className="flex items-center gap-2 w-full text-sm text-red-500 hover:text-red-700 dark:text-red-400 px-2 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                Account löschen
              </button>
            ) : (
              <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
                <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">Wirklich löschen?</p>
                <p className="text-xs text-red-600 dark:text-red-400 mb-3">
                  Alle Projekte, Räume, Buchungen und Daten werden dauerhaft gelöscht. Dieser Vorgang kann nicht rückgängig gemacht werden.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={actionLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {actionLoading && <Loader2 className="w-3 h-3 animate-spin" strokeWidth={2} />}
                    Endgültig löschen
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
