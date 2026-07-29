import type { Ingredient, Nutrition, Recipe } from "./types";

// ============================================================
// Popote — Table nutritionnelle (valeurs indicatives).
// k=kcal, p=protéines, c=glucides, f=lipides — POUR 100 g / 100 ml.
// `piece` = poids moyen (g) d'une pièce quand l'unité est "pièce".
// Source : moyennes usuelles (type Ciqual/USDA), arrondies.
// ============================================================

interface NEntry {
  k: number;
  p: number;
  c: number;
  f: number;
  piece?: number;
}

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .replace(/\([^)]*\)/g, " ")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

const TABLE: Record<string, NEntry> = {
  // Fruits
  abricot: { k: 48, p: 1.4, c: 11, f: 0.4 },
  banane: { k: 89, p: 1.1, c: 23, f: 0.3, piece: 120 },
  cerise: { k: 63, p: 1, c: 16, f: 0.2 },
  citron: { k: 29, p: 1.1, c: 9, f: 0.3, piece: 60 },
  figue: { k: 74, p: 0.8, c: 19, f: 0.3 },
  fraise: { k: 32, p: 0.7, c: 8, f: 0.3 },
  framboise: { k: 52, p: 1.2, c: 12, f: 0.7 },
  kiwi: { k: 61, p: 1.1, c: 15, f: 0.5, piece: 75 },
  mangue: { k: 60, p: 0.8, c: 15, f: 0.4 },
  myrtille: { k: 57, p: 0.7, c: 14, f: 0.3 },
  orange: { k: 47, p: 0.9, c: 12, f: 0.1, piece: 130 },
  peche: { k: 39, p: 0.9, c: 10, f: 0.3 },
  poire: { k: 57, p: 0.4, c: 15, f: 0.1, piece: 170 },
  pomme: { k: 52, p: 0.3, c: 14, f: 0.2, piece: 150 },
  "fruits rouges surgeles": { k: 45, p: 1, c: 10, f: 0.3 },
  // Légumes
  aubergine: { k: 25, p: 1, c: 6, f: 0.2, piece: 250 },
  avocat: { k: 160, p: 2, c: 9, f: 15, piece: 150 },
  "betterave cuite": { k: 43, p: 1.6, c: 10, f: 0.2 },
  carotte: { k: 41, p: 0.9, c: 10, f: 0.2, piece: 80 },
  champignons: { k: 22, p: 3, c: 3, f: 0.3 },
  "coeurs d artichaut": { k: 47, p: 3, c: 11, f: 0.2 },
  concombre: { k: 15, p: 0.7, c: 3.6, f: 0.1, piece: 300 },
  courgette: { k: 17, p: 1.2, c: 3, f: 0.3, piece: 200 },
  echalote: { k: 72, p: 2.5, c: 17, f: 0.2, piece: 30 },
  epinards: { k: 23, p: 2.9, c: 3.6, f: 0.4 },
  mais: { k: 86, p: 3, c: 19, f: 1.2 },
  oignon: { k: 40, p: 1.1, c: 9, f: 0.1, piece: 100 },
  "petits pois": { k: 81, p: 5, c: 14, f: 0.4 },
  poireau: { k: 61, p: 1.5, c: 14, f: 0.3, piece: 150 },
  poivron: { k: 31, p: 1, c: 6, f: 0.3, piece: 150 },
  "pomme de terre": { k: 77, p: 2, c: 17, f: 0.1 },
  "patate douce": { k: 86, p: 1.6, c: 20, f: 0.1 },
  potiron: { k: 26, p: 1, c: 6, f: 0.1 },
  salade: { k: 15, p: 1.4, c: 3, f: 0.2, piece: 300 },
  tomate: { k: 18, p: 0.9, c: 3.9, f: 0.2, piece: 120 },
  "tomates concassees": { k: 32, p: 1.3, c: 6, f: 0.3 },
  "tomates sechees": { k: 260, p: 14, c: 44, f: 3 },
  "sauce tomate": { k: 50, p: 1.5, c: 8, f: 1.5 },
  olives: { k: 145, p: 1, c: 6, f: 15 },
  capres: { k: 23, p: 2.4, c: 5, f: 0.9 },
  // Herbes & épices
  basilic: { k: 30, p: 3, c: 5, f: 0.6 },
  "herbes de provence": { k: 300, p: 10, c: 64, f: 7 },
  "paprika fume": { k: 280, p: 14, c: 54, f: 13 },
  curcuma: { k: 350, p: 8, c: 65, f: 10 },
  "pate de curry": { k: 150, p: 3, c: 15, f: 8 },
  // Viandes & poissons
  poulet: { k: 165, p: 31, c: 0, f: 3.6 },
  "cuisse de poulet": { k: 165, p: 27, c: 0, f: 6, piece: 130 },
  dinde: { k: 135, p: 29, c: 0, f: 1.5 },
  boeuf: { k: 217, p: 26, c: 0, f: 12 },
  porc: { k: 240, p: 27, c: 0, f: 14 },
  chorizo: { k: 455, p: 24, c: 2, f: 38 },
  jambon: { k: 145, p: 20, c: 1, f: 6, piece: 40 },
  lardons: { k: 300, p: 15, c: 1, f: 26 },
  guanciale: { k: 300, p: 15, c: 1, f: 26 },
  saucisse: { k: 300, p: 14, c: 2, f: 26, piece: 80 },
  "cordon bleu": { k: 230, p: 15, c: 12, f: 13, piece: 100 },
  saumon: { k: 208, p: 20, c: 0, f: 13 },
  "saumon fume": { k: 180, p: 25, c: 0, f: 9 },
  cabillaud: { k: 82, p: 18, c: 0, f: 0.7 },
  crevettes: { k: 99, p: 24, c: 0, f: 0.3 },
  moules: { k: 86, p: 12, c: 4, f: 2 },
  thon: { k: 116, p: 26, c: 0, f: 1 },
  edamame: { k: 120, p: 11, c: 10, f: 5 },
  falafels: { k: 330, p: 13, c: 32, f: 18 },
  // Œufs & produits laitiers
  oeuf: { k: 143, p: 13, c: 1, f: 10, piece: 55 },
  "jaune d oeuf": { k: 320, p: 16, c: 3.6, f: 27, piece: 18 },
  lait: { k: 46, p: 3.2, c: 4.8, f: 1.6 },
  "boisson d avoine": { k: 45, p: 0.3, c: 7, f: 1.5 },
  "creme fraiche": { k: 290, p: 2, c: 3, f: 30 },
  beurre: { k: 745, p: 0.9, c: 0.7, f: 82 },
  "fromage rape": { k: 400, p: 25, c: 1, f: 33 },
  "comte rape": { k: 410, p: 27, c: 0, f: 34 },
  "parmesan rape": { k: 400, p: 33, c: 0, f: 29 },
  mozzarella: { k: 280, p: 18, c: 3, f: 22 },
  feta: { k: 265, p: 14, c: 4, f: 21 },
  "fromage de chevre": { k: 290, p: 19, c: 2, f: 23 },
  "fromage frais": { k: 230, p: 6, c: 4, f: 21 },
  mascarpone: { k: 430, p: 4, c: 4, f: 44 },
  "yaourt nature": { k: 60, p: 4, c: 6, f: 3 },
  "cheddar en tranche": { k: 400, p: 25, c: 1, f: 33, piece: 20 },
  // Féculents, pains, pâtes
  riz: { k: 350, p: 7, c: 78, f: 1 },
  pates: { k: 350, p: 12, c: 72, f: 1.5 },
  gnocchi: { k: 150, p: 3, c: 30, f: 2 },
  nouilles: { k: 350, p: 11, c: 72, f: 1.5 },
  "nouilles de riz": { k: 360, p: 3, c: 80, f: 0.5 },
  semoule: { k: 350, p: 12, c: 72, f: 1.5 },
  quinoa: { k: 368, p: 14, c: 64, f: 6 },
  farine: { k: 350, p: 10, c: 73, f: 1 },
  chapelure: { k: 380, p: 13, c: 72, f: 5 },
  "frites surgelees": { k: 150, p: 2, c: 23, f: 5 },
  "ravioles du dauphine": { k: 280, p: 12, c: 35, f: 10 },
  "flocons d avoine": { k: 370, p: 13, c: 60, f: 7 },
  muesli: { k: 360, p: 9, c: 66, f: 6 },
  granola: { k: 450, p: 9, c: 64, f: 17 },
  "graines de chia": { k: 486, p: 17, c: 42, f: 31 },
  biscuits: { k: 450, p: 7, c: 70, f: 15 },
  crackers: { k: 430, p: 9, c: 70, f: 13 },
  "chips tortilla": { k: 490, p: 7, c: 63, f: 23 },
  pain: { k: 265, p: 9, c: 49, f: 3 },
  "pain a burger": { k: 270, p: 9, c: 48, f: 4, piece: 60 },
  "pain de mie": { k: 270, p: 8, c: 49, f: 4, piece: 30 },
  "pain navette": { k: 270, p: 9, c: 48, f: 4, piece: 30 },
  "pain pita": { k: 275, p: 9, c: 55, f: 1.7, piece: 60 },
  baguette: { k: 265, p: 9, c: 49, f: 3, piece: 250 },
  blinis: { k: 270, p: 8, c: 49, f: 6, piece: 15 },
  "galette de ble": { k: 300, p: 8, c: 49, f: 7, piece: 50 },
  "pate a pizza": { k: 270, p: 8, c: 50, f: 4, piece: 260 },
  "pate brisee": { k: 400, p: 6, c: 44, f: 22, piece: 230 },
  "pate feuilletee": { k: 380, p: 5, c: 38, f: 23, piece: 230 },
  // Légumineuses
  "pois chiches": { k: 164, p: 9, c: 27, f: 2.6 },
  lentilles: { k: 116, p: 9, c: 20, f: 0.4 },
  "haricots rouges": { k: 127, p: 9, c: 22, f: 0.5 },
  tofu: { k: 120, p: 12, c: 2, f: 7 },
  houmous: { k: 230, p: 8, c: 14, f: 17 },
  // Épicerie / condiments
  "sauce soja": { k: 60, p: 6, c: 6, f: 0 },
  "lait de coco": { k: 200, p: 2, c: 3, f: 21 },
  "bouillon de legumes": { k: 5, p: 0.3, c: 0.8, f: 0.1 },
  pesto: { k: 450, p: 4, c: 6, f: 45 },
  tapenade: { k: 250, p: 2, c: 4, f: 25 },
  tahini: { k: 595, p: 17, c: 21, f: 54 },
  miel: { k: 304, p: 0.3, c: 82, f: 0 },
  sucre: { k: 400, p: 0, c: 100, f: 0 },
  chocolat: { k: 550, p: 6, c: 46, f: 38 },
  cafe: { k: 2, p: 0, c: 0, f: 0 },
  cacahuetes: { k: 567, p: 26, c: 16, f: 49 },
  amandes: { k: 579, p: 21, c: 22, f: 50 },
};

