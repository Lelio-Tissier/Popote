"use client";

import { useState } from "react";
import { isVeg, type Recipe, type RecipeBreakdown } from "@/lib/types";
import { roundNutrition } from "@/lib/nutrition";
import { photoFor } from "@/lib/photos";
import { useFavorites } from "./FavoritesProvider";
import { Badge, HeartButton } from "./primitives";

const LEVEL_LABEL: Record<number, string> = {
  1: "Débutant",
  2: "Intermédiaire",
  3: "Chef",
};

function gradientFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360;
  const h2 = (h + 40) % 360;
  return `linear-gradient(135deg, hsl(${h} 45% 82%), hsl(${h2} 50% 70%))`;
}

// petit macro (dot coloré + valeur)
function Macro({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="flex flex-col items-center">
      <span className="flex items-center gap-1 text-sm font-extrabold tabular-nums">
        <span className="size-2 rounded-full" style={{ background: color }} aria-hidden />
        {value} g
      </span>
      <span className="text-[11px] font-semibold text-anthracite/50">{label}</span>
    </div>
  );
}

export function RecipeCard({
  recipe,
  breakdown,
  people,
  bio,
  onReplace,
}: {
  recipe: Recipe;
  breakdown: RecipeBreakdown;
  people: number;
  bio: boolean;
  onReplace?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [imgOk, setImgOk] = useState(false);
  const { isLiked, toggleLike } = useFavorites();
  const n = roundNutrition(breakdown.nutritionPerPortion);
  const photo = photoFor(recipe);

  return (
    <article className="overflow-hidden rounded-[var(--radius-card)] bg-white shadow-[var(--shadow-card)]">
      {/* Photo / dégradé (le dégradé + emoji sert de repli tant que la photo charge) */}
      <div
        className="relative flex h-44 items-center justify-center overflow-hidden"
        style={{ backgroundImage: gradientFor(recipe.id) }}
      >
        <span
          className={`text-6xl drop-shadow-sm transition-opacity duration-300 ${imgOk ? "opacity-0" : "opacity-100"}`}
          aria-hidden
        >
          {recipe.emoji}
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo}
          alt={recipe.name}
          loading="lazy"
          onLoad={() => setImgOk(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${imgOk ? "opacity-100" : "opacity-0"}`}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 to-transparent" />
        <HeartButton
          liked={isLiked(recipe.id)}
          onToggle={() => toggleLike(recipe.id)}
          className="absolute left-3 top-3"
        />
        {onReplace && (
          <button
            type="button"
            onClick={onReplace}
            aria-label="Remplacer cette recette"
            title="Remplacer"
            className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-full bg-white/95 text-lg shadow-md transition active:scale-90 hover:bg-white"
          >
            🔁
          </button>
        )}
        <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-sm font-extrabold text-terracotta-dark shadow-sm">
          ~{breakdown.pricePerPortion.toFixed(2)} €/pers
        </span>
        <span className="absolute bottom-3 right-3 rounded-full bg-sage/90 px-3 py-1 text-sm font-extrabold text-white shadow-sm">
          🔥 {n.kcal} kcal
        </span>
      </div>

      {/* Contenu */}
      <div className="p-4">
        <h3 className="text-lg leading-tight">{recipe.name}</h3>
        <p className="mt-1 text-sm italic text-anthracite/60">
          la recette de {recipe.cookName}
        </p>

        <div className="mt-3 flex items-center gap-4 text-sm font-semibold text-anthracite/70">
          <span>⏱️ {recipe.timeMin} min</span>
          <span>🎚️ {LEVEL_LABEL[recipe.level]}</span>
        </div>

        {/* Macros par portion (façon Yazio) */}
        <div className="mt-3 flex items-center justify-around rounded-2xl bg-cream py-2.5">
          <Macro color="#3B624A" label="Protéines" value={n.protein} />
          <Macro color="#E8A838" label="Glucides" value={n.carbs} />
          <Macro color="#D95D39" label="Lipides" value={n.fat} />
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {bio && <Badge tone="honey">🌱 Bio</Badge>}
          {recipe.isLocal && <Badge tone="sage">🇫🇷 Local</Badge>}
          {isVeg(recipe) && <Badge tone="sage">🥦 Végé</Badge>}
          {recipe.timeMin <= 30 && <Badge tone="terracotta">⚡ Rapide</Badge>}
        </div>

        {/* Détail prix & nutrition */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="mt-3 flex w-full items-center justify-between rounded-xl bg-sage-light/60 px-3 py-2.5 text-sm font-bold text-sage transition active:scale-[0.99]"
        >
          {open ? "Masquer le détail" : "Détail prix & nutrition"}
          <span aria-hidden>{open ? "▲" : "▼"}</span>
        </button>

        {open && (
          <div className="mt-2 rounded-xl border border-line p-3">
            {/* Prix par produit */}
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-anthracite/45">
              Ingrédients ({people} pers.)
            </p>
            <ul className="divide-y divide-line">
              {breakdown.items.map((it) => (
                <li key={it.name} className="flex items-center justify-between py-1.5 text-sm">
                  <span className="text-anthracite/80">{it.name}</span>
                  <span className="flex items-center gap-2">
                    <span className="text-anthracite/45 tabular-nums">{it.displayQty}</span>
                    <span className="w-14 text-right font-semibold tabular-nums">
                      {it.price.toFixed(2)} €
                    </span>
                  </span>
                </li>
              ))}
            </ul>

            {/* Prix par plat / portion */}
            <div className="mt-2 space-y-1 rounded-lg bg-cream px-3 py-2 text-sm">
              <div className="flex justify-between font-bold">
                <span>Prix du plat ({people} pers.)</span>
                <span className="tabular-nums">{breakdown.pricePerDish.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-anthracite/70">
                <span>Prix par personne</span>
                <span className="tabular-nums">{breakdown.pricePerPortion.toFixed(2)} €</span>
              </div>
            </div>

            {/* Nutrition par portion */}
            <p className="mb-1 mt-3 text-xs font-bold uppercase tracking-wide text-anthracite/45">
              Nutrition par portion
            </p>
            <div className="grid grid-cols-4 gap-1 text-center">
              {[
                { label: "kcal", value: n.kcal, tone: "text-anthracite" },
                { label: "Prot.", value: `${n.protein} g`, tone: "text-sage" },
                { label: "Gluc.", value: `${n.carbs} g`, tone: "text-[#9a6b13]" },
                { label: "Lip.", value: `${n.fat} g`, tone: "text-terracotta-dark" },
              ].map((m) => (
                <div key={m.label} className="rounded-lg bg-white py-1.5 shadow-[var(--shadow-soft)]">
                  <div className={`text-base font-extrabold tabular-nums ${m.tone}`}>{m.value}</div>
                  <div className="text-[11px] font-semibold text-anthracite/45">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
