import type {
  Aisle,
  Allergen,
  Envie,
  Equipment,
  Ingredient,
  Level,
  Recipe,
} from "./types";

// ============================================================
// Bousti — Générateur de recettes par MODÈLES.
// ⚠️ Ces recettes sont composées automatiquement à partir de
// briques cohérentes (protéine × méthode × accompagnement, etc.)
// pour garantir >100 plats par moment. Elles complètent les
// recettes signées "fait maison" de recipes.ts / recipes-extra.ts.
// À terme, remplacer par une base réelle sous licence (Supabase).
// ============================================================

const COOKS = [
  "Giulia", "Marc", "Léa", "Camille", "Sofiane", "Emma", "Tom", "Chloé",
  "Diego", "Malee", "Paolo", "Nadia", "Karim", "Hélène", "Manon", "Julien",
  "Sarah", "Antoine", "Lucia", "Yara", "Priya", "Aarav", "Inès", "Enzo",
  "Kenji", "Erwan", "Sylvie", "Élodie", "Eleni", "Bernard", "Awa", "Théo",
];
let cookIdx = 0;
const nextCook = () => COOKS[cookIdx++ % COOKS.length];

const uniq = <T,>(a: T[]): T[] => Array.from(new Set(a));

// ---------- briques : protéines ----------
interface Protein {
  key: string;
  label: string;
  qty: number;
  price: number;
  aisle: Aisle;
  allergens: Allergen[];
  meat: boolean;
  fish: boolean;
  pork: boolean;
  vegan: boolean;
  emoji: string;
}
const PROTEINS: Protein[] = [
  { key: "poulet", label: "poulet", qty: 130, price: 0.011, aisle: "Boucherie & poissonnerie", allergens: [], meat: true, fish: false, pork: false, vegan: false, emoji: "🍗" },
  { key: "boeuf", label: "bœuf", qty: 120, price: 0.014, aisle: "Boucherie & poissonnerie", allergens: [], meat: true, fish: false, pork: false, vegan: false, emoji: "🥩" },
  { key: "porc", label: "porc", qty: 120, price: 0.012, aisle: "Boucherie & poissonnerie", allergens: [], meat: true, fish: false, pork: true, vegan: false, emoji: "🥓" },
  { key: "dinde", label: "dinde", qty: 130, price: 0.011, aisle: "Boucherie & poissonnerie", allergens: [], meat: true, fish: false, pork: false, vegan: false, emoji: "🦃" },
  { key: "saumon", label: "saumon", qty: 120, price: 0.022, aisle: "Boucherie & poissonnerie", allergens: ["poisson"], meat: false, fish: true, pork: false, vegan: false, emoji: "🐟" },
  { key: "cabillaud", label: "cabillaud", qty: 130, price: 0.02, aisle: "Boucherie & poissonnerie", allergens: ["poisson"], meat: false, fish: true, pork: false, vegan: false, emoji: "🐟" },
  { key: "crevettes", label: "crevettes", qty: 100, price: 0.02, aisle: "Boucherie & poissonnerie", allergens: ["fruits-de-mer"], meat: false, fish: true, pork: false, vegan: false, emoji: "🍤" },
  { key: "tofu", label: "tofu", qty: 120, price: 0.008, aisle: "Épicerie salée", allergens: ["soja"], meat: false, fish: false, pork: false, vegan: true, emoji: "🧊" },
  { key: "pois-chiches", label: "pois chiches", qty: 100, price: 0.003, aisle: "Épicerie salée", allergens: [], meat: false, fish: false, pork: false, vegan: true, emoji: "🫘" },
  { key: "lentilles", label: "lentilles", qty: 90, price: 0.004, aisle: "Épicerie salée", allergens: [], meat: false, fish: false, pork: false, vegan: true, emoji: "🍲" },
  { key: "haricots", label: "haricots rouges", qty: 100, price: 0.003, aisle: "Épicerie salée", allergens: [], meat: false, fish: false, pork: false, vegan: true, emoji: "🫘" },
  { key: "champignons", label: "champignons", qty: 150, price: 0.005, aisle: "Fruits & légumes", allergens: [], meat: false, fish: false, pork: false, vegan: true, emoji: "🍄" },
];

// ---------- briques : accompagnements ----------
interface Side {
  key: string;
  label: string;
  qty: number;
  price: number;
  aisle: Aisle;
  allergens: Allergen[];
}
const SIDES: Record<string, Side> = {
  riz: { key: "riz", label: "riz", qty: 70, price: 0.002, aisle: "Pâtes, riz & féculents", allergens: [] },
  basmati: { key: "basmati", label: "riz basmati", qty: 70, price: 0.002, aisle: "Pâtes, riz & féculents", allergens: [] },
  pates: { key: "pates", label: "pâtes", qty: 100, price: 0.0018, aisle: "Pâtes, riz & féculents", allergens: ["gluten"] },
  quinoa: { key: "quinoa", label: "quinoa", qty: 70, price: 0.006, aisle: "Pâtes, riz & féculents", allergens: [] },
  semoule: { key: "semoule", label: "semoule", qty: 70, price: 0.0022, aisle: "Pâtes, riz & féculents", allergens: ["gluten"] },
  boulgour: { key: "boulgour", label: "boulgour", qty: 70, price: 0.003, aisle: "Pâtes, riz & féculents", allergens: ["gluten"] },
  patate: { key: "patate", label: "pommes de terre", qty: 200, price: 0.0015, aisle: "Fruits & légumes", allergens: [] },
  patateDouce: { key: "patate-douce", label: "patate douce", qty: 150, price: 0.0025, aisle: "Fruits & légumes", allergens: [] },
  nouilles: { key: "nouilles", label: "nouilles", qty: 90, price: 0.003, aisle: "Pâtes, riz & féculents", allergens: ["gluten"] },
};

// ---------- briques : méthodes de cuisson ----------
interface Method {
  key: string;
  name: (p: string) => string;
  side: keyof typeof SIDES | null;
  sauce: Ingredient[];
  sauceAllergens: Allergen[];
  equipment: Equipment[];
  tags: Envie[];
  time: number;
  level: Level;
  local: boolean;
  steps: (p: string) => string[];
}
const oignon: Ingredient = { name: "Oignon", qtyPerPerson: 0.5, unit: "pièce", aisle: "Fruits & légumes", unitPrice: 0.3 };

