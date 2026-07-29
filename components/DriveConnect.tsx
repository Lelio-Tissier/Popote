"use client";

import { useMemo, useState } from "react";
import {
  DRIVES,
  matchProducts,
  searchUrlFor,
  shoppingListText,
  type Drive,
  type DriveProduct,
} from "@/lib/drives";
import type { Aisle, ShoppingItem } from "@/lib/types";

interface Row extends DriveProduct {
  included: boolean;
}

export function DriveConnect({
  grouped,
  onClose,
}: {
  grouped: Record<Aisle, ShoppingItem[]>;
  onClose: () => void;
}) {
  const [store, setStore] = useState<Drive | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [done, setDone] = useState(false);

  const total = useMemo(
    () => rows.filter((r) => r.included).reduce((s, r) => s + r.estimatedPrice, 0),
    [rows],
  );

  function chooseStore(d: Drive) {
    setStore(d);
    setRows(matchProducts(grouped).map((p) => ({ ...p, included: true })));
  }

  function toggleIncluded(i: number) {
    setRows((rs) => rs.map((r, k) => (k === i ? { ...r, included: !r.included } : r)));
  }
  function toggleStatus(i: number) {
    setRows((rs) =>
      rs.map((r, k) =>
        k === i ? { ...r, status: r.status === "matched" ? "manual" : "matched" } : r,
      ),
    );
  }

  function transfer() {
    if (!store) return;
    const kept = rows.filter((r) => r.included);
    // On copie la liste (les Drive n'ont pas d'API panier → envoi assisté)
    const text =
      shoppingListText(grouped) +
      "\n(Astuce : colle cette liste dans la recherche du Drive)";
    navigator.clipboard?.writeText(text).catch(() => {});
    window.open(store.url, "_blank", "noopener,noreferrer");
    setDone(true);
    void kept;
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-cream">
      {/* En-tête */}
      <div className="flex items-center justify-between border-b border-line bg-white px-4 py-4">
        <div>
          <h2 className="text-lg">
            {store ? `Commander sur ${store.name}` : "Commander sur mon Drive 🛒"}
          </h2>
          <p className="text-xs text-anthracite/55">
            {store ? "Vérifie et transfère ta liste" : "Choisis ton enseigne"}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-sage-light px-4 py-2 text-sm font-bold text-sage"
        >
          Fermer
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-xl">
          {/* Étape 1 : choix enseigne */}
          {!store && (
            <>
              <div className="grid grid-cols-2 gap-3">
                {DRIVES.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => chooseStore(d)}
                    className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4 text-left shadow-[var(--shadow-soft)] transition active:scale-[0.98] hover:border-sage/40"
                  >
                    <span className="text-2xl" aria-hidden>
                      {d.emoji}
                    </span>
                    <span className="text-sm font-bold leading-tight">{d.name}</span>
                  </button>
                ))}
              </div>
              <p className="mt-4 rounded-2xl bg-sage-light/60 px-4 py-3 text-xs text-sage">
                ℹ️ Les enseignes n'ouvrent pas leur panier aux applis tierces. Bousti
                prépare ta liste et t'ouvre le Drive : tu la retrouves prête à
                rechercher. L'ajout 100 % automatique nécessitera un partenariat
                avec l'enseigne.
              </p>
            </>
          )}

          {/* Étape 2 : validation */}
          {store && !done && (
            <>
              <div className="overflow-hidden rounded-2xl border border-line bg-white">
                {rows.map((r, i) => (
                  <div
                    key={r.name}
                    className="flex items-center gap-3 border-b border-line px-3 py-2.5 last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      checked={r.included}
                      onChange={() => toggleIncluded(i)}
                      className="size-5 accent-[var(--color-sage)]"
                      aria-label={`Inclure ${r.name}`}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{r.name}</div>
                      <button
                        type="button"
                        onClick={() => toggleStatus(i)}
                        className={[
                          "mt-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold",
                          r.status === "matched"
                            ? "bg-sage-light text-sage"
                            : "bg-[#fbe3da] text-terracotta-dark",
                        ].join(" ")}
                      >
                        {r.status === "matched" ? "✓ trouvé" : "à valider"}
                      </button>
                    </div>
                    <span className="text-xs text-anthracite/50 tabular-nums">
                      {r.displayQty}
                    </span>
                    <span className="w-14 text-right text-sm font-bold tabular-nums">
                      {r.estimatedPrice.toFixed(2)} €
                    </span>
                    <a
                      href={searchUrlFor(store, r.query)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg"
                      title="Rechercher ce produit"
                    >
                      🔎
                    </a>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between rounded-2xl bg-sage px-4 py-3 text-white">
                <span className="font-bold">Total estimé</span>
                <span className="text-xl font-extrabold tabular-nums">
                  ~{total.toFixed(2)} €
                </span>
              </div>

              <button
                type="button"
                onClick={transfer}
                className="mt-4 w-full rounded-full bg-terracotta py-4 text-base font-extrabold text-white shadow-[var(--shadow-cta)] transition active:scale-[0.98] hover:bg-terracotta-dark"
              >
                Valider et transférer au Drive →
              </button>
              <button
                type="button"
                onClick={() => setStore(null)}
                className="mt-2 w-full rounded-full py-2 text-sm font-bold text-sage"
              >
                ← Changer d'enseigne
              </button>
            </>
          )}

          {/* Confirmation */}
          {store && done && (
            <div className="rounded-[var(--radius-card)] bg-white p-6 text-center shadow-[var(--shadow-soft)]">
              <div className="text-5xl">🚗</div>
              <h3 className="mt-3 text-lg">Liste envoyée vers {store.name}</h3>
              <p className="mt-2 text-sm text-anthracite/60">
                Ta liste est <b>copiée</b> et le Drive s'est ouvert dans un nouvel
                onglet. Colle-la dans la barre de recherche, ou utilise les loupes
                🔎 pour chercher chaque produit.
              </p>
              <button
                type="button"
                onClick={() => window.open(store.url, "_blank", "noopener,noreferrer")}
                className="mt-4 w-full rounded-full bg-sage py-3 font-bold text-white"
              >
                Rouvrir {store.name}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 w-full rounded-full py-2 text-sm font-bold text-sage"
              >
                Terminer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
