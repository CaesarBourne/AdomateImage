import { NextResponse } from "next/server";

export type GoogleFontsVariant =
  | "regular"
  | "italic"
  | `${number}`
  | `${number}italic`;
export type GoogleFontItem = {
  family: string;
  variants: GoogleFontsVariant[];
  category: "serif" | "sans-serif" | "monospace" | "display" | "handwriting";
};

type GoogleFontsApiResponse = {
  items: Array<{
    family: string;
    variants: string[];
    category: string;
  }>;
};

function isGoogleFontsApiResponse(x: unknown): x is GoogleFontsApiResponse {
  if (typeof x !== "object" || x === null) return false;
  const items = (x as { items?: unknown }).items;
  if (!Array.isArray(items)) return false;
  return items.every((it) => {
    return (
      typeof it?.family === "string" &&
      Array.isArray((it as { variants: unknown }).variants) &&
      typeof (it as { category: unknown }).category === "string"
    );
  });
}

export const revalidate = 60 * 60 * 24; // 24h

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sort = searchParams.get("sort") ?? "popularity";

  const key = process.env.GOOGLE_FONTS_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "Missing GOOGLE_FONTS_API_KEY" },
      { status: 500 }
    );
  }

  const upstream = await fetch(
    `https://www.googleapis.com/webfonts/v1/webfonts?key=${key}&sort=${encodeURIComponent(
      sort
    )}`,
    { next: { revalidate } }
  );

  if (!upstream.ok) {
    return NextResponse.json({ error: "Upstream error" }, { status: 502 });
  }

  const json: unknown = await upstream.json();
  if (!isGoogleFontsApiResponse(json)) {
    return NextResponse.json(
      { error: "Invalid response shape" },
      { status: 502 }
    );
  }

  // Map to a small, typed payload
  const items: GoogleFontItem[] = json.items.map((f) => ({
    family: f.family,
    variants: f.variants as GoogleFontsVariant[],
    // narrow category to our union; fallback “sans-serif” if unknown
    category: (
      ["serif", "sans-serif", "monospace", "display", "handwriting"] as const
    ).includes(f.category as never)
      ? (f.category as GoogleFontItem["category"])
      : "sans-serif",
  }));

  return NextResponse.json({ items });
}