const METHODS: Method[] = [
  {
    key: "curry", name: (p) => `Curry de ${p} au lait de coco`, side: "basmati",
    sauce: [{ name: "Lait de coco", qtyPerPerson: 100, unit: "ml", aisle: "Épicerie salée", unitPrice: 0.003 }, { name: "Pâte de curry", qtyPerPerson: 15, unit: "g", aisle: "Épicerie salée", unitPrice: 0.015 }, oignon],
    sauceAllergens: [], equipment: ["casserole"], tags: ["indien", "epice", "reconfort"], time: 30, level: 1, local: false,
    steps: (p) => [`Faire revenir oignon et épices.`, `Ajouter le ${p} puis le lait de coco.`, `Mijoter 20 min et servir avec le riz.`],
  },
  {
    key: "wok", name: (p) => `Wok de ${p} aux légumes`, side: "nouilles",
    sauce: [{ name: "Sauce soja", qtyPerPerson: 15, unit: "ml", aisle: "Épicerie salée", unitPrice: 0.004 }, { name: "Poivron", qtyPerPerson: 0.5, unit: "pièce", aisle: "Fruits & légumes", unitPrice: 0.8 }, { name: "Carotte", qtyPerPerson: 0.5, unit: "pièce", aisle: "Fruits & légumes", unitPrice: 0.2 }],
    sauceAllergens: ["soja"], equipment: ["poele"], tags: ["asiatique", "healthy"], time: 20, level: 1, local: false,
    steps: (p) => [`Cuire les nouilles.`, `Sauter le ${p} et les légumes à feu vif.`, `Déglacer à la sauce soja et mélanger.`],
  },
  {
    key: "gratin", name: (p) => `Gratin de ${p} à la crème`, side: "patate",
    sauce: [{ name: "Crème fraîche", qtyPerPerson: 60, unit: "g", aisle: "Crémerie & œufs", unitPrice: 0.006 }, { name: "Fromage râpé", qtyPerPerson: 40, unit: "g", aisle: "Crémerie & œufs", unitPrice: 0.012 }],
    sauceAllergens: ["lactose"], equipment: ["four"], tags: ["francais", "gourmand", "reconfort"], time: 45, level: 2, local: true,
    steps: (p) => [`Précuire les pommes de terre.`, `Disposer avec le ${p} et napper de crème.`, `Gratiner 25 min à 180°C.`],
  },
  {
    key: "mijote", name: (p) => `${cap(p)} mijoté à la tomate`, side: "semoule",
    sauce: [{ name: "Tomates concassées", qtyPerPerson: 120, unit: "g", aisle: "Épicerie salée", unitPrice: 0.0018 }, oignon],
    sauceAllergens: [], equipment: ["casserole"], tags: ["oriental", "reconfort"], time: 40, level: 1, local: false,
    steps: (p) => [`Saisir le ${p}.`, `Ajouter tomates et oignon, mijoter 30 min.`, `Servir avec la semoule.`],
  },
  {
    key: "poelee", name: (p) => `Poêlée de ${p} aux petits légumes`, side: "quinoa",
    sauce: [{ name: "Courgette", qtyPerPerson: 0.5, unit: "pièce", aisle: "Fruits & légumes", unitPrice: 0.7 }, { name: "Poivron", qtyPerPerson: 0.5, unit: "pièce", aisle: "Fruits & légumes", unitPrice: 0.8 }],
    sauceAllergens: [], equipment: ["poele"], tags: ["healthy"], time: 25, level: 1, local: true,
    steps: (p) => [`Cuire le quinoa.`, `Poêler le ${p} avec les légumes.`, `Assaisonner et dresser.`],
  },
  {
    key: "bowl", name: (p) => `Bowl de ${p} & avocat`, side: "quinoa",
    sauce: [{ name: "Avocat", qtyPerPerson: 0.5, unit: "pièce", aisle: "Fruits & légumes", unitPrice: 0.9 }, { name: "Tomate", qtyPerPerson: 1, unit: "pièce", aisle: "Fruits & légumes", unitPrice: 0.45 }],
    sauceAllergens: [], equipment: ["casserole"], tags: ["healthy"], time: 20, level: 1, local: false,
    steps: (p) => [`Cuire le quinoa et laisser tiédir.`, `Préparer le ${p}.`, `Dresser le bowl avec avocat et tomate.`],
  },
  {
    key: "roti", name: (p) => `${cap(p)} rôti au four`, side: "patateDouce",
    sauce: [{ name: "Herbes de Provence", qtyPerPerson: 2, unit: "g", aisle: "Épicerie salée", unitPrice: 0.02 }],
    sauceAllergens: [], equipment: ["four"], tags: ["francais", "reconfort"], time: 40, level: 2, local: true,
    steps: (p) => [`Assaisonner le ${p} d'huile et d'herbes.`, `Disposer la patate douce autour.`, `Rôtir 30 min à 190°C.`],
  },
  {
    key: "saute", name: (p) => `${cap(p)} sauté épicé`, side: "riz",
    sauce: [{ name: "Poivron", qtyPerPerson: 0.5, unit: "pièce", aisle: "Fruits & légumes", unitPrice: 0.8 }, { name: "Paprika fumé", qtyPerPerson: 3, unit: "g", aisle: "Épicerie salée", unitPrice: 0.02 }, oignon],
    sauceAllergens: [], equipment: ["poele"], tags: ["epice", "street-food"], time: 25, level: 2, local: false,
    steps: (p) => [`Cuire le riz.`, `Sauter le ${p} avec poivron et paprika.`, `Mélanger et servir bien chaud.`],
  },
  {
    key: "tajine", name: (p) => `Tajine de ${p}`, side: "semoule",
    sauce: [{ name: "Tomates concassées", qtyPerPerson: 100, unit: "g", aisle: "Épicerie salée", unitPrice: 0.0018 }, { name: "Carotte", qtyPerPerson: 1, unit: "pièce", aisle: "Fruits & légumes", unitPrice: 0.2 }, oignon],
    sauceAllergens: [], equipment: ["casserole"], tags: ["oriental", "epice", "reconfort"], time: 50, level: 2, local: false,
    steps: (p) => [`Faire revenir le ${p} avec les épices.`, `Ajouter légumes et tomates, mijoter 35 min.`, `Servir sur la semoule.`],
  },
  {
    key: "cremeux", name: (p) => `${cap(p)} crémeux aux champignons`, side: "riz",
    sauce: [{ name: "Crème fraîche", qtyPerPerson: 60, unit: "g", aisle: "Crémerie & œufs", unitPrice: 0.006 }, { name: "Champignons de Paris", qtyPerPerson: 80, unit: "g", aisle: "Fruits & légumes", unitPrice: 0.005 }],
    sauceAllergens: ["lactose"], equipment: ["poele", "casserole"], tags: ["francais", "reconfort", "gourmand"], time: 35, level: 2, local: true,
    steps: (p) => [`Cuire le riz.`, `Poêler le ${p} puis ajouter champignons et crème.`, `Laisser épaissir et napper le riz.`],
  },
];

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function buildMains(): Recipe[] {
  const out: Recipe[] = [];
  for (const p of PROTEINS) {
    for (const m of METHODS) {
      const side = m.side ? SIDES[m.side] : null;
      const ingredients: Ingredient[] = [
        { name: cap(p.label), qtyPerPerson: p.qty, unit: p.aisle === "Boucherie & poissonnerie" || p.key === "champignons" ? "g" : "g", aisle: p.aisle, unitPrice: p.price },
        ...m.sauce,
      ];
      if (side) ingredients.push({ name: cap(side.label), qtyPerPerson: side.qty, unit: side.qty <= 5 ? "pièce" : "g", aisle: side.aisle, unitPrice: side.price });
      const allergens = uniq([...p.allergens, ...m.sauceAllergens, ...(side?.allergens ?? [])]);
      out.push({
        id: `gen-main-${p.key}-${m.key}`,
        name: m.name(p.label),
        cookName: nextCook(),
        emoji: p.emoji,
        moments: ["dejeuner", "diner"],
        level: m.level,
        timeMin: m.time,
        equipment: m.equipment,
        isMeat: p.meat,
        isFish: p.fish,
        hasPork: p.pork,
        isVegan: p.vegan && allergens.length === 0 ? p.vegan : p.vegan,
        allergens,
        tags: m.tags,
        isLocal: m.local,
        isSeasonal: true,
        steps: m.steps(p.label),
        ingredients,
      });
    }
  }
  return out;
}

