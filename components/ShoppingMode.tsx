"use client";

import { useEffect, useMemo, useState } from "react";
import { AISLE_ORDER } from "@/lib/constants";
import type { Aisle, ShoppingItem } from "@/lib/types";

// Wake Lock : garde l'écran allumé pendant les courses (si supporté).
function useWakeLock(active: boolean) {
  const [supported, setSupported] = useState(false);
  useEffect(() => {
    const nav = navigator as Navigator & {
      wakeLock?: { request: (t: "screen") => Promise<{ release: () => Promise<void> }> };
    };
    setSupported(!!nav.wakeLock);
    if (!active || !nav.wakeLock) return;
    let sentinel: { release: () => Promise<void> } | null = null;
    let released = false;
    const request = async () => {
      try {
        sentinel = await nav.wakeLock!.request("screen");
      } catch {
        /* ignoré */
      }
    };
    request();
    const onVisible = () => {
      if (document.visibilityState === "visible" && !released) request();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      released = true;
      document.removeEventListener("visibilitychange", onVisible);
      sentinel?.release().catch(() => {});
    };
  }, [active]);
  return supported;
}

export function ShoppingMode({
  grouped,
  total,
  onClose,
}: {
  grouped: Record<Aisle, ShoppingItem[]>;
  total: number;
  onClose: () => void;
}) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const wakeSupported = useWakeLock(true);

  const all = useMemo(
    () => AISLE_ORDER.flatMap(({ aisle }) => grouped[aisle] ?? []),
    [grouped],
  );
  const doneCount = Object.values(checked).filter(Boolean).length;
  const pct = all.length ? Math.round((doneCount / all.length) * 100) : 0;

  const toggle = (key: string) =>
    setChecked((c) => ({ ...c, [key]: !c[key] }));

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-cream">
      {/* En-tête : progression + fermer */}
      <div className="border-b border-line bg-white px-4 pb-3 pt-5">
        <div className="mx-auto flex max-w-xl items-center justify-between">
          <div>
            <h2 className="text-lg">Mode courses 🛒</h2>
            <p className="text-xs text-anthracite/55">
              {doneCount}/{all.length} articles
              {wakeSupported ? " · écran maintenu allumé 💡" : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-sage-light px-4 py-2 text-sm font-bold text-sage"
          >
            Terminer
          </button>
        </div>
        <div className="mx-auto mt-3 h-2 max-w-xl overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-sage transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Liste : ordre de parcours (frais → sec → surgelé) */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="mx-auto max-w-xl space-y-5">
          {AISLE_ORDER.map(({ aisle, emoji }) => {
            const items = grouped[aisle];
            if (!items || items.length === 0) return null;
            return (
              <div key={aisle}>
                <h3 className="mb-2 px-1 text-sm font-extrabold uppercase tracking-wide text-sage">
                  {emoji} {aisle}
                </h3>
                <ul className="space-y-2">
                  {items.map((item) => {
                    const key = `${aisle}-${item.name}`;
                    const isChecked = !!checked[key];
                    return (
                      <li key={key}>
                        <button
                          type="button"
                          onClick={() => toggle(key)}
                          className={[
                            "flex w-full items-center gap-4 rounded-2xl border-2 px-4 py-4 text-left transition active:scale-[0.99]",
                            isChecked
                              ? "border-sage bg-sage-light/50"
                              : "border-line bg-white",
                          ].join(" ")}
                        >
                          {/* Grosse case à cocher (tap au pouce) */}
                          <span
                            aria-hidden
                            className={[
                              "flex size-10 shrink-0 items-center justify-center rounded-xl border-2 text-2xl text-white transition",
                              isChecked ? "border-sage bg-sage" : "border-line bg-white",
                            ].join(" ")}
                          >
                            {isChecked ? "✓" : ""}
                          </span>
                          <span
                            className={[
                              "flex-1 text-lg font-bold",
                              isChecked ? "text-anthracite/40 line-through" : "",
                            ].join(" ")}
                          >
                            {item.name}
                          </span>
                          <span className="text-base font-semibold text-anthracite/60 tabular-nums">
                            {item.displayQty}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
          <div className="h-4" />
        </div>
      </div>

      {/* Pied : total */}
      <div className="border-t border-line bg-sage px-4 py-4 text-white">
        <div className="mx-auto flex max-w-xl items-center justify-between">
          <span className="font-bold">Total estimé</span>
          <span className="text-xl font-extrabold tabular-nums">
            ~{total.toFixed(2)} €
          </span>
        </div>
      </div>
    </div>
  );
}
