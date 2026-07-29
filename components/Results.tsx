"use client";

import { useMemo, useState } from "react";
import { AISLE_ORDER, MOMENTS, STORES } from "@/lib/constants";
import {
  generate,
  readyMealSavings,
  recipeBreakdown,
  timeSaved,
} from "@/lib/generate";
import type {
  Aisle,
  GenerationResult,
  Preferences,
  Recipe,
  ShoppingItem,
} from "@/lib/types";
import { RecipeCard } from "./RecipeCard";
import { ShoppingList } from "./ShoppingList";
import { ShoppingMode } from "./ShoppingMode";
import { DriveConnect } from "./DriveConnect";
import { useFavorites } from "./FavoritesProvider";

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-white p-3 text-center shadow-[var(--shadow-soft)]">
      <div className="text-2xl font-extrabold text-sage tabular-nums">{value}</div>
      <div className="mt-0.5 text-xs font-semibold text-anthracite/55">{label}</div>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-anthracite/70 shadow-[var(--shadow-soft)]">
      {children}
    </span>
  );
}

function exportList(grouped: Record<Aisle, ShoppingItem[]>) {
  const lines = ["🍲 Ma liste de courses Popote", ""];
  for (const { aisle, emoji } of AISLE_ORDER) {
    const items = grouped[aisle];
    if (!items || items.length === 0) continue;
    lines.push(`${emoji} ${aisle}`);
    for (const it of items) lines.push(`- ${it.name} (${it.displayQty})`);
    lines.push("");
  }
  const text = lines.join("\n");
  navigator.clipboard?.writeText(text).catch(() => {});
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "liste-popote.txt";
  a.click();
  URL.revokeObjectURL(url);
}

