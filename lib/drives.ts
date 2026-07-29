import { AISLE_ORDER } from "./constants";
import type { Aisle, ShoppingItem } from "./types";

// ============================================================
// Popote — Drives des enseignes.
// ⚠️ Aucune enseigne n'expose d'API publique pour remplir le
// panier : "connexion Drive" = envoi ASSISTÉ (on copie la liste
// et on ouvre le Drive du magasin). L'intégration automatique
// nécessiterait un partenariat commercial (comme Jow).
// ============================================================

export interface Drive {
  id: string;
  name: string;
  emoji: string;
  url: string; // page Drive / courses en ligne de l'enseigne
  /** Construit une URL de recherche produit (best-effort). */
  search?: (term: string) => string;
}

export const DRIVES: Drive[] = [
  {
    id: "leclerc",
    name: "E.Leclerc Drive",
    emoji: "🟡",
    url: "https://www.leclercdrive.fr",
  },
  {
    id: "carrefour",
    name: "Carrefour Drive",
    emoji: "🔵",
    url: "https://www.carrefour.fr/drive",
    search: (t) => `https://www.carrefour.fr/s?q=${encodeURIComponent(t)}`,
  },
  {
    id: "intermarche",
    name: "Intermarché Drive",
    emoji: "🔴",
    url: "https://www.intermarche.com/drive",
  },
  {
    id: "auchan",
    name: "Auchan Drive",
    emoji: "🟢",
    url: "https://www.auchan.fr/drive",
    search: (t) => `https://www.auchan.fr/recherche?text=${encodeURIComponent(t)}`,
  },
  {
    id: "chronodrive",
    name: "Chronodrive",
    emoji: "🟠",
    url: "https://www.chronodrive.com",
  },
  {
    id: "coursesu",
    name: "Courses U (Système U)",
    emoji: "🟣",
    url: "https://www.coursesu.com",
  },
  {
    id: "monoprix",
    name: "Monoprix Courses",
    emoji: "⚫",
    url: "https://courses.monoprix.fr",
  },
  {
    id: "cora",
    name: "Cora Drive",
    emoji: "🔵",
    url: "https://www.coradrive.fr",
  },
  {
    id: "lidl",
    name: "Lidl (retrait)",
    emoji: "🟦",
    url: "https://www.lidl.fr",
  },
  {
    id: "biocoop",
    name: "Biocoop Drive",
    emoji: "🌱",
    url: "https://www.biocoop.fr",
  },
];

/** Texte de la liste de courses, groupé par rayon (pour copier/coller). */
export function shoppingListText(grouped: Record<Aisle, ShoppingItem[]>): string {
  const lines = ["🍲 Ma liste de courses Popote", ""];
  for (const { aisle, emoji } of AISLE_ORDER) {
    const items = grouped[aisle];
    if (!items || items.length === 0) continue;
    lines.push(`${emoji} ${aisle}`);
    for (const it of items) lines.push(`- ${it.name} (${it.displayQty})`);
    lines.push("");
  }
  return lines.join("\n");
}

/** Liste à plat des noms d'articles (pour recherche produit). */
export function shoppingItemNames(
  grouped: Record<Aisle, ShoppingItem[]>,
): string[] {
  return AISLE_ORDER.flatMap(({ aisle }) =>
    (grouped[aisle] ?? []).map((it) => it.name),
  );
}

// ---------------- DriveService (abstraction) ----------------

export type MatchStatus = "matched" | "manual";

export interface DriveProduct {
  name: string; // libellé ingrédient Popote
  displayQty: string; // quantité (ex. "400 g")
  estimatedPrice: number; // prix estimé (calcul Popote)
  query: string; // requête de recherche chez l'enseigne
  status: MatchStatus; // matched auto / à valider manuellement
}

/**
 * Matching ingrédient -> "produit" enseigne.
 * NB : sans API catalogue officielle, on ne peut pas résoudre une vraie
 * référence produit. On prépare donc une requête de recherche + le prix
 * estimé Popote. Le jour d'un partenariat/API, `resolveRef()` remplacera
 * ce heuristique par une vraie correspondance SKU.
 */
export function matchProducts(
  grouped: Record<Aisle, ShoppingItem[]>,
): DriveProduct[] {
  const out: DriveProduct[] = [];
  for (const { aisle } of AISLE_ORDER) {
    for (const it of grouped[aisle] ?? []) {
      out.push({
        name: it.name,
        displayQty: it.displayQty,
        estimatedPrice: it.price,
        query: it.name,
        status: "matched",
      });
    }
  }
  return out;
}

export function getDrive(id: string): Drive | undefined {
  return DRIVES.find((d) => d.id === id);
}

export function searchUrlFor(drive: Drive, query: string): string {
  return drive.search ? drive.search(query) : drive.url;
}
