"use client";

import * as React from "react";
import type { GoogleFontItem } from "@/app/api/fonts/route";

export type GoogleFontsState = {
  fonts: GoogleFontItem[];
  loading: boolean;
  error?: string;
};

const LS_KEY = "gf:catalog:v1";
const TTL_MS = 24 * 60 * 60 * 1000; // 24h

type Cached = { fonts: GoogleFontItem[]; ts: number };
function isCached(x: unknown): x is Cached {
  if (typeof x !== "object" || x === null) return false;
  const obj = x as { fonts?: unknown; ts?: unknown };
  return Array.isArray(obj.fonts) && typeof obj.ts === "number";
}

function parseWeights(variants: GoogleFontItem["variants"]): number[] {
  const weights = new Set<number>();
  for (const v of variants) {
    if (v === "regular") weights.add(400);
    else {
      const m = /^(\d{3})(italic)?$/.exec(v);
      if (m) weights.add(Number(m[1]));
    }
  }
  return Array.from(weights).sort((a, b) => a - b);
}

export function useGoogleFonts(
  sort: "popularity" | "alpha" | "date" | "style" | "trending" = "popularity"
): GoogleFontsState & { getWeightsFor: (family: string) => number[] } {
  const [state, setState] = React.useState<GoogleFontsState>({
    fonts: [],
    loading: true,
  });

  React.useEffect(() => {
    let cancelled = false;

    // 1) Try cache
    let cacheUsed = false;
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(LS_KEY);
        if (raw) {
          const parsed: unknown = JSON.parse(raw);
          if (isCached(parsed)) {
            const fresh = Date.now() - parsed.ts < TTL_MS;
            if (fresh && parsed.fonts.length > 0) {
              setState({ fonts: parsed.fonts, loading: false });
              cacheUsed = true; // ✅ skip network; we’re fresh
            } else {
              // stale -> show cached immediately but refresh in background
              setState({ fonts: parsed.fonts, loading: true });
            }
          }
        }
      } catch {
        // ignore bad cache
      }
    }

    // 2) Fetch only if no fresh cache
    if (cacheUsed) return;

    (async () => {
      try {
        const res = await fetch(`/api/fonts?sort=${sort}`, {
          cache: "force-cache",
        });
        if (!res.ok) throw new Error(String(res.status));
        const data: unknown = await res.json();
        const items = (data as { items?: unknown }).items;
        if (!Array.isArray(items)) throw new Error("Invalid payload");

        const fonts: GoogleFontItem[] = items.map((f) => ({
          family: String((f as { family: unknown }).family),
          variants: (Array.isArray((f as { variants: unknown }).variants)
            ? (f as { variants: string[] }).variants
            : []) as GoogleFontItem["variants"],
          category: ((): GoogleFontItem["category"] => {
            const cat = String((f as { category: unknown }).category);
            return (
              [
                "serif",
                "sans-serif",
                "monospace",
                "display",
                "handwriting",
              ] as const
            ).includes(cat as never)
              ? (cat as GoogleFontItem["category"])
              : "sans-serif";
          })(),
        }));

        if (cancelled) return;
        setState({ fonts, loading: false });
        if (typeof window !== "undefined") {
          const cached: Cached = { fonts, ts: Date.now() };
          localStorage.setItem(LS_KEY, JSON.stringify(cached));
        }
      } catch {
        if (!cancelled)
          setState((s) => ({ ...s, loading: false, error: "fetch_failed" }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sort]);

  const getWeightsFor = React.useCallback(
    (family: string) => {
      const it = state.fonts.find((f) => f.family === family);
      return it ? parseWeights(it.variants) : [400, 700];
    },
    [state.fonts]
  );

  return { ...state, getWeightsFor };
}