// ---------- petit-déj / brunch / goûter ----------
interface Fruit { key: string; label: string; price: number }
const FRUITS: Fruit[] = [
  { key: "banane", label: "banane", price: 0.3 },
  { key: "fraise", label: "fraise", price: 0.9 },
  { key: "myrtille", label: "myrtille", price: 1.1 },
  { key: "mangue", label: "mangue", price: 1.3 },
  { key: "pomme", label: "pomme", price: 0.35 },
  { key: "framboise", label: "framboise", price: 1.4 },
  { key: "peche", label: "pêche", price: 0.6 },
  { key: "poire", label: "poire", price: 0.4 },
  { key: "kiwi", label: "kiwi", price: 0.4 },
  { key: "abricot", label: "abricot", price: 0.7 },
  { key: "cerise", label: "cerise", price: 1.0 },
  { key: "chocolat", label: "chocolat", price: 0.6 },
];

interface BreakfastFormat {
  key: string; name: (f: string) => string; emoji: string;
  base: Ingredient[]; allergens: Allergen[]; equipment: Equipment[];
  tags: Envie[]; time: number; level: Level; local: boolean;
  steps: (f: string) => string[]; fruitUnit?: Ingredient["unit"]; fruitQty?: number;
}
const BREAKFAST_FORMATS: BreakfastFormat[] = [
  { key: "porridge", name: (f) => `Porridge à la ${f}`, emoji: "🥣", base: [{ name: "Flocons d'avoine", qtyPerPerson: 50, unit: "g", aisle: "Épicerie sucrée", unitPrice: 0.003 }, { name: "Lait", qtyPerPerson: 200, unit: "ml", aisle: "Crémerie & œufs", unitPrice: 0.0011 }], allergens: ["lactose"], equipment: ["casserole"], tags: ["healthy", "reconfort"], time: 10, level: 1, local: false, steps: (f) => [`Chauffer les flocons dans le lait.`, `Laisser épaissir 5 min.`, `Ajouter la ${f} et un filet de miel.`] },
  { key: "smoothie", name: (f) => `Smoothie bowl ${f}`, emoji: "🥭", base: [{ name: "Banane", qtyPerPerson: 1, unit: "pièce", aisle: "Fruits & légumes", unitPrice: 0.3 }, { name: "Boisson d'avoine", qtyPerPerson: 100, unit: "ml", aisle: "Crémerie & œufs", unitPrice: 0.002 }], allergens: [], equipment: ["robot"], tags: ["healthy", "gourmand"], time: 8, level: 1, local: false, steps: (f) => [`Mixer banane, ${f} et boisson végétale.`, `Verser dans un bol.`, `Garnir de flocons et fruits frais.`] },
  { key: "chia", name: (f) => `Chia pudding ${f}`, emoji: "🌱", base: [{ name: "Graines de chia", qtyPerPerson: 25, unit: "g", aisle: "Épicerie sucrée", unitPrice: 0.02 }, { name: "Boisson d'avoine", qtyPerPerson: 150, unit: "ml", aisle: "Crémerie & œufs", unitPrice: 0.002 }], allergens: [], equipment: [], tags: ["healthy"], time: 10, level: 1, local: false, steps: (f) => [`Mélanger chia et boisson végétale.`, `Laisser prendre une nuit au frais.`, `Ajouter la ${f} au moment de servir.`] },
  { key: "oats", name: (f) => `Overnight oats ${f}`, emoji: "🥛", base: [{ name: "Flocons d'avoine", qtyPerPerson: 50, unit: "g", aisle: "Épicerie sucrée", unitPrice: 0.003 }, { name: "Yaourt nature", qtyPerPerson: 100, unit: "g", aisle: "Crémerie & œufs", unitPrice: 0.004 }], allergens: ["lactose"], equipment: [], tags: ["healthy"], time: 8, level: 1, local: false, steps: (f) => [`Mélanger avoine et yaourt.`, `Réserver une nuit au frais.`, `Garnir de ${f}.`] },
  { key: "pancakes", name: (f) => `Pancakes ${f}`, emoji: "🥞", base: [{ name: "Farine", qtyPerPerson: 60, unit: "g", aisle: "Épicerie sucrée", unitPrice: 0.0015 }, { name: "Œuf", qtyPerPerson: 0.5, unit: "pièce", aisle: "Crémerie & œufs", unitPrice: 0.3 }, { name: "Lait", qtyPerPerson: 100, unit: "ml", aisle: "Crémerie & œufs", unitPrice: 0.0011 }], allergens: ["gluten", "oeuf", "lactose"], equipment: ["poele"], tags: ["americain", "gourmand"], time: 20, level: 1, local: false, steps: (f) => [`Préparer la pâte à pancakes.`, `Cuire de petites louches à la poêle.`, `Servir avec la ${f}.`] },
  { key: "crepes", name: (f) => `Crêpes à la ${f}`, emoji: "🥞", base: [{ name: "Farine", qtyPerPerson: 60, unit: "g", aisle: "Épicerie sucrée", unitPrice: 0.0015 }, { name: "Œuf", qtyPerPerson: 1, unit: "pièce", aisle: "Crémerie & œufs", unitPrice: 0.3 }, { name: "Lait", qtyPerPerson: 150, unit: "ml", aisle: "Crémerie & œufs", unitPrice: 0.0011 }], allergens: ["gluten", "oeuf", "lactose"], equipment: ["poele"], tags: ["francais", "gourmand", "reconfort"], time: 25, level: 1, local: true, steps: (f) => [`Préparer et reposer la pâte.`, `Cuire de fines crêpes.`, `Garnir de ${f}.`] },
  { key: "gaufres", name: (f) => `Gaufres ${f}`, emoji: "🧇", base: [{ name: "Farine", qtyPerPerson: 60, unit: "g", aisle: "Épicerie sucrée", unitPrice: 0.0015 }, { name: "Œuf", qtyPerPerson: 0.75, unit: "pièce", aisle: "Crémerie & œufs", unitPrice: 0.3 }, { name: "Lait", qtyPerPerson: 120, unit: "ml", aisle: "Crémerie & œufs", unitPrice: 0.0011 }], allergens: ["gluten", "oeuf", "lactose"], equipment: [], tags: ["gourmand", "reconfort"], time: 25, level: 1, local: false, steps: (f) => [`Préparer la pâte à gaufres.`, `Cuire au gaufrier.`, `Servir avec ${f}.`] },
  { key: "tartine", name: (f) => `Tartine ${f}`, emoji: "🍞", base: [{ name: "Pain de campagne", qtyPerPerson: 80, unit: "g", aisle: "Boulangerie", unitPrice: 0.004 }], allergens: ["gluten"], equipment: [], tags: ["gourmand"], time: 6, level: 1, local: true, steps: (f) => [`Toaster le pain.`, `Étaler la garniture.`, `Ajouter la ${f}.`] },
  { key: "yaourt", name: (f) => `Bol yaourt, granola & ${f}`, emoji: "🥣", base: [{ name: "Yaourt nature", qtyPerPerson: 125, unit: "g", aisle: "Crémerie & œufs", unitPrice: 0.004 }, { name: "Granola", qtyPerPerson: 50, unit: "g", aisle: "Épicerie sucrée", unitPrice: 0.007 }], allergens: ["lactose", "gluten"], equipment: [], tags: ["healthy", "gourmand"], time: 5, level: 1, local: false, steps: (f) => [`Verser le yaourt.`, `Parsemer de granola.`, `Ajouter la ${f}.`] },
  { key: "muesli", name: (f) => `Muesli ${f}`, emoji: "🥣", base: [{ name: "Muesli", qtyPerPerson: 60, unit: "g", aisle: "Épicerie sucrée", unitPrice: 0.006 }, { name: "Lait", qtyPerPerson: 150, unit: "ml", aisle: "Crémerie & œufs", unitPrice: 0.0011 }], allergens: ["gluten", "lactose"], equipment: [], tags: ["healthy"], time: 5, level: 1, local: false, steps: (f) => [`Verser le muesli dans un bol.`, `Ajouter le lait.`, `Compléter avec la ${f}.`] },
];

