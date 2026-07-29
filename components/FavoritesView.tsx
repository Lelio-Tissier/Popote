"use client";

import { useMemo, useState } from "react";
import { DEFAULT_PREFERENCES, MOMENTS, STORES } from "@/lib/constants";
import { recipeBreakdown } from "@/lib/generate";
import { RECIPES } from "@/lib/recipes";
import type { SavedBasket } from "@/lib/favorites";
import type { Moment } from "@/lib/types";
import { useFavorites } from "./FavoritesProvider";
import { RecipeCard } from "./RecipeCard";
import { DriveConnect } from "./DriveConnect";

function fmtDate(ts: number): string {
  return new Date(ts).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

export function FavoritesView({
  onClose,
  onRecharge,
}: {
  onClose: () => void;
  onRecharge: (basket: SavedBasket) => void;
}) {
  const { likedIds, baskets, deleteBasket, toggleBasketFavorite } = useFavorites();
  const [tab, setTab] = useState<"recipes" | "baskets">("recipes");
  const [filter, setFilter] = useState<Moment | "all">("all");
  const [driveBasket, setDriveBasket] = useState<SavedBasket | null>(null);

  const likedRecipes = useMemo(
    () => RECIPES.filter((r) => likedIds.includes(r.id)),
    [likedIds],
  );
  const shown = useMemo(
    () =>
      filter === "all"
        ? likedRecipes
        : likedRecipes.filter((r) => r.moments.includes(filter)),
    [likedRecipes, filter],
  );

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-24 pt-6">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl">Mes favoris ❤️</h1>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-sage-light px-4 py-2 text-sm font-bold text-sage"
        >
          Retour
        </button>
      </header>

      {/* Onglets */}
      <div className="mb-4 flex gap-2 rounded-full bg-white p-1 shadow-[var(--shadow-soft)]">
        {[
          { id: "recipes", label: `Recettes (${likedRecipes.length})` },
          { id: "baskets", label: `Paniers (${baskets.length})` },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id as "recipes" | "baskets")}
            className={[
              "flex-1 rounded-full py-2.5 text-sm font-bold transition",
              tab === t.id ? "bg-sage text-white" : "text-anthracite/60",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Onglet recettes */}
      {tab === "recipes" &&
        (likedRecipes.length === 0 ? (
          <p className="rounded-2xl bg-white p-5 text-sm text-anthracite/60 shadow-[var(--shadow-soft)]">
            Aucune recette likée pour l'instant. Appuie sur le 🤍 d'une recette
            pour la retrouver ici (et la voir revenir plus souvent dans tes menus).
          </p>
        ) : (
          <>
            <div className="mb-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={[
                  "rounded-full px-3 py-1.5 text-xs font-bold",
                  filter === "all" ? "bg-sage text-white" : "bg-white text-anthracite/70 border border-line",
                ].join(" ")}
              >
                Tout
              </button>
              {MOMENTS.filter((m) => likedRecipes.some((r) => r.moments.includes(m.id))).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setFilter(m.id)}
                  className={[
                    "rounded-full px-3 py-1.5 text-xs font-bold",
                    filter === m.id ? "bg-sage text-white" : "bg-white text-anthracite/70 border border-line",
                  ].join(" ")}
                >
                  {m.emoji} {m.label}
                </button>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {shown.map((r) => (
                <RecipeCard
                  key={r.id}
                  recipe={r}
                  breakdown={recipeBreakdown(r, DEFAULT_PREFERENCES)}
                  people={DEFAULT_PREFERENCES.people}
                  bio={false}
                />
              ))}
            </div>
          </>
        ))}

      {/* Onglet paniers */}
      {tab === "baskets" &&
        (baskets.length === 0 ? (
          <p className="rounded-2xl bg-white p-5 text-sm text-anthracite/60 shadow-[var(--shadow-soft)]">
            Aucun panier sauvegardé. Sur l'écran d'un menu, appuie sur « 💾
            Sauvegarder ce menu » pour retrouver une semaine réussie ici.
          </p>
        ) : (
          <div className="space-y-3">
            {baskets.map((b) => {
              const store = STORES.find((s) => s.id === b.storeId);
              return (
                <div
                  key={b.id}
                  className="rounded-[var(--radius-card)] bg-white p-4 shadow-[var(--shadow-card)]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base leading-tight">{b.name}</h3>
                      <p className="mt-0.5 text-xs text-anthracite/55">
                        {fmtDate(b.date)} · {store?.name ?? b.storeId} · {b.people} pers.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleBasketFavorite(b.id)}
                      className="text-xl"
                      aria-label="Favori"
                      title="Favori"
                    >
                      {b.isFavorite ? "⭐" : "☆"}
                    </button>
                  </div>

                  <div className="mt-3 flex gap-2 text-center text-xs font-semibold text-anthracite/60">
                    <span className="flex-1 rounded-xl bg-cream py-1.5">
                      {b.recipeIds.length} recettes
                    </span>
                    <span className="flex-1 rounded-xl bg-cream py-1.5">
                      {b.itemCount} articles
                    </span>
                    <span className="flex-1 rounded-xl bg-cream py-1.5">
                      ~{b.totalCost.toFixed(0)} €
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onRecharge(b)}
                      className="flex-1 rounded-full border border-sage/30 bg-white py-2.5 text-sm font-bold text-sage"
                    >
                      🔄 Recharger
                    </button>
                    <button
                      type="button"
                      onClick={() => setDriveBasket(b)}
                      className="flex-[1.3] rounded-full bg-terracotta py-2.5 text-sm font-bold text-white"
                    >
                      🛒 Recommander au Drive
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteBasket(b.id)}
                      aria-label="Supprimer"
                      className="rounded-full bg-cream px-3 py-2.5 text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

      {driveBasket && (
        <DriveConnect grouped={driveBasket.shopping} onClose={() => setDriveBasket(null)} />
      )}
    </div>
  );
}
