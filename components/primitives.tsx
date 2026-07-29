"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// ---------------- HeartButton (like animé) ----------------
export function HeartButton({
  liked,
  onToggle,
  label = "Ajouter aux favoris",
  className = "",
}: {
  liked: boolean;
  onToggle: () => void;
  label?: string;
  className?: string;
}) {
  const [pop, setPop] = useState(false);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (liked) {
      setPop(true);
      const t = setTimeout(() => setPop(false), 360);
      return () => clearTimeout(t);
    }
  }, [liked]);

  return (
    <button
      type="button"
      aria-pressed={liked}
      aria-label={label}
      title={liked ? "Retirer des favoris" : "Ajouter aux favoris"}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={[
        "flex size-10 items-center justify-center rounded-full bg-white/95 text-lg shadow-md transition active:scale-90 hover:bg-white",
        pop ? "animate-pop" : "",
        className,
      ].join(" ")}
    >
      <span aria-hidden>{liked ? "❤️" : "🤍"}</span>
    </button>
  );
}

// ---------------- Chip (tappable) ----------------
export function Chip({
  label,
  emoji,
  selected,
  onClick,
}: {
  label: string;
  emoji?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold transition-all active:scale-95",
        selected
          ? "bg-sage text-white shadow-[var(--shadow-soft)]"
          : "bg-white text-anthracite border border-line hover:border-sage/40",
      ].join(" ")}
    >
      {emoji && <span aria-hidden>{emoji}</span>}
      {label}
    </button>
  );
}

// ---------------- Section (carte numérotée) ----------------
export function SectionCard({
  step,
  title,
  hint,
  children,
}: {
  step: number;
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[var(--radius-card)] bg-white p-5 shadow-[var(--shadow-soft)]">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sage-light text-sm font-extrabold text-sage">
          {step}
        </span>
        <div>
          <h2 className="text-lg leading-tight">{title}</h2>
          {hint && <p className="mt-0.5 text-sm text-anthracite/60">{hint}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

// ---------------- Toggle (interrupteur) ----------------
export function Toggle({
  label,
  emoji,
  checked,
  onChange,
}: {
  label: string;
  emoji?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-2xl border border-line bg-white px-4 py-3.5 text-left transition active:scale-[0.99]"
    >
      <span className="flex items-center gap-2 text-sm font-semibold">
        {emoji && <span aria-hidden>{emoji}</span>}
        {label}
      </span>
      <span
        className={[
          "relative h-7 w-12 rounded-full transition-colors",
          checked ? "bg-sage" : "bg-line",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-0.5 size-6 rounded-full bg-white shadow transition-all",
            checked ? "left-[22px]" : "left-0.5",
          ].join(" ")}
        />
      </span>
    </button>
  );
}

// ---------------- Stepper (+/-) ----------------
export function Stepper({
  value,
  min,
  max,
  onChange,
  suffix,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  const btn =
    "flex size-11 items-center justify-center rounded-full bg-sage-light text-xl font-extrabold text-sage transition active:scale-90 disabled:opacity-40";
  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        aria-label="Diminuer"
        className={btn}
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        −
      </button>
      <span className="min-w-16 text-center text-2xl font-extrabold tabular-nums">
        {value}
        {suffix && <span className="ml-1 text-sm font-semibold text-anthracite/60">{suffix}</span>}
      </span>
      <button
        type="button"
        aria-label="Augmenter"
        className={btn}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        +
      </button>
    </div>
  );
}

// ---------------- Slider budget ----------------
export function RangeSlider({
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="mb-2 flex items-end justify-between">
        <span className="text-3xl font-extrabold text-sage">{value} €</span>
        <span className="text-sm text-anthracite/60">
          {min} – {max} €
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full outline-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-terracotta [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-terracotta"
        style={{
          background: `linear-gradient(to right, var(--color-terracotta) ${pct}%, var(--color-line) ${pct}%)`,
        }}
      />
    </div>
  );
}

// ---------------- Segmented control (choix unique) ----------------
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string; hint?: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const selected = o.id === value;
        return (
          <button
            key={String(o.id)}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(o.id)}
            className={[
              "flex-1 rounded-2xl px-3 py-3 text-center transition active:scale-[0.98]",
              selected
                ? "bg-sage text-white shadow-[var(--shadow-soft)]"
                : "bg-white text-anthracite border border-line",
            ].join(" ")}
          >
            <span className="block text-sm font-bold">{o.label}</span>
            {o.hint && (
              <span
                className={[
                  "block text-xs",
                  selected ? "text-white/80" : "text-anthracite/50",
                ].join(" ")}
              >
                {o.hint}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ---------------- Badge ----------------
export function Badge({
  children,
  tone = "sage",
}: {
  children: ReactNode;
  tone?: "sage" | "honey" | "terracotta";
}) {
  const tones = {
    sage: "bg-sage-light text-sage",
    honey: "bg-[#fbecc9] text-[#9a6b13]",
    terracotta: "bg-[#fbe3da] text-terracotta-dark",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
