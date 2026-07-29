import type { Aisle, ShoppingItem } from "./types";

// ============================================================
// Bousti — Persistance des favoris (localStorage).
// Types + helpers purs. Le state réactif vit dans
// components/FavoritesProvider.tsx. Migrable vers Supabase.
// ============================================================

const LIKES_KEY = "bousti.likes.v1";
const BASKETS_KEY = "bousti.baskets.v1";

/** id de recette -> timestamp du like */
export type Likes = Record<string, number>;

export interface SavedBasket {
  id: string;
  name: string;
  date: number; // timestamp de création
  recipeIds: string[];
  people: number;
  storeId: string;
  budget: number;
  totalCost: number;
  itemCount: number;
  shopping: Record<Aisle, ShoppingItem[]>;
  isFavorite: boolean;
}

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeWrite(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / mode privé : on ignore */
  }
}

export const loadLikes = (): Likes => safeRead<Likes>(LIKES_KEY, {});
export const persistLikes = (l: Likes): void => safeWrite(LIKES_KEY, l);

export const loadBaskets = (): SavedBasket[] =>
  safeRead<SavedBasket[]>(BASKETS_KEY, []);
export const persistBaskets = (b: SavedBasket[]): void =>
  safeWrite(BASKETS_KEY, b);

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
