import { RECIPES } from "./recipes";
import { STORES, BIO_MULTIPLIER, AISLE_ORDER } from "./constants";
import { recipeNutritionPerPortion } from "./nutrition";
import {
  isVeg,
  type Aisle,
  type GenerationResult,
  type Ingredient,
  type Nutrition,
  type Preferences,
  type Recipe,
  type RecipeBreakdown,
  type ShoppingItem,
} from "./types";

// ---------- Coût ----------
function baseCostPerPerson(recipe: Recipe): number {
  return recipe.ingredients.reduce(
    (sum, ing) => sum + ing.qtyPerPerson * ing.unitPrice,
    0,
  );
}

function storeMultiplier(storeId: string): number {
  return STORES.find((s) => s.id === storeId)?.multiplier ?? 1;
}

export function recipeCost(recipe: Recipe, prefs: Preferences): number {
  const mult = storeMultiplier(prefs.store) * (prefs.bio ? BIO_MULTIPLIER : 1);
  return baseCostPerPerson(recipe) * prefs.people * mult;
}

// ---------- Filtrage ----------
function dietOk(recipe: Recipe, prefs: Preferences): boolean {
  switch (prefs.diet) {
    case "vegan":
      return recipe.isVegan;
    case "vegetarien":
      return isVeg(recipe);
    case "pescetarien":
      return !recipe.isMeat;
    case "sans-porc":
      return !recipe.hasPork;
    case "sans-gluten":
      return !recipe.allergens.includes("gluten");
    default:
      return true; // "tout" et "flexitarien" : géré à la sélection
  }
}

interface FilterOpts {
  ignoreEnvies?: boolean;
  ignoreTime?: boolean;
}

function eligible(recipe: Recipe, prefs: Preferences, opts: FilterOpts): boolean {
  // au moins un moment en commun
  if (!recipe.moments.some((m) => prefs.moments.includes(m))) return false;
  // régime
  if (!dietOk(recipe, prefs)) return false;
  // aucune allergie de l'utilisateur
  if (recipe.allergens.some((a) => prefs.allergies.includes(a))) return false;
  // niveau
  if (recipe.level > prefs.level) return false;
  // temps
  if (!opts.ignoreTime && recipe.timeMin > prefs.time) return false;
  // matériel : tout le requis doit être possédé
  if (!recipe.equipment.every((e) => prefs.equipment.includes(e))) return false;
  // envies : au moins un tag commun si des envies sont choisies
  if (!opts.ignoreEnvies && prefs.envies.length > 0) {
    if (!recipe.tags.some((t) => prefs.envies.includes(t))) return false;
  }
  return true;
}

/** Filtre avec relâchement progressif : envies, puis temps. */
export function eligibleRecipes(prefs: Preferences): Recipe[] {
  const target = prefs.recipeCount;
  let pool = RECIPES.filter((r) => eligible(r, prefs, {}));
  if (pool.length < target) {
    pool = RECIPES.filter((r) => eligible(r, prefs, { ignoreEnvies: true }));
  }
  if (pool.length < target) {
    pool = RECIPES.filter((r) =>
      eligible(r, prefs, { ignoreEnvies: true, ignoreTime: true }),
    );
  }
  return pool;
}

