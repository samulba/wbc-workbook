"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { createShoppingList } from "@/app/actions/shopping";

export function NewListButton({
  projects,
  primary = false,
}: {
  projects: { id: string; name: string }[];
  primary?: boolean;
}) {
  const [open, setOpen]         = useState(false);
  const [name, setName]         = useState("");
  const [projectId, setProjectId] = useState<string>("");
  const [budget, setBudget]     = useState<string>("");
  const [error, setError]       = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createShoppingList({
        name,
        projectId:   projectId || null,
        budgetTotal: budget ? Number(budget) : null,
      });
      if (!res.ok) { setError(res.error); return; }
      setOpen(false);
      setName(""); setBudget(""); setProjectId("");
      router.push(`/dashboard/shopping/${res.listId}`);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1.5 rounded-lg text-sm font-medium transition-colors ${
          primary
            ? "bg-forest text-white px-4 py-2.5 hover:bg-forest/90"
            : "bg-forest text-white px-3.5 py-2 hover:bg-forest/90"
        }`}
      >
        <Plus className="w-4 h-4" strokeWidth={2} />
        Neue Liste
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Neue Shopping-Liste</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={submit} className="px-5 py-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="z. B. Wohnzimmer Einrichtung"
                  required
                  autoFocus
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-mint"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Projekt (optional)</label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                >
                  <option value="">— kein Projekt —</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Budget in € (optional)</label>
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="z. B. 3000"
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-mint"
                />
              </div>

              {error && <p className="text-xs text-terracotta">{error}</p>}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="text-sm px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={pending || !name.trim()}
                  className="text-sm px-4 py-2 rounded-lg bg-forest text-white font-medium hover:bg-forest/90 disabled:opacity-50"
                >
                  {pending ? "Erstelle …" : "Erstellen"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
