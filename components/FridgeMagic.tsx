"use client";

import { useState } from "react";
import { matchFridge, type FridgeMatch } from "@/lib/fridge";
import { photoFor } from "@/lib/photos";

const EXAMPLES = ["2 œufs, un reste de riz, 1 courgette", "poulet, tomate, pâtes", "pois chiches, épinards, citron"];

function MatchCard({ m }: { m: FridgeMatch }) {
  const [imgOk, setImgOk] = useState(false);
  const r = m.recipe;
  return (
    <article className="overflow-hidden rounded-[var(--radius-card)] bg-white shadow-[var(--shadow-card)]">
      <div className="relative flex h-40 items-center justify-center overflow-hidden bg-sage-light">
        <span className={`text-6xl transition-opacity ${imgOk ? "opacity-0" : "opacity-100"}`} aria-hidden>
          {r.emoji}
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoFor(r)}
          alt={r.name}
          loading="lazy"
          onLoad={() => setImgOk(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${imgOk ? "opacity-100" : "opacity-0"}`}
        />
        <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-sm font-extrabold text-sage shadow-sm">
          {Math.round(m.coverage * 100)}% avec ton frigo
        </span>
      </div>
      <div className="p-4">
        <h3 className="text-lg leading-tight">{r.name}</h3>
        <p className="mt-1 text-sm italic text-anthracite/60">la recette de {r.cookName}</p>
        <p className="mt-2 text-sm">
          <span className="font-bold text-sage">Tu as déjà :</span> {m.have.join(", ")}
        </p>
        {m.missing.length > 0 && (
          <p className="mt-1 text-sm text-anthracite/70">
            <span className="font-bold text-terracotta-dark">À compléter :</span> {m.missing.join(", ")}
          </p>
        )}
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-anthracite/80">
          {r.steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </div>
    </article>
  );
}

export function FridgeMagic({ onClose }: { onClose: () => void }) {
  const [text, setText] = useState("");
  const [results, setResults] = useState<FridgeMatch[] | null>(null);

  const run = (t: string) => {
    setText(t);
    setResults(matchFridge(t));
  };

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-24 pt-6">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl">Frigo magique 🪄</h1>
          <p className="mt-1 text-sm text-anthracite/60">
            La flemme de suivre le menu ? Dis-moi ce qu'il te reste.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-sage-light px-4 py-2 text-sm font-bold text-sage"
        >
          Retour
        </button>
      </header>

      <div className="rounded-[var(--radius-card)] bg-white p-4 shadow-[var(--shadow-soft)]">
        <label htmlFor="pantry" className="text-sm font-semibold text-anthracite/70">
          Ce qu'il te reste
        </label>
        <textarea
          id="pantry"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="ex. 2 œufs, un reste de riz, 1 courgette"
          rows={3}
          className="mt-2 w-full resize-none rounded-2xl border border-line bg-cream/40 p-3 text-base outline-none focus:border-sage/50"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => run(ex)}
              className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-anthracite/70"
            >
              {ex}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => run(text)}
          disabled={text.trim().length < 2}
          className="mt-3 w-full rounded-full bg-terracotta py-3.5 font-extrabold text-white shadow-[var(--shadow-cta)] transition active:scale-[0.98] hover:bg-terracotta-dark disabled:opacity-40 disabled:shadow-none"
        >
          Trouve-moi une recette 🍳
        </button>
      </div>

      {results && (
        <div className="mt-5 space-y-4">
          {results.length === 0 ? (
            <p className="rounded-2xl bg-white p-5 text-sm text-anthracite/60 shadow-[var(--shadow-soft)]">
              Rien trouvé avec ça. Ajoute un ingrédient ou deux (un féculent, une
              protéine, un légume).
            </p>
          ) : (
            results.map((m) => <MatchCard key={m.recipe.id} m={m} />)
          )}
        </div>
      )}
    </div>
  );
}