function buildBreakfast(): Recipe[] {
  const out: Recipe[] = [];
  for (const b of BREAKFAST_FORMATS) {
    for (const f of FRUITS) {
      const fruitIng: Ingredient = f.key === "chocolat"
        ? { name: "Pépites de chocolat", qtyPerPerson: 20, unit: "g", aisle: "Épicerie sucrée", unitPrice: 0.008 }
        : { name: cap(f.label), qtyPerPerson: 60, unit: "g", aisle: "Fruits & légumes", unitPrice: f.price / 100 + 0.004 };
      out.push({
        id: `gen-brk-${b.key}-${f.key}`,
        name: b.name(f.label),
        cookName: nextCook(),
        emoji: b.emoji,
        moments: ["petit-dej", "brunch", "gouter"],
        level: b.level,
        timeMin: b.time,
        equipment: b.equipment,
        isMeat: false,
        isFish: false,
        hasPork: false,
        isVegan: !b.allergens.includes("lactose") && !b.allergens.includes("oeuf"),
        allergens: b.allergens,
        tags: b.tags,
        isLocal: b.local,
        isSeasonal: true,
        steps: b.steps(f.label),
        ingredients: [...b.base, fruitIng],
      });
    }
  }
  return out;
}

// ---------- apéro / afterwork ----------
interface AperoFormat {
  key: string; emoji: string; name: (v: string) => string;
  base: Ingredient[]; allergens: Allergen[]; equipment: Equipment[];
  tags: Envie[]; time: number; level: Level; vegan: boolean; pork: boolean;
  fish: boolean; local: boolean; variants: { key: string; label: string; ing: Ingredient; allergens?: Allergen[]; pork?: boolean; fish?: boolean; vegan?: boolean }[];
  steps: (v: string) => string[];
}
const veg = (name: string, q: number, price: number, aisle: Aisle = "Fruits & légumes"): Ingredient => ({ name, qtyPerPerson: q, unit: "g", aisle, unitPrice: price });

