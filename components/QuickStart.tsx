"use client";

import { useState } from "react";
import { RangeSlider, Stepper } from "./primitives";

export function QuickStart({
  initialPeople,
  initialBudget,
  onGenerate,
  onRefine,
}: {
  initialPeople: number;
  initialBudget: number;
  onGenerate: (people: number, budget: number) => void;
  onRefine: (people: number, budget: number) => void;
}) {
  const [people, setPeople] = useState(initialPeople);
  const [budget, setBudget] = useState(initialBudget);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-4 pb-28 pt-10">
      <header className="mb-8 text-center">
        <div className="text-5xl">🍲</div>
        <h1 className="mt-3 text-4xl text-sage">Bousti</h1>
        <p className="mx-auto mt-2 max-w-xs text-anthracite/60">
          Ton menu maison + ta liste de courses, dans ton budget. Deux réponses
          suffisent pour commencer.
        </p>
      </header>

      <div className="space-y-4">
        <section className="rounded-[var(--radius-card)] bg-white p-6 text-center shadow-[var(--shadow-soft)]">
          <h2 className="mb-4 text-lg">Pour combien de personnes ? 👥</h2>
          <div className="flex justify-center">
            <Stepper value={people} min={1} max={10} onChange={setPeople} />
          </div>
        </section>

        <section className="rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-soft)]">
          <h2 className="mb-4 text-center text-lg">Quel budget ? 💶</h2>
          <RangeSlider value={budget} min={15} max={150} onChange={setBudget} />
        </section>
      </div>

      <p className="mt-6 text-center text-sm text-anthracite/45">
        Allergies, régime, magasin favori… tu pourras affiner ensuite.
      </p>

      {/* CTA fixe */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-cream/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto max-w-xl space-y-2">
          <button
            type="button"
            onClick={() => onGenerate(people, budget)}
            className="w-full rounded-full bg-terracotta py-4 text-base font-extrabold text-white shadow-[var(--shadow-cta)] transition active:scale-[0.98] hover:bg-terracotta-dark"
          >
            Voir mon menu maintenant 🍲
          </button>
          <button
            type="button"
            onClick={() => onRefine(people, budget)}
            className="w-full rounded-full py-2 text-sm font-bold text-sage underline-offset-2 hover:underline"
          >
            Affiner mes préférences d'abord
          </button>
        </div>
      </div>
    </div>
  );
}