export function Results({
  prefs,
  onEdit,
  onOpenFridge,
  onOpenFavorites,
  locked,
}: {
  prefs: Preferences;
  onEdit: () => void;
  onOpenFridge: () => void;
  onOpenFavorites: () => void;
  locked?: Recipe[];
}) {
  const { likedIds, saveBasket } = useFavorites();
  const effPrefs = locked ? { ...prefs, recipeCount: locked.length } : prefs;
  const [seed, setSeed] = useState(1);
  const [forced, setForced] = useState<Recipe[]>(locked ?? []);
  const [budgetMode, setBudgetMode] = useState(false);
  const [shopping, setShopping] = useState(false);
  const [drive, setDrive] = useState(false);
  const [exported, setExported] = useState(false);
  const [saved, setSaved] = useState(false);

  const result: GenerationResult = useMemo(
    () => generate(effPrefs, seed, forced, budgetMode, likedIds),
    [effPrefs, seed, forced, budgetMode, likedIds],
  );
  // coût de référence (menu normal) pour mesurer l'effet "bout de mois"
  const normalCost = useMemo(
    () => generate(effPrefs, seed, forced, false, likedIds).totalCost,
    [effPrefs, seed, forced, likedIds],
  );

  const store = STORES.find((s) => s.id === prefs.store);
  const minutes = timeSaved(result.recipes, prefs);
  const timeLabel = minutes >= 60 ? `${Math.round(minutes / 60)} h` : `${minutes} min`;
  const rm = readyMealSavings(result.recipes, prefs, result.totalCost);
  const budgetDrop =
    budgetMode && normalCost > 0
      ? Math.max(0, Math.round((1 - result.totalCost / normalCost) * 100))
      : 0;

  function regenerate() {
    setForced([]);
    setSeed((s) => s + 1);
  }
  function replace(id: string) {
    const kept = result.recipes.filter((r) => r.id !== id);
    setForced(kept);
    setSeed((s) => s + 1000);
  }
  function saveCurrent() {
    saveBasket({
      name: `Menu du ${new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}`,
      recipeIds: result.recipes.map((r) => r.id),
      people: prefs.people,
      storeId: prefs.store,
      budget: prefs.budget,
      totalCost: result.totalCost,
      itemCount: result.itemCount,
      shopping: result.shopping,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const momentLabels = prefs.moments
    .map((m) => MOMENTS.find((x) => x.id === m))
    .filter(Boolean)
    .slice(0, 3);

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-32 pt-6">
      <header className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl">Ton menu est prêt 🍲</h1>
          <p className="mt-1 text-sm text-anthracite/60">
            {store?.name} · budget {prefs.budget} €
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenFavorites}
          className="rounded-full bg-white px-3 py-2 text-sm font-bold text-sage shadow-[var(--shadow-soft)]"
        >
          ❤️ Favoris
        </button>
      </header>

      {/* Bloc de 4 stats */}
      <div className="grid grid-cols-4 gap-2">
        <Stat value={String(result.recipes.length)} label="recettes" />
        <Stat value={String(result.itemCount)} label="articles" />
        <Stat value={`${result.totalCost.toFixed(0)} €`} label="estimé" />
        <Stat value={timeLabel} label="gagné" />
      </div>

      {/* Pills de contexte */}
      <div className="mt-3 flex flex-wrap gap-2">
        <Pill>👥 {prefs.people} pers.</Pill>
        {prefs.bio && <Pill>🌱 Bio</Pill>}
        {prefs.local && <Pill>🇫🇷 Local & de saison</Pill>}
        {prefs.antiGaspi && <Pill>♻️ Anti-gaspi</Pill>}
        {momentLabels.map((m) => (
          <Pill key={m!.id}>
            {m!.emoji} {m!.label}
          </Pill>
        ))}
      </div>

      {/* Économie vs plats préparés */}
      {rm.savings > 0 && (
        <div className="mt-4 rounded-2xl bg-sage px-4 py-3 text-white">
          <p className="text-sm font-semibold">
            💚 En cuisinant ce menu plutôt que d'acheter des plats préparés, tu
            économises <span className="font-extrabold">~{rm.savings.toFixed(0)} €</span>.
          </p>
        </div>
      )}

      {/* Message budget */}
      <div
        className={[
          "mt-3 rounded-2xl px-4 py-3 text-sm font-semibold",
          result.overBudget
            ? "bg-[#fbe3da] text-terracotta-dark"
            : "bg-sage-light text-sage",
        ].join(" ")}
      >
        {result.message}
        {budgetMode && budgetDrop > 0 && (
          <span className="ml-1">Mode bout de mois : −{budgetDrop}% 💪</span>
        )}
      </div>

      {/* Actions rapides */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setShopping(true)}
          className="rounded-2xl bg-white py-3 text-sm font-bold text-sage shadow-[var(--shadow-soft)] transition active:scale-[0.98]"
        >
          🛒 Mode courses
        </button>
        <button
          type="button"
          onClick={() => setBudgetMode((b) => !b)}
          className={[
            "rounded-2xl py-3 text-sm font-bold shadow-[var(--shadow-soft)] transition active:scale-[0.98]",
            budgetMode ? "bg-honey text-white" : "bg-white text-sage",
          ].join(" ")}
        >
          💸 Bout de mois{budgetMode ? " ✓" : ""}
        </button>
        <button
          type="button"
          onClick={onOpenFridge}
          className="rounded-2xl bg-white py-3 text-sm font-bold text-sage shadow-[var(--shadow-soft)] transition active:scale-[0.98]"
        >
          🪄 Frigo magique
        </button>
        <button
          type="button"
          onClick={() => {
            exportList(result.shopping);
            setExported(true);
            setTimeout(() => setExported(false), 2000);
          }}
          className="rounded-2xl bg-white py-3 text-sm font-bold text-sage shadow-[var(--shadow-soft)] transition active:scale-[0.98]"
        >
          {exported ? "✅ Copiée !" : "⬇️ Exporter la liste"}
        </button>
        <button
          type="button"
          onClick={saveCurrent}
          disabled={result.recipes.length === 0}
          className="col-span-2 rounded-2xl bg-white py-3 text-sm font-bold text-sage shadow-[var(--shadow-soft)] transition active:scale-[0.98] disabled:opacity-40"
        >
          {saved ? "✅ Menu sauvegardé !" : "💾 Sauvegarder ce menu"}
        </button>
      </div>

      {/* Cartes recettes */}
      <h2 className="mb-3 mt-7 text-lg">Tes recettes</h2>
      {result.recipes.length === 0 ? (
        <p className="rounded-2xl bg-white p-5 text-sm text-anthracite/60 shadow-[var(--shadow-soft)]">
          Aucune recette trouvée. Reviens en arrière pour assouplir tes critères.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {result.recipes.map((r) => (
            <RecipeCard
              key={r.id}
              recipe={r}
              breakdown={recipeBreakdown(r, prefs)}
              people={prefs.people}
              bio={prefs.bio}
              onReplace={() => replace(r.id)}
            />
          ))}
        </div>
      )}

      {/* Liste de courses */}
      <h2 className="mb-3 mt-8 text-lg">Ta liste de courses</h2>
      <ShoppingList grouped={result.shopping} total={result.totalCost} />

      <button
        type="button"
        onClick={() => setDrive(true)}
        disabled={result.recipes.length === 0}
        className="mt-3 w-full rounded-full bg-sage py-3.5 font-extrabold text-white shadow-[var(--shadow-soft)] transition active:scale-[0.98] disabled:opacity-40"
      >
        🛒 Commander sur mon Drive
      </button>

      {/* Barre d'actions fixe */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-cream/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-xl gap-3">
          <button
            type="button"
            onClick={onEdit}
            className="flex-1 rounded-full border border-sage/30 bg-white py-3.5 font-bold text-sage transition active:scale-[0.98]"
          >
            Modifier
          </button>
          <button
            type="button"
            onClick={regenerate}
            className="flex-[1.4] rounded-full bg-terracotta py-3.5 font-bold text-white shadow-[var(--shadow-cta)] transition active:scale-[0.98] hover:bg-terracotta-dark"
          >
            🔄 Régénérer
          </button>
        </div>
      </div>

      {/* Overlay mode courses */}
      {shopping && (
        <ShoppingMode
          grouped={result.shopping}
          total={result.totalCost}
          onClose={() => setShopping(false)}
        />
      )}

      {/* Overlay connexion Drive */}
      {drive && (
        <DriveConnect grouped={result.shopping} onClose={() => setDrive(false)} />
      )}
    </div>
  );
}
