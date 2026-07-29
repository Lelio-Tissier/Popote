import type {
  Aisle,
  Allergen,
  Diet,
  Envie,
  Equipment,
  Moment,
  Store,
} from "./types";

// ------- Moments -------
export const MOMENTS: { id: Moment; label: string; emoji: string }[] = [
  { id: "petit-dej", label: "Petit-déj", emoji: "🥐" },
  { id: "brunch", label: "Brunch", emoji: "🍳" },
  { id: "dejeuner", label: "Déjeuner", emoji: "🍽️" },
  { id: "diner", label: "Dîner", emoji: "🌙" },
  { id: "gouter", label: "Goûter", emoji: "🍪" },
  { id: "apero", label: "Apéro", emoji: "🫒" },
  { id: "afterwork", label: "Afterwork", emoji: "🍹" },
  { id: "dessert", label: "Dessert", emoji: "🍰" },
];

// ------- Magasins (multiplicateur de prix) -------
export const STORES: Store[] = [
  { id: "carrefour", name: "Carrefour", emoji: "🟦", multiplier: 1.0 },
  { id: "leclerc", name: "Leclerc", emoji: "🟨", multiplier: 0.9 },
  { id: "intermarche", name: "Intermarché", emoji: "🟥", multiplier: 0.95 },
  { id: "auchan", name: "Auchan", emoji: "🟩", multiplier: 0.97 },
  { id: "lidl", name: "Lidl", emoji: "🟦", multiplier: 0.82 },
  { id: "monoprix", name: "Monoprix", emoji: "⬛", multiplier: 1.15 },
  { id: "marche", name: "Marché / Primeur", emoji: "🧺", multiplier: 1.05 },
  { id: "biocoop", name: "Biocoop", emoji: "🌱", multiplier: 1.3 },
];

// ------- Matériel -------
export const EQUIPMENT: { id: Equipment; label: string; emoji: string }[] = [
  { id: "poele", label: "Poêle", emoji: "🍳" },
  { id: "four", label: "Four", emoji: "🔥" },
  { id: "casserole", label: "Casserole", emoji: "🥘" },
  { id: "robot", label: "Robot / Blender", emoji: "🌀" },
  { id: "air-fryer", label: "Air fryer", emoji: "♨️" },
  { id: "barbecue", label: "Barbecue", emoji: "🔥" },
];

// ------- Niveaux -------
export const LEVELS: { id: 1 | 2 | 3; label: string }[] = [
  { id: 1, label: "Débutant" },
  { id: 2, label: "Intermédiaire" },
  { id: 3, label: "Chef" },
];

// ------- Temps -------
export const TIMES: { id: 15 | 30 | 999; label: string; hint: string }[] = [
  { id: 15, label: "Express", hint: "< 15 min" },
  { id: 30, label: "Rapide", hint: "< 30 min" },
  { id: 999, label: "Tranquille", hint: "j'ai le temps" },
];

// ------- Régimes -------
export const DIETS: { id: Diet; label: string }[] = [
  { id: "tout", label: "Je mange de tout" },
  { id: "vegetarien", label: "Végétarien" },
  { id: "vegan", label: "Vegan" },
  { id: "flexitarien", label: "Flexitarien" },
  { id: "pescetarien", label: "Pescétarien" },
  { id: "sans-porc", label: "Sans porc" },
  { id: "sans-gluten", label: "Sans gluten" },
];

// ------- Allergies -------
export const ALLERGENS: { id: Allergen; label: string }[] = [
  { id: "gluten", label: "Gluten" },
  { id: "lactose", label: "Lactose" },
  { id: "oeuf", label: "Œuf" },
  { id: "arachide", label: "Arachide" },
  { id: "fruits-a-coque", label: "Fruits à coque" },
  { id: "fruits-de-mer", label: "Fruits de mer" },
  { id: "poisson", label: "Poisson" },
  { id: "soja", label: "Soja" },
  { id: "sesame", label: "Sésame" },
  { id: "moutarde", label: "Moutarde" },
];

// ------- Envies -------
export const ENVIES: { id: Envie; label: string; emoji: string }[] = [
  { id: "francais", label: "Français", emoji: "🇫🇷" },
  { id: "italien", label: "Italien", emoji: "🇮🇹" },
  { id: "asiatique", label: "Asiatique", emoji: "🥢" },
  { id: "oriental", label: "Oriental", emoji: "🕌" },
  { id: "mexicain", label: "Mexicain", emoji: "🌮" },
  { id: "indien", label: "Indien", emoji: "🍛" },
  { id: "americain", label: "Américain", emoji: "🍔" },
  { id: "street-food", label: "Street food", emoji: "🌭" },
  { id: "reconfort", label: "Réconfort", emoji: "🫕" },
  { id: "healthy", label: "Healthy", emoji: "🥗" },
  { id: "epice", label: "Épicé", emoji: "🌶️" },
  { id: "gourmand", label: "Gourmand", emoji: "🍫" },
];

// ------- Rayons (ordre d'affichage de la liste de courses) -------
export const AISLE_ORDER: { aisle: Aisle; emoji: string }[] = [
  { aisle: "Fruits & légumes", emoji: "🥕" },
  { aisle: "Boucherie & poissonnerie", emoji: "🥩" },
  { aisle: "Crémerie & œufs", emoji: "🧀" },
  { aisle: "Pâtes, riz & féculents", emoji: "🍚" },
  { aisle: "Épicerie salée", emoji: "🥫" },
  { aisle: "Épicerie sucrée", emoji: "🍯" },
  { aisle: "Boulangerie", emoji: "🥖" },
  { aisle: "Surgelés", emoji: "❄️" },
];

export const BIO_MULTIPLIER = 1.25;

export const DEFAULT_PREFERENCES = {
  moments: ["dejeuner", "diner"] as Moment[],
  people: 2,
  recipeCount: 4,
  store: "carrefour",
  budget: 45,
  level: 2 as const,
  time: 30 as const,
  equipment: ["poele", "four", "casserole"] as Equipment[],
  diet: "tout" as Diet,
  allergies: [] as Allergen[],
  envies: [] as Envie[],
  bio: false,
  local: true,
  antiGaspi: true,
};