const APERO_FORMATS: AperoFormat[] = [
  {
    key: "bruschetta", emoji: "🍅", name: (v) => `Bruschetta ${v}`,
    base: [{ name: "Baguette", qtyPerPerson: 0.4, unit: "pièce", aisle: "Boulangerie", unitPrice: 0.95 }],
    allergens: ["gluten"], equipment: ["four"], tags: ["italien"], time: 12, level: 1, vegan: true, pork: false, fish: false, local: true,
    steps: (v) => [`Toaster le pain frotté d'ail.`, `Garnir de ${v}.`, `Servir aussitôt.`],
    variants: [
      { key: "tomate", label: "tomate-basilic", ing: veg("Tomate", 60, 0.006) },
      { key: "chevre", label: "chèvre-miel", ing: veg("Fromage de chèvre", 40, 0.014, "Crémerie & œufs"), allergens: ["lactose"], vegan: false },
      { key: "poivron", label: "poivrons grillés", ing: veg("Poivron", 60, 0.006) },
      { key: "champignon", label: "champignons", ing: veg("Champignons de Paris", 60, 0.005) },
      { key: "aubergine", label: "caviar d'aubergine", ing: veg("Aubergine", 60, 0.006) },
      { key: "figue", label: "figue-chèvre", ing: veg("Figue", 40, 0.01), vegan: false, allergens: ["lactose"] },
    ],
  },
  {
    key: "houmous", emoji: "🫓", name: (v) => `Houmous ${v}`,
    base: [{ name: "Pois chiches", qtyPerPerson: 90, unit: "g", aisle: "Épicerie salée", unitPrice: 0.003 }, { name: "Tahini (purée de sésame)", qtyPerPerson: 15, unit: "g", aisle: "Épicerie salée", unitPrice: 0.012 }],
    allergens: ["sesame"], equipment: ["robot"], tags: ["oriental", "healthy"], time: 10, level: 1, vegan: true, pork: false, fish: false, local: false,
    steps: (v) => [`Mixer pois chiches, tahini, ail et citron.`, `Détendre à l'eau, ajouter ${v}.`, `Servir avec des crudités.`],
    variants: [
      { key: "classique", label: "classique", ing: veg("Citron", 0.3, 0.35) },
      { key: "betterave", label: "à la betterave", ing: veg("Betterave cuite", 50, 0.006) },
      { key: "poivron", label: "poivron rôti", ing: veg("Poivron", 0.4, 0.8) },
      { key: "avocat", label: "avocat", ing: veg("Avocat", 0.4, 0.9) },
      { key: "curcuma", label: "curcuma", ing: veg("Curcuma", 3, 0.03, "Épicerie salée") },
      { key: "herbes", label: "aux herbes", ing: veg("Persil", 8, 0.05) },
    ],
  },
  {
    key: "verrine", emoji: "🥂", name: (v) => `Verrine ${v}`,
    base: [{ name: "Fromage frais", qtyPerPerson: 50, unit: "g", aisle: "Crémerie & œufs", unitPrice: 0.008 }],
    allergens: ["lactose"], equipment: [], tags: ["gourmand"], time: 12, level: 1, vegan: false, pork: false, fish: false, local: true,
    steps: (v) => [`Mixer la base au fromage frais.`, `Dresser en verrines avec ${v}.`, `Réserver au frais.`],
    variants: [
      { key: "saumon", label: "saumon-aneth", ing: veg("Saumon fumé", 30, 0.03, "Boucherie & poissonnerie"), allergens: ["poisson"], fish: true },
      { key: "thon", label: "thon-tomate", ing: veg("Thon", 40, 0.012, "Épicerie salée"), allergens: ["poisson"], fish: true },
      { key: "avocat", label: "avocat-crevette", ing: veg("Crevettes", 30, 0.02, "Boucherie & poissonnerie"), allergens: ["fruits-de-mer"], fish: true },
      { key: "tomate", label: "tomate-mozza", ing: veg("Mozzarella", 40, 0.009, "Crémerie & œufs") },
      { key: "betterave", label: "betterave-chèvre", ing: veg("Betterave cuite", 50, 0.006) },
      { key: "petitpois", label: "petits pois-menthe", ing: veg("Petits pois", 50, 0.004, "Surgelés") },
    ],
  },
  {
    key: "cakesale", emoji: "🧁", name: (v) => `Cake salé ${v}`,
    base: [{ name: "Farine", qtyPerPerson: 40, unit: "g", aisle: "Épicerie sucrée", unitPrice: 0.0015 }, { name: "Œuf", qtyPerPerson: 0.75, unit: "pièce", aisle: "Crémerie & œufs", unitPrice: 0.3 }],
    allergens: ["gluten", "oeuf"], equipment: ["four"], tags: ["francais", "gourmand"], time: 50, level: 2, vegan: false, pork: false, fish: false, local: true,
    steps: (v) => [`Mélanger farine, œufs, lait et levure.`, `Ajouter ${v}.`, `Cuire 40 min à 180°C.`],
    variants: [
      { key: "olives", label: "olives-jambon", ing: veg("Jambon", 0.6, 0.7, "Boucherie & poissonnerie"), pork: true },
      { key: "chevre", label: "chèvre-épinards", ing: veg("Fromage de chèvre", 40, 0.014, "Crémerie & œufs"), allergens: ["lactose"] },
      { key: "tomate", label: "tomate-feta", ing: veg("Feta", 40, 0.012, "Crémerie & œufs"), allergens: ["lactose"] },
      { key: "courgette", label: "courgette-comté", ing: veg("Courgette", 0.5, 0.7), allergens: ["lactose"] },
      { key: "saumon", label: "saumon-aneth", ing: veg("Saumon fumé", 30, 0.03, "Boucherie & poissonnerie"), allergens: ["poisson"], fish: true },
      { key: "poivron", label: "poivron-chorizo", ing: veg("Chorizo", 30, 0.018, "Boucherie & poissonnerie"), pork: true },
    ],
  },
  {
    key: "tapenade", emoji: "🫒", name: (v) => `Tapenade ${v}`,
    base: [{ name: "Olives", qtyPerPerson: 50, unit: "g", aisle: "Épicerie salée", unitPrice: 0.01 }, { name: "Baguette", qtyPerPerson: 0.3, unit: "pièce", aisle: "Boulangerie", unitPrice: 0.95 }],
    allergens: ["gluten"], equipment: ["robot"], tags: ["francais"], time: 10, level: 1, vegan: true, pork: false, fish: false, local: true,
    steps: (v) => [`Mixer les olives avec ${v} et huile d'olive.`, `Rectifier l'assaisonnement.`, `Servir sur des toasts.`],
    variants: [
      { key: "noire", label: "d'olives noires", ing: veg("Câpres", 10, 0.02, "Épicerie salée") },
      { key: "verte", label: "d'olives vertes", ing: veg("Amandes", 15, 0.02, "Épicerie salée"), allergens: ["fruits-a-coque"] },
      { key: "tomate", label: "tomates séchées", ing: veg("Tomates séchées", 30, 0.015, "Épicerie salée") },
      { key: "poivron", label: "poivron", ing: veg("Poivron", 0.4, 0.8) },
      { key: "artichaut", label: "artichaut", ing: veg("Cœurs d'artichaut", 40, 0.012, "Épicerie salée") },
      { key: "basilic", label: "basilic", ing: veg("Basilic", 6, 0.06) },
    ],
  },
  {
    key: "roule", emoji: "🌯", name: (v) => `Roulé apéro ${v}`,
    base: [{ name: "Tortilla de blé", qtyPerPerson: 1, unit: "pièce", aisle: "Boulangerie", unitPrice: 0.3 }, { name: "Fromage frais", qtyPerPerson: 40, unit: "g", aisle: "Crémerie & œufs", unitPrice: 0.008 }],
    allergens: ["gluten", "lactose"], equipment: [], tags: ["street-food"], time: 12, level: 1, vegan: false, pork: false, fish: false, local: false,
    steps: (v) => [`Tartiner la tortilla de fromage frais.`, `Ajouter ${v}.`, `Rouler serré et couper en bouchées.`],
    variants: [
      { key: "saumon", label: "au saumon", ing: veg("Saumon fumé", 30, 0.03, "Boucherie & poissonnerie"), allergens: ["poisson"], fish: true },
      { key: "jambon", label: "au jambon", ing: veg("Jambon", 0.6, 0.7, "Boucherie & poissonnerie"), pork: true },
      { key: "thon", label: "au thon", ing: veg("Thon", 40, 0.012, "Épicerie salée"), allergens: ["poisson"], fish: true },
      { key: "poulet", label: "au poulet", ing: veg("Poulet", 40, 0.011, "Boucherie & poissonnerie") },
      { key: "avocat", label: "à l'avocat", ing: veg("Avocat", 0.4, 0.9), vegan: false },
      { key: "legumes", label: "aux crudités", ing: veg("Carotte", 0.5, 0.2) },
    ],
  },
];

