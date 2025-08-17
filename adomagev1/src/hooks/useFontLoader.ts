// src/hooks/useFontLoader.ts
"use client";

import { useEffect, useMemo, useState } from "react";

export type FontLoadStatus = "idle" | "loading" | "active" | "inactive";

/** Encode a family for CSS2 (spaces -> +, rest URL-encoded). */
function encodeFamily(family: string): string {
  return encodeURIComponent(family.trim()).replace(/%20/g, "+");
}

/** Build a css2 href like:
 * https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap
 */
function buildCss2Href(family: string, weights: number[]): string {
  const uniq = Array.from(new Set(weights)).filter((w) => Number.isFinite(w));
  uniq.sort((a, b) => a - b);

  const famToken = encodeFamily(family);
  const wght = uniq.length ? `:wght@${uniq.join(";")}` : "";
  return `https://fonts.googleapis.com/css2?family=${famToken}${wght}&display=swap`;
}

/** Type guard: does this Document expose the CSS Font Loading API? */
function hasFontLoadingAPI(
  doc: Document
): doc is Document & { fonts: FontFaceSet } {
  return "fonts" in doc;
}

export function useFontLoader(
  family?: string,
  weights: number[] = []
): FontLoadStatus {
  const [status, setStatus] = useState<FontLoadStatus>("idle");

  const href = useMemo(() => {
    if (!family) return "";
    return buildCss2Href(family, weights);
  }, [family, weights]);

  useEffect(() => {
    if (!family) {
      setStatus("idle");
      return;
    }

    // No DOM (SSR) or very old browser?
    if (typeof document === "undefined" || !hasFontLoadingAPI(document)) {
      // Best-effort: inject stylesheet and assume active.
      const attr = "data-gf-href";
      let link =
        typeof document !== "undefined"
          ? document.head.querySelector<HTMLLinkElement>(
              `link[rel="stylesheet"][${attr}="${href}"]`
            )
          : null;

      if (!link && typeof document !== "undefined") {
        link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        link.setAttribute(attr, href);
        document.head.appendChild(link);
      }

      setStatus("active");
      return;
    }

    setStatus("loading");

    // Inject the stylesheet once per unique href
    const attr = "data-gf-href";
    let link = document.head.querySelector<HTMLLinkElement>(
      `link[rel="stylesheet"][${attr}="${href}"]`
    );
    if (!link) {
      link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.setAttribute(attr, href);
      document.head.appendChild(link);
    }

    const fonts = document.fonts; // FontFaceSet
    let cancelled = false;
    const weight = (weights[0] ?? 400) | 0;

    // CSS Font Loading API shorthand: "<weight> 1em <family>"
    const fontShorthand = `${weight} 1em "${family}"`;

    // Failsafe timeout in case the network is super slow
    const timeoutId: number = window.setTimeout(() => {
      if (!cancelled) setStatus("inactive");
    }, 4000);

    // Kick off the load and wait for the ready-settle
    void fonts.load(fontShorthand);
    fonts.ready
      .then(() => {
        if (cancelled) return;
        const ok = fonts.check(fontShorthand);
        setStatus(ok ? "active" : "inactive");
        window.clearTimeout(timeoutId);
      })
      .catch(() => {
        if (!cancelled) setStatus("inactive");
        window.clearTimeout(timeoutId);
      });

    return () => {
      cancelled = true;
    };
  }, [family, href, weights]);

  return status;
}
