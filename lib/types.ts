// ============================================================
// Bousti — Types du domaine
// ============================================================

export type Moment =
  | "petit-dej"
  | "brunch"
  | "dejeuner"
  | "diner"
  | "gouter"
  | "apero"
  | "afterwork"
  | "dessert";

export type Diet =
  | "tout"
  | "vegetarien"
  | "vegan"
  | "flexitarien"
  | "pescetarien"
  | "sans-porc"
  | "sans-gluten";

export type Allergen =
  | "gluten"
  | "lactose"
  | "oeuf"
  | "arachide"
  | "fruits-a-coque"
  | "fruits-de-mer"
  | "poisson"
  | "soja"
  | "sesame"
  | "moutarde";

export type Equipment =
  | "poele"
  | "four"
  | "casserole"
  | "robot"
  | "air-fryer"
  | "barbecue";

export type Envie =
  | "francais"
  | "italien"
  | "asiatique"
  | "oriental"
  | "mexicain"
  | "indien"
  | "americain"
  | "street-food"
  | "reconfort"
  | "healthy"
  | "epice"
  | "gourmand";

/** Niveau : 1 Débutant · 2 Intermédiaire · 3 Chef */
export type Level = 1 | 2 | 3;

/** Temps dispo max, en minutes (Express 15 / Rapide 30 / Tranquille 999) */
export type TimeBudget = 15 | 30 | 999;

export type Aisle =
  | "Fruits & légumes"
  | "Boucherie & poissonnerie"
  | "Crémerie & œufs"
  | "Pâtes, riz & féculents"
  | "Épicerie salée"
  | "Épicerie sucrée"
  | "Boulangerie"
  | "Surgelés";

export interface Ingredient {
  name: string;
  qtyPerPerson: number;
  unit: "g" | "ml" | "pièce" | "c. à soupe" | "c. à café" | "pincée";
  aisle: Aisle;
  unitPrice: number; // € par unité de base (g, ml, pièce...)
}

export interface Recipe {
  id: string;
  name: string;
  cookName: string; // prénom du cuisinier signataire
  emoji: string;
  photoUrl?: string;
  moments: Moment[];
  level: Level;
  timeMin: number;
  equipment: Equipment[]; // matériel requis
  isMeat: boolean;
  isFish: boolean;
  hasPork: boolean;
  isVegan: boolean;
  allergens: Allergen[];
  tags: Envie[];
  isLocal: boolean;
  isSeasonal: boolean;
  steps: string[];
  ingredients: Ingredient[];
}

/** Végétarien = ni viande ni poisson, OU vegan */
export function isVeg(r: Recipe): boolean {
  return (!r.isMeat && !r.isFish) || r.isVegan;
}

export interface Store {
  id: string;
  name: string;
  /** Monogramme affiché dans la pastille de marque (ex. "C", "E.L"). */
  short: string;
  /** Couleur de marque (fond de la pastille). */
  color: string;
  multiplier: number;
}

export interface Preferences {
  moments: Moment[];
  people: number; // 1–10
  recipeCount: number; // 1–10
  store: string; // store id
  budget: number; // 15–150 €
  level: Level;
  time: TimeBudget;
  equipment: Equipment[];
  diet: Diet;
  allergies: Allergen[];
  envies: Envie[];
  bio: boolean;
  local: boolean;
  antiGaspi: boolean;
}

export interface ShoppingItem {
  name: string;
  aisle: Aisle;
  qty: number; // quantité totale (unité de base)
  unit: Ingredient["unit"];
  displayQty: string; // formaté (g→kg, ml→L, pièces arrondies)
  price: number; // coût total pour cet article
}

export interface Nutrition {
  kcal: number;
  protein: number; // g
  carbs: number; // g
  fat: number; // g
}

export interface RecipeLineItem {
  name: string;
  displayQty: string; // quantité pour le nb de personnes
  price: number; // prix du produit (pour le nb de personnes, magasin & bio inclus)
}

export interface RecipeBreakdown {
  items: RecipeLineItem[];
  pricePerDish: number; // total du plat (pour toutes les personnes)
  pricePerPortion: number; // par personne
  nutritionPerPortion: Nutrition;
  nutritionPerDish: Nutrition;
}

export interface GenerationResult {
  recipes: Recipe[];
  shopping: Record<Aisle, ShoppingItem[]>;
  totalCost: number;
  recipeCosts: Record<string, number>; // id -> coût
  itemCount: number;
  overBudget: boolean;
  savings: number; // économie vs budget si sous le budget
  message: string;
}