function buildApero(): Recipe[] {
  const out: Recipe[] = [];
  for (const a of APERO_FORMATS) {
    for (const v of a.variants) {
      const allergens = uniq([...a.allergens, ...(v.allergens ?? [])]);
      const fish = a.fish || !!v.fish;
      const pork = a.pork || !!v.pork;
      const vegan = a.vegan && (v.vegan ?? true) && !fish && !pork && !allergens.includes("lactose") && !allergens.includes("oeuf");
      out.push({
        id: `gen-apero-${a.key}-${v.key}`,
        name: a.name(v.label),
        cookName: nextCook(),
        emoji: a.emoji,
        moments: ["apero", "afterwork"],
        level: a.level,
        timeMin: a.time,
        equipment: a.equipment,
        isMeat: false,
        isFish: fish,
        hasPork: pork,
        isVegan: vegan,
        allergens,
        tags: a.tags,
        isLocal: a.local,
        isSeasonal: true,
        steps: a.steps(v.label),
        ingredients: [...a.base, v.ing],
      });
    }
  }
  return out;
}

// ---------- apéro : lot générique (base × topping) ----------
interface AperoBase {
  key: string; label: string; ing: Ingredient; allergens: Allergen[];
  equipment: Equipment[]; local: boolean; emoji: string;
}
interface AperoTopping {
  key: string; label: string; ing: Ingredient; allergens: Allergen[];
  fish: boolean; pork: boolean; vegan: boolean;
}
const APERO_BASES: AperoBase[] = [
  { key: "crostini", label: "Crostini", emoji: "🥖", ing: { name: "Baguette", qtyPerPerson: 0.4, unit: "pièce", aisle: "Boulangerie", unitPrice: 0.95 }, allergens: ["gluten"], equipment: ["four"], local: true },
  { key: "blinis", label: "Blinis", emoji: "🥞", ing: { name: "Blinis", qtyPerPerson: 3, unit: "pièce", aisle: "Boulangerie", unitPrice: 0.2 }, allergens: ["gluten", "lactose", "oeuf"], equipment: [], local: false },
  { key: "tartelette", label: "Tartelette", emoji: "🥧", ing: { name: "Pâte feuilletée", qtyPerPerson: 0.2, unit: "pièce", aisle: "Crémerie & œufs", unitPrice: 1.5 }, allergens: ["gluten"], equipment: ["four"], local: true },
  { key: "cracker", label: "Cracker", emoji: "🍘", ing: { name: "Crackers", qtyPerPerson: 30, unit: "g", aisle: "Épicerie salée", unitPrice: 0.008 }, allergens: ["gluten"], equipment: [], local: false },
  { key: "navette", label: "Petite navette", emoji: "🥐", ing: { name: "Pain navette", qtyPerPerson: 2, unit: "pièce", aisle: "Boulangerie", unitPrice: 0.25 }, allergens: ["gluten"], equipment: [], local: true },
  { key: "cuillere", label: "Cuillère apéro", emoji: "🥄", ing: { name: "Fromage frais", qtyPerPerson: 40, unit: "g", aisle: "Crémerie & œufs", unitPrice: 0.008 }, allergens: ["lactose"], equipment: [], local: true },
];
const APERO_TOPPINGS: AperoTopping[] = [
  { key: "tomate-mozza", label: "tomate-mozzarella", ing: veg("Mozzarella", 40, 0.009, "Crémerie & œufs"), allergens: ["lactose"], fish: false, pork: false, vegan: false },
  { key: "chevre-miel", label: "chèvre-miel", ing: veg("Fromage de chèvre", 40, 0.014, "Crémerie & œufs"), allergens: ["lactose"], fish: false, pork: false, vegan: false },
  { key: "saumon", label: "saumon fumé", ing: veg("Saumon fumé", 30, 0.03, "Boucherie & poissonnerie"), allergens: ["poisson"], fish: true, pork: false, vegan: false },
  { key: "houmous", label: "houmous-poivron", ing: veg("Houmous", 40, 0.01, "Épicerie salée"), allergens: ["sesame"], fish: false, pork: false, vegan: true },
  { key: "avocat", label: "avocat-citron", ing: veg("Avocat", 0.4, 0.9), allergens: [], fish: false, pork: false, vegan: true },
  { key: "thon", label: "thon-tomate", ing: veg("Thon", 40, 0.012, "Épicerie salée"), allergens: ["poisson"], fish: true, pork: false, vegan: false },
  { key: "tapenade", label: "tapenade d'olives", ing: veg("Tapenade", 30, 0.012, "Épicerie salée"), allergens: [], fish: false, pork: false, vegan: true },
  { key: "artichaut", label: "artichaut", ing: veg("Cœurs d'artichaut", 40, 0.012, "Épicerie salée"), allergens: [], fish: false, pork: false, vegan: true },
  { key: "betterave-feta", label: "betterave-feta", ing: veg("Feta", 40, 0.012, "Crémerie & œufs"), allergens: ["lactose"], fish: false, pork: false, vegan: false },
  { key: "champignon", label: "champignons persillés", ing: veg("Champignons de Paris", 50, 0.005), allergens: [], fish: false, pork: false, vegan: true },
];