// ---------- Sélection ----------
function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Générateur pseudo-aléatoire déterministe (mulberry32)
function makeRng(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Sélection budget (gloutonne) :
 * - priorise local/saison si l'interrupteur local est actif ;
 * - garantit le nombre de recettes demandé ;
 * - reste sous le budget tant que possible ;
 * - flexitarien : limite la viande à ~40 % du menu.
 */
export function selectRecipes(
  prefs: Preferences,
  seed = 1,
  forcedInclude: Recipe[] = [],
  budgetMode = false,
  likedIds: string[] = [],
): Recipe[] {
  const rng = makeRng(seed);
  const liked = new Set(likedIds);
  const pool = eligibleRecipes(prefs).filter(
    (r) => !forcedInclude.some((f) => f.id === r.id),
  );

  let ranked = shuffle(pool, rng);
  if (budgetMode) {
    // "Bout de mois" : priorité aux recettes les moins chères,
    // aux légumineuses/œufs/végé, la viande en dernier.
    ranked = ranked.sort((a, b) => {
      const meat = (r: Recipe) => (r.isMeat ? 1 : 0);
      if (meat(a) !== meat(b)) return meat(a) - meat(b);
      return recipeCost(a, prefs) - recipeCost(b, prefs);
    });
  } else if (prefs.local) {
    ranked = ranked.sort((a, b) => {
      const score = (r: Recipe) => (r.isLocal ? 2 : 0) + (r.isSeasonal ? 1 : 0);
      return score(b) - score(a);
    });
  }

  // Boost des recettes likées : elles remontent en tête (probabilité accrue
  // d'être sélectionnées), sans jamais être imposées.
  if (liked.size > 0) {
    ranked = [...ranked].sort(
      (a, b) => (liked.has(b.id) ? 1 : 0) - (liked.has(a.id) ? 1 : 0),
    );
  }

  const maxMeat = budgetMode
    ? Math.max(0, Math.floor(prefs.recipeCount * 0.25))
    : prefs.diet === "flexitarien"
      ? Math.max(1, Math.round(prefs.recipeCount * 0.4))
      : Infinity;

  const selected: Recipe[] = [...forcedInclude];
  let meatCount = selected.filter((r) => r.isMeat).length;
  let total = selected.reduce((s, r) => s + recipeCost(r, prefs), 0);

  // 1er passage : respecter budget + contrainte viande
  for (const r of ranked) {
    if (selected.length >= prefs.recipeCount) break;
    if (r.isMeat && meatCount >= maxMeat) continue;
    const cost = recipeCost(r, prefs);
    if (total + cost <= prefs.budget) {
      selected.push(r);
      total += cost;
      if (r.isMeat) meatCount++;
    }
  }

  // 2e passage : compléter jusqu'au nombre demandé même si ça dépasse
  if (selected.length < prefs.recipeCount) {
    for (const r of ranked) {
      if (selected.length >= prefs.recipeCount) break;
      if (selected.some((s) => s.id === r.id)) continue;
      if (r.isMeat && meatCount >= maxMeat) continue;
      selected.push(r);
      if (r.isMeat) meatCount++;
    }
  }

  return selected;
}

/** Tire une recette compatible pour remplacer une recette du menu. */
export function pickReplacement(
  prefs: Preferences,
  current: Recipe[],
  toReplaceId: string,
  seed = Date.now(),
): Recipe | null {
  const rng = makeRng(seed);
  const usedIds = new Set(current.map((r) => r.id));
  const candidates = shuffle(
    eligibleRecipes(prefs).filter((r) => !usedIds.has(r.id)),
    rng,
  );
  return candidates[0] ?? null;
}

// ---------- Liste de courses ----------
export function formatQty(qty: number, unit: Ingredient["unit"]): string {
  if (unit === "g") {
    if (qty >= 1000) return `${(qty / 1000).toFixed(qty % 1000 === 0 ? 0 : 2)} kg`;
    return `${Math.round(qty)} g`;
  }
  if (unit === "ml") {
    if (qty >= 1000) return `${(qty / 1000).toFixed(qty % 1000 === 0 ? 0 : 2)} L`;
    return `${Math.round(qty)} ml`;
  }
  if (unit === "pièce") {
    const n = Math.ceil(qty);
    return `${n} ${n > 1 ? "pièces" : "pièce"}`;
  }
  // cuillères, pincées : arrondi à 0,5
  const rounded = Math.round(qty * 2) / 2;
  return `${rounded} ${unit}`;
}

export function buildShoppingList(
  recipes: Recipe[],
  prefs: Preferences,
): { grouped: Record<Aisle, ShoppingItem[]>; total: number; count: number } {
  const mult = storeMultiplier(prefs.store) * (prefs.bio ? BIO_MULTIPLIER : 1);
  // clé = nom + unité (anti-gaspi : on additionne les ingrédients identiques)
  const map = new Map<string, ShoppingItem>();

  for (const recipe of recipes) {
    for (const ing of recipe.ingredients) {
      const key = `${ing.name}__${ing.unit}`;
      const addQty = ing.qtyPerPerson * prefs.people;
      const addPrice = addQty * ing.unitPrice * mult;
      const existing = map.get(key);
      if (existing) {
        existing.qty += addQty;
        existing.price += addPrice;
      } else {
        map.set(key, {
          name: ing.name,
          aisle: ing.aisle,
          qty: addQty,
          unit: ing.unit,
          displayQty: "",
          price: addPrice,
        });
      }
    }
  }

  const grouped = {} as Record<Aisle, ShoppingItem[]>;
  for (const { aisle } of AISLE_ORDER) grouped[aisle] = [];

  let total = 0;
  let count = 0;
  for (const item of map.values()) {
    item.displayQty = formatQty(item.qty, item.unit);
    grouped[item.aisle].push(item);
    total += item.price;
    count++;
  }

  for (const { aisle } of AISLE_ORDER) {
    grouped[aisle].sort((a, b) => a.name.localeCompare(b.name, "fr"));
  }

  return { grouped, total, count };
}

// ---------- Détail par recette (prix produit + plat + nutrition) ----------
export function recipeBreakdown(
  recipe: Recipe,
  prefs: Preferences,
): RecipeBreakdown {
  const mult = storeMultiplier(prefs.store) * (prefs.bio ? BIO_MULTIPLIER : 1);
  const items = recipe.ingredients.map((ing) => {
    const totalQty = ing.qtyPerPerson * prefs.people;
    return {
      name: ing.name,
      displayQty: formatQty(totalQty, ing.unit),
      price: totalQty * ing.unitPrice * mult,
    };
  });
  const pricePerDish = items.reduce((s, it) => s + it.price, 0);
  const perPortion = recipeNutritionPerPortion(recipe);
  const perDish: Nutrition = {
    kcal: perPortion.kcal * prefs.people,
    protein: perPortion.protein * prefs.people,
    carbs: perPortion.carbs * prefs.people,
    fat: perPortion.fat * prefs.people,
  };
  return {
    items,
    pricePerDish,
    pricePerPortion: pricePerDish / prefs.people,
    nutritionPerPortion: perPortion,
    nutritionPerDish: perDish,
  };
}

// ---------- Estimation du temps gagné ----------
function timeSaved(recipes: Recipe[], prefs: Preferences): number {
  // Base : ~35 min de réflexion menu + courses par recette évitée, ajusté aux personnes.
  return Math.round(recipes.length * 30 + prefs.people * 8 + 25);
}

// ---------- Point d'entrée ----------
/** Économie estimée en cuisinant plutôt qu'en achetant des plats préparés. */
export function readyMealSavings(
  recipes: Recipe[],
  prefs: Preferences,
  totalCost: number,
): { readyMealCost: number; savings: number } {
  const PER_PORTION = 7; // prix moyen d'un plat préparé / portion
  const readyMealCost = PER_PORTION * prefs.people * recipes.length;
  return { readyMealCost, savings: Math.max(0, readyMealCost - totalCost) };
}

export function generate(
  prefs: Preferences,
  seed = 1,
  forcedInclude: Recipe[] = [],
  budgetMode = false,
  likedIds: string[] = [],
): GenerationResult {
  const recipes = selectRecipes(prefs, seed, forcedInclude, budgetMode, likedIds);
  const { grouped, total, count } = buildShoppingList(recipes, prefs);

  const recipeCosts: Record<string, number> = {};
  for (const r of recipes) recipeCosts[r.id] = recipeCost(r, prefs);

  const overBudget = total > prefs.budget + 0.5;
  const savings = Math.max(0, prefs.budget - total);

  let message: string;
  if (recipes.length === 0) {
    message =
      "Aucune recette ne correspond à ces critères. Assouplis le régime, le temps ou les envies.";
  } else if (overBudget) {
    message = `Ce menu dépasse ton budget de ${(total - prefs.budget).toFixed(0)} €. Réduis le nombre de recettes ou change de magasin.`;
  } else {
    message = `Tu restes sous ton budget : ${savings.toFixed(0)} € d'économie 🎉`;
  }

  return {
    recipes,
    shopping: grouped,
    totalCost: total,
    recipeCosts,
    itemCount: count,
    overBudget,
    savings,
    message,
  };
}

export { timeSaved };
