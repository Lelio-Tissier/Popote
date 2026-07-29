"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  loadBaskets,
  loadLikes,
  newId,
  persistBaskets,
  persistLikes,
  type Likes,
  type SavedBasket,
} from "@/lib/favorites";

interface FavoritesContextValue {
  likes: Likes;
  likedIds: string[];
  isLiked: (id: string) => boolean;
  toggleLike: (id: string) => void;
  baskets: SavedBasket[];
  saveBasket: (b: Omit<SavedBasket, "id" | "date" | "isFavorite">) => SavedBasket;
  deleteBasket: (id: string) => void;
  renameBasket: (id: string, name: string) => void;
  toggleBasketFavorite: (id: string) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [likes, setLikes] = useState<Likes>({});
  const [baskets, setBaskets] = useState<SavedBasket[]>([]);
  const [ready, setReady] = useState(false);

  // hydratation depuis localStorage au montage (client only)
  useEffect(() => {
    setLikes(loadLikes());
    setBaskets(loadBaskets());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) persistLikes(likes);
  }, [likes, ready]);
  useEffect(() => {
    if (ready) persistBaskets(baskets);
  }, [baskets, ready]);

  const toggleLike = useCallback((id: string) => {
    setLikes((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = Date.now();
      return next;
    });
  }, []);

  const saveBasket = useCallback(
    (b: Omit<SavedBasket, "id" | "date" | "isFavorite">) => {
      const basket: SavedBasket = {
        ...b,
        id: newId(),
        date: Date.now(),
        isFavorite: false,
      };
      setBaskets((prev) => [basket, ...prev]);
      return basket;
    },
    [],
  );

  const deleteBasket = useCallback((id: string) => {
    setBaskets((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const renameBasket = useCallback((id: string, name: string) => {
    setBaskets((prev) => prev.map((x) => (x.id === id ? { ...x, name } : x)));
  }, []);

  const toggleBasketFavorite = useCallback((id: string) => {
    setBaskets((prev) =>
      prev.map((x) => (x.id === id ? { ...x, isFavorite: !x.isFavorite } : x)),
    );
  }, []);

  const value = useMemo<FavoritesContextValue>(
    () => ({
      likes,
      likedIds: Object.keys(likes),
      isLiked: (id) => !!likes[id],
      toggleLike,
      baskets,
      saveBasket,
      deleteBasket,
      renameBasket,
      toggleBasketFavorite,
    }),
    [likes, baskets, toggleLike, saveBasket, deleteBasket, renameBasket, toggleBasketFavorite],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