function buildAperoGeneric(): Recipe[] {
  const out: Recipe[] = [];
  for (const b of APERO_BASES) {
    for (const t of APERO_TOPPINGS) {
      const allergens = uniq([...b.allergens, ...t.allergens]);
      const vegan = t.vegan && !allergens.includes("lactose") && !allergens.includes("oeuf") && !t.fish && !t.pork;
      out.push({
        id: `gen-aperog-${b.key}-${t.key}`,
        name: `${b.label} ${t.label}`,
        cookName: nextCook(),
        emoji: b.emoji,
        moments: ["apero", "afterwork"],
        level: 1,
        timeMin: b.equipment.includes("four") ? 15 : 8,
        equipment: b.equipment,
        isMeat: false,
        isFish: t.fish,
        hasPork: t.pork,
        isVegan: vegan,
        allergens,
        tags: ["gourmand"],
        isLocal: b.local,
        isSeasonal: true,
        steps: [
          `Préparer la base "${b.label.toLowerCase()}".`,
          `Garnir de ${t.label}.`,
          `Dresser et servir frais.`,
        ],
        ingredients: [b.ing, t.ing],
      });
    }
  }
  return out;
}

// ---------- desserts / goûter ----------
interface DessertFormat {
  key: string; emoji: string; name: (f: string) => string;
  base: Ingredient[]; allergens: Allergen[]; equipment: Equipment[];
  tags: Envie[]; time: number; level: Level; local: boolean; vegan: boolean;
  steps: (f: string) => string[];
}
const DFLAVORS: Fruit[] = FRUITS;
const DESSERT_FORMATS: DessertFormat[] = [
  { key: "fondant", emoji: "🍫", name: (f) => `Fondant ${f}`, base: [{ name: "Chocolat noir", qtyPerPerson: 50, unit: "g", aisle: "Épicerie sucrée", unitPrice: 0.012 }, { name: "Beurre", qtyPerPerson: 30, unit: "g", aisle: "Crémerie & œufs", unitPrice: 0.009 }, { name: "Œuf", qtyPerPerson: 1, unit: "pièce", aisle: "Crémerie & œufs", unitPrice: 0.3 }], allergens: ["gluten", "lactose", "oeuf"], equipment: ["four"], tags: ["gourmand"], time: 25, level: 2, local: true, vegan: false, steps: (f) => [`Fondre chocolat et beurre.`, `Ajouter œufs, sucre et un peu de farine.`, `Cuire 10 min : cœur ${f}.`] },
  { key: "moelleux", emoji: "🧁", name: (f) => `Moelleux ${f}`, base: [{ name: "Farine", qtyPerPerson: 45, unit: "g", aisle: "Épicerie sucrée", unitPrice: 0.0015 }, { name: "Œuf", qtyPerPerson: 0.75, unit: "pièce", aisle: "Crémerie & œufs", unitPrice: 0.3 }, { name: "Sucre", qtyPerPerson: 25, unit: "g", aisle: "Épicerie sucrée", unitPrice: 0.0012 }], allergens: ["gluten", "oeuf"], equipment: ["four"], tags: ["gourmand", "reconfort"], time: 30, level: 1, local: false, vegan: false, steps: (f) => [`Battre œufs et sucre.`, `Incorporer farine et ${f}.`, `Cuire 25 min à 180°C.`] },
  { key: "tarte", emoji: "🥧", name: (f) => `Tarte ${f}`, base: [{ name: "Pâte brisée", qtyPerPerson: 0.25, unit: "pièce", aisle: "Crémerie & œufs", unitPrice: 1.4 }, { name: "Sucre", qtyPerPerson: 20, unit: "g", aisle: "Épicerie sucrée", unitPrice: 0.0012 }], allergens: ["gluten"], equipment: ["four"], tags: ["francais", "gourmand"], time: 45, level: 2, local: true, vegan: false, steps: (f) => [`Foncer le moule avec la pâte.`, `Disposer la ${f}.`, `Cuire 30 min à 180°C.`] },
  { key: "crumble", emoji: "🍎", name: (f) => `Crumble ${f}`, base: [{ name: "Farine", qtyPerPerson: 40, unit: "g", aisle: "Épicerie sucrée", unitPrice: 0.0015 }, { name: "Beurre", qtyPerPerson: 30, unit: "g", aisle: "Crémerie & œufs", unitPrice: 0.009 }, { name: "Sucre", qtyPerPerson: 25, unit: "g", aisle: "Épicerie sucrée", unitPrice: 0.0012 }], allergens: ["gluten", "lactose"], equipment: ["four"], tags: ["francais", "reconfort", "gourmand"], time: 40, level: 1, local: true, vegan: false, steps: (f) => [`Disposer la ${f} dans un plat.`, `Sabler farine, beurre et sucre.`, `Cuire 30 min à 180°C.`] },
  { key: "clafoutis", emoji: "🍒", name: (f) => `Clafoutis ${f}`, base: [{ name: "Œuf", qtyPerPerson: 1, unit: "pièce", aisle: "Crémerie & œufs", unitPrice: 0.3 }, { name: "Lait", qtyPerPerson: 100, unit: "ml", aisle: "Crémerie & œufs", unitPrice: 0.0011 }, { name: "Farine", qtyPerPerson: 30, unit: "g", aisle: "Épicerie sucrée", unitPrice: 0.0015 }], allergens: ["gluten", "lactose", "oeuf"], equipment: ["four"], tags: ["francais", "gourmand"], time: 45, level: 1, local: true, vegan: false, steps: (f) => [`Disposer la ${f} dans un plat beurré.`, `Verser l'appareil œufs-lait-farine.`, `Cuire 35 min à 180°C.`] },
  { key: "mousse", emoji: "🍮", name: (f) => `Mousse ${f}`, base: [{ name: "Œuf", qtyPerPerson: 1.5, unit: "pièce", aisle: "Crémerie & œufs", unitPrice: 0.3 }, { name: "Sucre", qtyPerPerson: 15, unit: "g", aisle: "Épicerie sucrée", unitPrice: 0.0012 }], allergens: ["oeuf"], equipment: ["robot"], tags: ["francais", "gourmand"], time: 20, level: 2, local: true, vegan: false, steps: (f) => [`Monter les blancs en neige.`, `Incorporer la ${f}.`, `Réserver au frais 3 h.`] },
  { key: "pannacotta", emoji: "🍶", name: (f) => `Panna cotta ${f}`, base: [{ name: "Crème fraîche", qtyPerPerson: 100, unit: "g", aisle: "Crémerie & œufs", unitPrice: 0.006 }, { name: "Sucre", qtyPerPerson: 15, unit: "g", aisle: "Épicerie sucrée", unitPrice: 0.0012 }], allergens: ["lactose"], equipment: ["casserole"], tags: ["italien", "gourmand"], time: 20, level: 2, local: false, vegan: false, steps: (f) => [`Chauffer crème, sucre et gélatine.`, `Couler en verrines.`, `Napper d'un coulis de ${f}.`] },
  { key: "muffins", emoji: "🧁", name: (f) => `Muffins ${f}`, base: [{ name: "Farine", qtyPerPerson: 45, unit: "g", aisle: "Épicerie sucrée", unitPrice: 0.0015 }, { name: "Œuf", qtyPerPerson: 0.5, unit: "pièce", aisle: "Crémerie & œufs", unitPrice: 0.3 }, { name: "Sucre", qtyPerPerson: 20, unit: "g", aisle: "Épicerie sucrée", unitPrice: 0.0012 }], allergens: ["gluten", "oeuf"], equipment: ["four"], tags: ["americain", "gourmand"], time: 30, level: 1, local: false, vegan: false, steps: (f) => [`Mélanger les ingrédients secs et humides.`, `Ajouter la ${f}.`, `Cuire 22 min à 180°C.`] },
  { key: "cookies", emoji: "🍪", name: (f) => `Cookies ${f}`, base: [{ name: "Farine", qtyPerPerson: 45, unit: "g", aisle: "Épicerie sucrée", unitPrice: 0.0015 }, { name: "Beurre", qtyPerPerson: 25, unit: "g", aisle: "Crémerie & œufs", unitPrice: 0.009 }, { name: "Sucre", qtyPerPerson: 25, unit: "g", aisle: "Épicerie sucrée", unitPrice: 0.0012 }], allergens: ["gluten", "lactose", "oeuf"], equipment: ["four"], tags: ["americain", "gourmand", "reconfort"], time: 25, level: 1, local: false, vegan: false, steps: (f) => [`Crémer beurre et sucre.`, `Incorporer farine et ${f}.`, `Cuire 11 min à 180°C.`] },
  { key: "verrine", emoji: "🍨", name: (f) => `Verrine gourmande ${f}`, base: [{ name: "Yaourt nature", qtyPerPerson: 100, unit: "g", aisle: "Crémerie & œufs", unitPrice: 0.004 }, { name: "Biscuits", qtyPerPerson: 30, unit: "g", aisle: "Épicerie sucrée", unitPrice: 0.008 }], allergens: ["lactose", "gluten"], equipment: [], tags: ["gourmand", "healthy"], time: 12, level: 1, local: false, vegan: false, steps: (f) => [`Émietter les biscuits.`, `Alterner yaourt et ${f}.`, `Réserver au frais.`] },
];

