import { RECIPES } from "./recipes";
import { normalize } from "./nutrition";
import type { Recipe } from "./types";

// Ingrédients "toujours dispo" — on ne les compte pas comme manquants.
const STAPLES = new Set([
  "sel", "poivre", "eau", "huile", "huile d olive", "beurre", "farine",
  "sucre", "ail", "epices", "herbes", "vinaigre", "moutarde",
]);

export interface FridgeMatch {
  recipe: Recipe;
  have: string[]; // ingrédients de la recette couverts par le frigo
  missing: string[]; // ingrédients manquants (hors staples)
  coverage: number; // 0–1
}

/** Découpe la saisie libre en ingrédients normalisés. */
export function parsePantry(text: string): string[] {
  return text
    .split(/[,\n;]+|\bet\b/gi)
    .map((t) => normalize(t).replace(/\b\d+\s*(g|ml|kg|l|pieces?|pcs?)?\b/g, "").trim())
    .filter((t) => t.length > 1);
}

function matchesPantry(ingNorm: string, pantry: string[]): boolean {
  return pantry.some(
    (p) => ingNorm.includes(p) || p.includes(ingNorm) || sharedWord(ingNorm, p),
  );
}

function sharedWord(a: string, b: string): boolean {
  const wa = a.split(" ").filter((w) => w.length > 3);
  const wb = b.split(" ").filter((w) => w.length > 3);
  return wa.some((w) => wb.includes(w));
}

/** Trouve les recettes les plus réalisables avec les restes saisis. */
export function matchFridge(text: string, max = 3): FridgeMatch[] {
  const pantry = parsePantry(text);
  if (pantry.length === 0) return [];

  const scored: FridgeMatch[] = [];
  for (const recipe of RECIPES) {
    const have: string[] = [];
    const missing: string[] = [];
    for (const ing of recipe.ingredients) {
      const n = normalize(ing.name);
      if (matchesPantry(n, pantry)) have.push(ing.name);
      else if (!STAPLES.has(n)) missing.push(ing.name);
    }
    if (have.length === 0) continue;
    const coverage = have.length / recipe.ingredients.length;
    scored.push({ recipe, have, missing, coverage });
  }

  return scored
    .sort((a, b) => {
      // priorité : plus d'ingrédients utilisés, moins de manquants, plus rapide
      if (b.have.length !== a.have.length) return b.have.length - a.have.length;
      if (a.missing.length !== b.missing.length)
        return a.missing.length - b.missing.length;
      return a.recipe.timeMin - b.recipe.timeMin;
    })
    .slice(0, max);
}
