"use client";

import { useEffect, useState } from "react";
import {
  Users, UserPlus, ShieldCheck, UserX,
  Search, ChevronUp, ChevronDown, ChevronsUpDown,
  Loader2, Trash2, ToggleLeft, ToggleRight,
  ChevronLeft, ChevronRight, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserDetailModal } from "./UserDetailModal";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface UserRow {
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

interface Stats {
  total:         number;
  new_this_week: number;
  admins:        number;
  inactive:      number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const LIMIT = 20;

const ROLE_LABELS: Record<string, string> = {
  admin:    "Admin",
  internal: "Intern",
  customer: "Kunde",
};

const ROLE_COLORS: Record<string, string> = {
  admin:    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  internal: "bg-blue-100   text-blue-700   dark:bg-blue-900/40   dark:text-blue-300",
  customer: "bg-gray-100   text-gray-600   dark:bg-gray-800      dark:text-gray-300",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string | null, email: string) {
  if (name) return name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
  return email.slice(0, 2).toUpperCase();
}

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

function fmtRelative(d: string | null) {
  if (!d) return "—";
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Heute";
  if (days === 1) return "Gestern";
  if (days < 30)  return `vor ${days} Tagen`;
  if (days < 365) return `vor ${Math.floor(days / 30)} Mon.`;
  return `vor ${Math.floor(days / 365)} J.`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function AvatarCircle({ user }: { user: UserRow }) {
  return (
    <div className="w-8 h-8 rounded-full bg-forest/12 dark:bg-forest/20 flex items-center justify-center shrink-0">
      <span className="text-xs font-bold text-forest dark:text-mint">
        {getInitials(user.full_name, user.email)}
      </span>
    </div>
  );
}

function SortIcon({ col, sortBy, sortDir }: { col: string; sortBy: string; sortDir: string }) {
  if (sortBy !== col) return <ChevronsUpDown className="w-3 h-3 text-gray-300 dark:text-gray-600" strokeWidth={1.5} />;
  return sortDir === "asc"
    ? <ChevronUp   className="w-3 h-3 text-forest" strokeWidth={2} />
    : <ChevronDown className="w-3 h-3 text-forest" strokeWidth={2} />;
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: number; color: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3", color + "/15")}>
        <Icon className={cn("w-4 h-4", color)} strokeWidth={1.5} />
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function UserManagement() {
  // Data
  const [users,   setUsers]   = useState<UserRow[]>([]);
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  // Filters
  const [searchInput,   setSearchInput]   = useState("");
  const [search,        setSearch]        = useState("");
  const [roleFilter,    setRoleFilter]    = useState("");
  const [periodFilter,  setPeriodFilter]  = useState("");

  // Sort
  const [sortBy,  setSortBy]  = useState("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Pagination
  const [page, setPage] = useState(1);

  // Selection
  const [selected,    setSelected]    = useState<Set<string>>(new Set());
  const [bulkAction,  setBulkAction]  = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);

  // Modals
  const [detailUser,   setDetailUser]   = useState<UserRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const [deleting,     setDeleting]     = useState(false);

  // Per-row update loading
  const [updating, setUpdating] = useState<Set<string>>(new Set());

  // Fetch counter to force re-fetch after bulk/delete
  const [tick, setTick] = useState(0);

  // ── Debounce search ──────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ── Fetch users ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams({
      search, role: roleFilter, period: periodFilter,
      sortBy, sortDir, page: String(page), limit: String(LIMIT),
    });
    setLoading(true);
    setError("");
    fetch(`/api/admin/users?${params}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      .then(d => { setUsers(d.users); setTotal(d.total); setStats(d.stats); })
      .catch(e => setError(typeof e === "string" ? e : "Fehler beim Laden der Benutzer."))
      .finally(() => setLoading(false));
  }, [search, roleFilter, periodFilter, sortBy, sortDir, page, tick]);

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function toggleSort(col: string) {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("asc"); }
    setPage(1);
  }

  function toggleAll(checked: boolean) {
    setSelected(checked ? new Set(users.map(u => u.id)) : new Set());
  }

  function toggleOne(id: string, checked: boolean) {
    setSelected(s => { const n = new Set(s); if (checked) n.add(id); else n.delete(id); return n; });
  }

  async function updateUser(id: string, patch: Partial<UserRow>) {
    setUpdating(s => new Set(s).add(id));
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      setUsers(us => us.map(u => u.id === id ? { ...u, ...patch } : u));
      if (detailUser?.id === id) setDetailUser(d => d ? { ...d, ...patch } : d);
    }
    setUpdating(s => { const n = new Set(s); n.delete(id); return n; });
  }

  async function deleteUser(id: string) {
    setDeleting(true);
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) {
      setUsers(us => us.filter(u => u.id !== id));
      setTotal(t => t - 1);
      setDeleteTarget(null);
      if (detailUser?.id === id) setDetailUser(null);
    }
    setDeleting(false);
  }

  async function executeBulkAction() {
    if (!bulkAction || selected.size === 0) return;
    const [action, role] = bulkAction.split(":");
    setBulkLoading(true);
    await fetch("/api/admin/users/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(selected), action, ...(role ? { role } : {}) }),
    });
    setBulkLoading(false);
    setSelected(new Set());
    setBulkAction("");
    setTick(t => t + 1);
  }

  function clearFilters() {
    setSearchInput(""); setSearch(""); setRoleFilter(""); setPeriodFilter(""); setPage(1);
  }

  const hasFilters    = !!(search || roleFilter || periodFilter);
  const totalPages    = Math.ceil(total / LIMIT);
  const allSelected   = users.length > 0 && users.every(u => selected.has(u.id));
  const someSelected  = selected.size > 0;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl space-y-5">

      {/* Page heading */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Benutzer-Verwaltung</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{total} Benutzer gesamt</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={Users}      label="Gesamt"           value={stats.total}         color="text-forest"          />
          <StatCard icon={UserPlus}   label="Neue diese Woche" value={stats.new_this_week} color="text-blue-500"        />
          <StatCard icon={ShieldCheck}label="Admins"           value={stats.admins}        color="text-purple-500"      />
          <StatCard icon={UserX}      label="Deaktiviert"      value={stats.inactive}      color="text-red-500"         />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={1.5} />
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Name oder Email …"
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-forest/20"
          />
        </div>
        {/* Role */}
        <select
          value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
          className="h-9 pl-3 pr-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-forest/20"
        >
          <option value="">Alle Rollen</option>
          <option value="customer">Kunden</option>
          <option value="internal">Intern</option>
          <option value="admin">Admins</option>
        </select>
        {/* Period */}
        <select
          value={periodFilter}
          onChange={e => { setPeriodFilter(e.target.value); setPage(1); }}
          className="h-9 pl-3 pr-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-forest/20"
        >
          <option value="">Alle Zeiten</option>
          <option value="7d">Letzte 7 Tage</option>
          <option value="30d">Letzte 30 Tage</option>
        </select>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" strokeWidth={2} />
            Filter zurücksetzen
          </button>
        )}
      </div>

      {/* Bulk action bar */}
      {someSelected && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-forest/8 dark:bg-forest/15 border border-forest/20">
          <span className="text-sm font-medium text-forest dark:text-mint shrink-0">
            {selected.size} ausgewählt
          </span>
          <select
            value={bulkAction}
            onChange={e => setBulkAction(e.target.value)}
            className="flex-1 max-w-[240px] h-8 pl-2 pr-6 rounded-lg border border-forest/20 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none"
          >
            <option value="">Aktion wählen …</option>
            <option value="set_role:customer">→ Rolle: Kunde</option>
            <option value="set_role:internal">→ Rolle: Intern</option>
            <option value="set_role:admin">→ Rolle: Admin</option>
            <option value="deactivate">→ Deaktivieren</option>
            <option value="activate">→ Aktivieren</option>
          </select>
          <button
            onClick={executeBulkAction}
            disabled={!bulkAction || bulkLoading}
            className="flex items-center gap-1.5 h-8 px-4 rounded-lg bg-forest text-white text-sm font-medium disabled:opacity-50 transition-opacity"
          >
            {bulkLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />}
            Anwenden
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="h-8 px-3 rounded-lg text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            Aufheben
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Table card */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
                {/* Checkbox all */}
                <th className="w-10 pl-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={e => toggleAll(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-forest focus:ring-forest/20"
                  />
                </th>
                {/* Sortable headers */}
                {(["full_name", "role", "created_at", "last_sign_in_at", "project_count"] as const).map(col => {
                  const labels: Record<string, string> = {
                    full_name: "Benutzer", role: "Rolle",
                    created_at: "Registriert", last_sign_in_at: "Letzter Login", project_count: "Projekte",
                  };
                  return (
                    <th key={col} className="px-3 py-3 text-left">
                      <button
                        onClick={() => toggleSort(col)}
                        className="flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                      >
                        {labels[col]}
                        <SortIcon col={col} sortBy={sortBy} sortDir={sortDir} />
                      </button>
                    </th>
                  );
                })}
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="w-28 px-3 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <Loader2 className="w-6 h-6 text-forest/40 animate-spin mx-auto" strokeWidth={1.5} />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-sm text-gray-400 dark:text-gray-500">
                    Keine Benutzer gefunden.
                  </td>
                </tr>
              ) : users.map(user => {
                const isUpdating  = updating.has(user.id);
                const isSelected  = selected.has(user.id);
                return (
                  <tr
                    key={user.id}
                    className={cn(
                      "group transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30",
                      isSelected && "bg-forest/4 dark:bg-forest/10"
                    )}
                  >
                    {/* Checkbox */}
                    <td className="pl-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={e => toggleOne(user.id, e.target.checked)}
                        className="rounded border-gray-300 dark:border-gray-600 text-forest focus:ring-forest/20"
                        onClick={e => e.stopPropagation()}
                      />
                    </td>

                    {/* Name + email */}
                    <td className="px-3 py-3">
                      <button
                        onClick={() => setDetailUser(user)}
                        className="flex items-center gap-2.5 text-left hover:opacity-80 transition-opacity"
                      >
                        <AvatarCircle user={user} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[140px]">
                            {user.full_name ?? <span className="text-gray-400 italic">Kein Name</span>}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[140px]">{user.email}</p>
                        </div>
                      </button>
                    </td>

                    {/* Role */}
                    <td className="px-3 py-3">
                      <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", ROLE_COLORS[user.role] ?? ROLE_COLORS.customer)}>
                        {ROLE_LABELS[user.role] ?? user.role}
                      </span>
                    </td>

                    {/* Registered */}
                    <td className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {fmtDate(user.created_at)}
                    </td>

                    {/* Last login */}
                    <td className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {fmtRelative(user.last_sign_in_at)}
                    </td>

                    {/* Projects */}
                    <td className="px-3 py-3 text-xs text-gray-600 dark:text-gray-300 tabular-nums">
                      {user.project_count}
                    </td>

                    {/* Status */}
                    <td className="px-3 py-3">
                      <span className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-full",
                        user.is_active
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                      )}>
                        {user.is_active ? "Aktiv" : "Inaktiv"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Role select */}
                        <select
                          value={user.role}
                          onChange={e => updateUser(user.id, { role: e.target.value })}
                          disabled={isUpdating}
                          onClick={e => e.stopPropagation()}
                          className="h-7 pl-2 pr-5 rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs text-gray-700 dark:text-gray-200 focus:outline-none disabled:opacity-50"
                        >
                          <option value="customer">Kunde</option>
                          <option value="internal">Intern</option>
                          <option value="admin">Admin</option>
                        </select>
                        {/* Toggle active */}
                        <button
                          onClick={e => { e.stopPropagation(); updateUser(user.id, { is_active: !user.is_active }); }}
                          disabled={isUpdating}
                          title={user.is_active ? "Deaktivieren" : "Aktivieren"}
                          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                        >
                          {isUpdating
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" strokeWidth={2} />
                            : user.is_active
                              ? <ToggleRight className="w-4 h-4 text-green-500" strokeWidth={1.5} />
                              : <ToggleLeft  className="w-4 h-4 text-gray-400"  strokeWidth={1.5} />
                          }
                        </button>
                        {/* Delete */}
                        <button
                          onClick={e => { e.stopPropagation(); setDeleteTarget(user); }}
                          title="Löschen"
                          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 text-gray-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} von {total} Benutzern
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" strokeWidth={1.5} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = totalPages <= 5 ? i + 1 : Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={cn(
                      "w-8 h-8 text-xs rounded-lg transition-colors",
                      p === page
                        ? "bg-forest text-white"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User detail modal */}
      {detailUser && (
        <UserDetailModal
          user={detailUser}
          onClose={() => setDetailUser(null)}
          onUpdate={patch => setUsers(us => us.map(u => u.id === detailUser.id ? { ...u, ...patch } : u))}
          onDelete={() => { setUsers(us => us.filter(u => u.id !== detailUser.id)); setTotal(t => t - 1); setDetailUser(null); }}
        />
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">Account löschen?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              <strong className="text-gray-700 dark:text-gray-300">{deleteTarget.full_name ?? deleteTarget.email}</strong>
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 mb-5">
              Alle Projekte, Räume, Buchungen und Daten dieses Accounts werden dauerhaft gelöscht und können nicht wiederhergestellt werden.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => deleteUser(deleteTarget.id)}
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 h-9 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />}
                Endgültig löschen
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 h-9 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