// Variantes → entrée canonique
const ALIASES: Record<string, string> = {
  "cerises": "cerise",
  "citron vert": "citron",
  "boeuf emince": "boeuf",
  "steak hache de boeuf": "boeuf",
  "filet de poulet": "poulet",
  "escalope de poulet": "poulet",
  "pave de saumon": "saumon",
  "dos de cabillaud": "cabillaud",
  "champignons de paris": "champignons",
  "oignon rouge": "oignon",
  "salade romaine": "salade",
  "pommes de terre": "pomme de terre",
  "riz arborio": "riz",
  "riz basmati": "riz",
  "riz rond": "riz",
  "spaghetti": "pates",
  "plaques de lasagne": "pates",
  "nouilles chinoises": "nouilles",
  "nouilles ramen": "nouilles",
  "vermicelles de riz": "nouilles de riz",
  "farine de sarrasin": "farine",
  "lentilles corail": "lentilles",
  "lentilles vertes": "lentilles",
  "chocolat noir": "chocolat",
  "pepites de chocolat": "chocolat",
  "pecorino rape": "parmesan rape",
  "tortilla de ble": "galette de ble",
  "tortillas de ble": "galette de ble",
  "biscuits cuillere": "biscuits",
  "ciboulette": "basilic",
  "persil": "basilic",
};