function buildDessert(): Recipe[] {
  const out: Recipe[] = [];
  for (const d of DESSERT_FORMATS) {
    for (const f of DFLAVORS) {
      const flavorIng: Ingredient = f.key === "chocolat"
        ? { name: "Chocolat", qtyPerPerson: 25, unit: "g", aisle: "Épicerie sucrée", unitPrice: 0.012 }
        : { name: cap(f.label), qtyPerPerson: 80, unit: "g", aisle: "Fruits & légumes", unitPrice: f.price / 100 + 0.004 };
      out.push({
        id: `gen-des-${d.key}-${f.key}`,
        name: d.name(f.label),
        cookName: nextCook(),
        emoji: d.emoji,
        moments: ["dessert", "gouter"],
        level: d.level,
        timeMin: d.time,
        equipment: d.equipment,
        isMeat: false,
        isFish: false,
        hasPork: false,
        isVegan: false,
        allergens: d.allergens,
        tags: d.tags,
        isLocal: d.local,
        isSeasonal: true,
        steps: d.steps(f.label),
        ingredients: [...d.base, flavorIng],
      });
    }
  }
  return out;
}

export const GENERATED_RECIPES: Recipe[] = [
  ...buildMains(),
  ...buildBreakfast(),
  ...buildApero(),
  ...buildAperoGeneric(),
  ...buildDessert(),
];
