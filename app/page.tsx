"use client";

import { useState } from "react";
import { FavoritesView } from "@/components/FavoritesView";
import { FridgeMagic } from "@/components/FridgeMagic";
import { Onboarding } from "@/components/Onboarding";
import { QuickStart } from "@/components/QuickStart";
import { Results } from "@/components/Results";
import { DEFAULT_PREFERENCES } from "@/lib/constants";
import type { SavedBasket } from "@/lib/favorites";
import { RECIPES } from "@/lib/recipes";
import type { Preferences, Recipe } from "@/lib/types";

type View = "quickstart" | "onboarding" | "results" | "fridge" | "favorites";

export default function Home() {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [view, setView] = useState<View>("quickstart");
  const [locked, setLocked] = useState<Recipe[] | undefined>(undefined);

  const go = (v: View) => {
    setView(v);
    window.scrollTo({ top: 0 });
  };

  function rechargeBasket(b: SavedBasket) {
    const recipes = b.recipeIds
      .map((id) => RECIPES.find((r) => r.id === id))
      .filter((r): r is Recipe => !!r);
    setPrefs((p) => ({
      ...p,
      people: b.people,
      store: b.storeId,
      budget: b.budget,
    }));
    setLocked(recipes);
    go("results");
  }

  return (
    <main className="min-h-dvh">
      {view === "quickstart" && (
        <QuickStart
          initialPeople={prefs.people}
          initialBudget={prefs.budget}
          onGenerate={(people, budget) => {
            setPrefs((p) => ({ ...p, people, budget }));
            setLocked(undefined);
            go("results");
          }}
          onRefine={(people, budget) => {
            setPrefs((p) => ({ ...p, people, budget }));
            go("onboarding");
          }}
        />
      )}

      {view === "onboarding" && (
        <Onboarding
          initial={prefs}
          onSubmit={(p) => {
            setPrefs(p);
            setLocked(undefined);
            go("results");
          }}
        />
      )}

      {view === "results" && (
        <Results
          key={locked ? "locked" : "normal"}
          prefs={prefs}
          locked={locked}
          onEdit={() => {
            setLocked(undefined);
            go("onboarding");
          }}
          onOpenFridge={() => go("fridge")}
          onOpenFavorites={() => go("favorites")}
        />
      )}

      {view === "fridge" && <FridgeMagic onClose={() => go("results")} />}

      {view === "favorites" && (
        <FavoritesView onClose={() => go("results")} onRecharge={rechargeBasket} />
      )}
    </main>
  );
}