const FALLBACK: NEntry = { k: 120, p: 4, c: 15, f: 4 };

function lookup(name: string): NEntry {
  const n = normalize(name);
  const key = ALIASES[n] ?? n;
  return TABLE[key] ?? TABLE[n] ?? FALLBACK;
}

// grammes (ou ml) correspondant à une quantité, selon l'unité
function gramsOf(ing: Ingredient, entry: NEntry): number {
  switch (ing.unit) {
    case "g":
    case "ml":
      return ing.qtyPerPerson;
    case "pièce":
      return ing.qtyPerPerson * (entry.piece ?? 100);
    case "c. à soupe":
      return ing.qtyPerPerson * 15;
    case "c. à café":
      return ing.qtyPerPerson * 5;
    case "pincée":
      return ing.qtyPerPerson * 1;
    default:
      return ing.qtyPerPerson;
  }
}

/** Macros d'un ingrédient pour UNE personne. */
export function ingredientNutrition(ing: Ingredient): Nutrition {
  const entry = lookup(ing.name);
  const g = gramsOf(ing, entry);
  const factor = g / 100;
  return {
    kcal: entry.k * factor,
    protein: entry.p * factor,
    carbs: entry.c * factor,
    fat: entry.f * factor,
  };
}

/** Macros d'une recette pour UNE personne (une portion). */
export function recipeNutritionPerPortion(recipe: Recipe): Nutrition {
  const total: Nutrition = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
  for (const ing of recipe.ingredients) {
    const n = ingredientNutrition(ing);
    total.kcal += n.kcal;
    total.protein += n.protein;
    total.carbs += n.carbs;
    total.fat += n.fat;
  }
  return total;
}

export function roundNutrition(n: Nutrition): Nutrition {
  return {
    kcal: Math.round(n.kcal),
    protein: Math.round(n.protein),
    carbs: Math.round(n.carbs),
    fat: Math.round(n.fat),
  };
}
