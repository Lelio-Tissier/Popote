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
// `short` = monogramme de la pastille, `color` = couleur de marque.
export const STORES: Store[] = [
  { id: "carrefour", name: "Carrefour", short: "C", color: "#004E9F", multiplier: 1.0 },
  { id: "leclerc", name: "E.Leclerc", short: "E.L", color: "#0055A4", multiplier: 0.9 },
  { id: "intermarche", name: "Intermarché", short: "Itm", color: "#E2001A", multiplier: 0.95 },
  { id: "auchan", name: "Auchan", short: "A", color: "#E30613", multiplier: 0.97 },
  { id: "lidl", name: "Lidl", short: "Li", color: "#0050AA", multiplier: 0.82 },
  { id: "aldi", name: "Aldi", short: "Al", color: "#002B5C", multiplier: 0.8 },
  { id: "netto", name: "Netto", short: "N", color: "#FFCB05", multiplier: 0.83 },
  { id: "coursesu", name: "Super U", short: "U", color: "#E2001A", multiplier: 0.93 },
  { id: "casino", name: "Casino", short: "Cs", color: "#D4021D", multiplier: 1.08 },
  { id: "franprix", name: "Franprix", short: "Fp", color: "#8CBE22", multiplier: 1.12 },
  { id: "cora", name: "Cora", short: "Co", color: "#E2001A", multiplier: 0.98 },
  { id: "chronodrive", name: "Chronodrive", short: "Ch", color: "#E5007D", multiplier: 0.96 },
  { id: "grandfrais", name: "Grand Frais", short: "GF", color: "#3E8914", multiplier: 1.02 },
  { id: "monoprix", name: "Monoprix", short: "M", color: "#1D1D1B", multiplier: 1.15 },
  { id: "naturalia", name: "Naturalia", short: "Nat", color: "#7AB800", multiplier: 1.28 },
  { id: "biocoop", name: "Biocoop", short: "Bio", color: "#52A63F", multiplier: 1.3 },
  { id: "picard", name: "Picard", short: "P", color: "#005AAB", multiplier: 1.2 },
  { id: "marche", name: "Marché / Primeur", short: "🧺", color: "#B06A2C", multiplier: 1.05 },
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
