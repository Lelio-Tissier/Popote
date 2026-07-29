"use client";

import { useState } from "react";
import {
  ALLERGENS,
  DIETS,
  ENVIES,
  EQUIPMENT,
  LEVELS,
  MOMENTS,
  STORES,
  TIMES,
} from "@/lib/constants";
import type {
  Allergen,
  Diet,
  Envie,
  Equipment,
  Level,
  Moment,
  Preferences,
  TimeBudget,
} from "@/lib/types";
import {
  Chip,
  RangeSlider,
  SectionCard,
  Segmented,
  Stepper,
  Toggle,
} from "./primitives";

// petite aide : bascule une valeur dans un tableau (multi-sélection)
function toggleIn<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

export function Onboarding({
  initial,
  onSubmit,
}: {
  initial: Preferences;
  onSubmit: (prefs: Preferences) => void;
}) {
  const [p, setP] = useState<Preferences>(initial);
  const set = <K extends keyof Preferences>(key: K, value: Preferences[K]) =>
    setP((prev) => ({ ...prev, [key]: value }));

  const canSubmit = p.moments.length > 0 && p.equipment.length > 0;

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-32 pt-6">
      {/* En-tête marque */}
      <header className="mb-6 text-center">
        <div className="text-4xl">🍲</div>
        <h1 className="mt-2 text-3xl text-sage">Bousti</h1>
        <p className="mx-auto mt-1 max-w-xs text-sm text-anthracite/60">
          Ton menu maison et ta liste de courses, calés sur ton budget. Gratuit,
          anti-gaspi, Bio & local.
        </p>
      </header>

      <div className="space-y-4">
        {/* 1. Moments */}
        <SectionCard step={1} title="Quels moments ?" hint="Choisis un ou plusieurs">
          <div className="flex flex-wrap gap-2">
            {MOMENTS.map((m) => (
              <Chip
                key={m.id}
                label={m.label}
                emoji={m.emoji}
                selected={p.moments.includes(m.id)}
                onClick={() => set("moments", toggleIn<Moment>(p.moments, m.id))}
              />
            ))}
          </div>
        </SectionCard>

        {/* 2. Personnes & recettes */}
        <SectionCard step={2} title="Combien de couverts ?">
          <div className="flex flex-col gap-5 sm:flex-row sm:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold text-anthracite/70">
                Personnes
              </p>
              <Stepper
                value={p.people}
                min={1}
                max={10}
                onChange={(v) => set("people", v)}
              />
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-anthracite/70">
                Recettes
              </p>
              <Stepper
                value={p.recipeCount}
                min={1}
                max={10}
                onChange={(v) => set("recipeCount", v)}
              />
            </div>
          </div>
        </SectionCard>

        {/* 3. Magasin & budget */}
        <SectionCard step={3} title="Ton magasin & ton budget">
          <div className="mb-5 flex flex-wrap gap-2">
            {STORES.map((s) => (
              <Chip
                key={s.id}
                label={s.name}
                emoji={s.emoji}
                selected={p.store === s.id}
                onClick={() => set("store", s.id)}
              />
            ))}
          </div>
          <RangeSlider
            value={p.budget}
            min={15}
            max={150}
            onChange={(v) => set("budget", v)}
          />
        </SectionCard>

        {/* 4. Niveau, temps, matériel */}
        <SectionCard step={4} title="Ton style en cuisine">
          <p className="mb-2 text-sm font-semibold text-anthracite/70">Niveau</p>
          <Segmented<Level>
            options={LEVELS}
            value={p.level}
            onChange={(v) => set("level", v)}
          />
          <p className="mb-2 mt-5 text-sm font-semibold text-anthracite/70">
            Temps dispo
          </p>
          <Segmented<TimeBudget>
            options={TIMES}
            value={p.time}
            onChange={(v) => set("time", v)}
          />
          <p className="mb-2 mt-5 text-sm font-semibold text-anthracite/70">
            Matériel possédé
          </p>
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT.map((e) => (
              <Chip
                key={e.id}
                label={e.label}
                emoji={e.emoji}
                selected={p.equipment.includes(e.id)}
                onClick={() =>
                  set("equipment", toggleIn<Equipment>(p.equipment, e.id))
                }
              />
            ))}
          </div>
        </SectionCard>

        {/* 5. Régime, allergies, envies */}
        <SectionCard step={5} title="Régime & envies">
          <p className="mb-2 text-sm font-semibold text-anthracite/70">Régime</p>
          <div className="mb-5 flex flex-wrap gap-2">
            {DIETS.map((d) => (
              <Chip
                key={d.id}
                label={d.label}
                selected={p.diet === d.id}
                onClick={() => set("diet", d.id as Diet)}
              />
            ))}
          </div>
          <p className="mb-2 text-sm font-semibold text-anthracite/70">
            Allergies
          </p>
          <div className="mb-5 flex flex-wrap gap-2">
            {ALLERGENS.map((a) => (
              <Chip
                key={a.id}
                label={a.label}
                selected={p.allergies.includes(a.id)}
                onClick={() =>
                  set("allergies", toggleIn<Allergen>(p.allergies, a.id))
                }
              />
            ))}
          </div>
          <p className="mb-2 text-sm font-semibold text-anthracite/70">
            Envies <span className="font-normal text-anthracite/40">(optionnel)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {ENVIES.map((e) => (
              <Chip
                key={e.id}
                label={e.label}
                emoji={e.emoji}
                selected={p.envies.includes(e.id)}
                onClick={() => set("envies", toggleIn<Envie>(p.envies, e.id))}
              />
            ))}
          </div>
        </SectionCard>

        {/* 6. Interrupteurs */}
        <SectionCard step={6} title="Tes priorités">
          <div className="space-y-2.5">
            <Toggle
              label="Priorité au Bio"
              emoji="🌱"
              checked={p.bio}
              onChange={(v) => set("bio", v)}
            />
            <Toggle
              label="Made in France & local (de saison)"
              emoji="🇫🇷"
              checked={p.local}
              onChange={(v) => set("local", v)}
            />
            <Toggle
              label="Anti-gaspi"
              emoji="♻️"
              checked={p.antiGaspi}
              onChange={(v) => set("antiGaspi", v)}
            />
          </div>
        </SectionCard>
      </div>

      {/* CTA fixe */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-cream/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto max-w-xl">
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => onSubmit(p)}
            className="w-full rounded-full bg-terracotta py-4 text-base font-extrabold text-white shadow-[var(--shadow-cta)] transition active:scale-[0.98] hover:bg-terracotta-dark disabled:opacity-40 disabled:shadow-none"
          >
            Générer mon menu 🍲
          </button>
          {!canSubmit && (
            <p className="mt-2 text-center text-xs text-anthracite/50">
              Choisis au moins un moment et un matériel.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
