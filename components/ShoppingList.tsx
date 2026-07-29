"use client";

import { useState } from "react";
import { AISLE_ORDER } from "@/lib/constants";
import type { Aisle, ShoppingItem } from "@/lib/types";

export function ShoppingList({
  grouped,
  total,
}: {
  grouped: Record<Aisle, ShoppingItem[]>;
  total: number;
}) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const toggle = (key: string) =>
    setChecked((c) => ({ ...c, [key]: !c[key] }));

  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] bg-white shadow-[var(--shadow-card)]">
      {AISLE_ORDER.map(({ aisle, emoji }) => {
        const items = grouped[aisle];
        if (!items || items.length === 0) return null;
        return (
          <div key={aisle} className="border-b border-line last:border-b-0">
            <div className="bg-sage-light/60 px-4 py-2.5">
              <h3 className="text-sm font-extrabold text-sage">
                <span aria-hidden className="mr-1.5">
                  {emoji}
                </span>
                {aisle}
              </h3>
            </div>
            <ul>
              {items.map((item) => {
                const key = `${aisle}-${item.name}`;
                const isChecked = !!checked[key];
                return (
                  <li key={key}>
                    <button
                      type="button"
                      onClick={() => toggle(key)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-cream/60"
                    >
                      <span
                        aria-hidden
                        className={[
                          "flex size-6 shrink-0 items-center justify-center rounded-md border-2 text-xs text-white transition",
                          isChecked
                            ? "border-sage bg-sage"
                            : "border-line bg-white",
                        ].join(" ")}
                      >
                        {isChecked ? "✓" : ""}
                      </span>
                      <span
                        className={[
                          "flex-1 text-sm font-semibold",
                          isChecked ? "text-anthracite/40 line-through" : "",
                        ].join(" ")}
                      >
                        {item.name}
                      </span>
                      <span className="text-sm text-anthracite/60 tabular-nums">
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
      <div className="flex items-center justify-between bg-sage px-4 py-4 text-white">
        <span className="font-bold">Total estimé</span>
        <span className="text-xl font-extrabold tabular-nums">
          ~{total.toFixed(2)} €
        </span>
      </div>
    </div>
  );
}
