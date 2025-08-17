export type GoogleFontVariant =
  | "100"
  | "100italic"
  | "200"
  | "200italic"
  | "300"
  | "300italic"
  | "regular"
  | "italic"
  | "500"
  | "500italic"
  | "600"
  | "600italic"
  | "700"
  | "700italic"
  | "800"
  | "800italic"
  | "900"
  | "900italic";

export type GoogleFont = {
  family: string;
  variants: GoogleFontVariant[];
};

type GoogleFontsApiResponse = {
  items: {
    family: string;
    variants: GoogleFontVariant[];
  }[];
};

export async function fetchGoogleFonts(apiKey: string): Promise<GoogleFont[]> {
  const res = await fetch(
    `https://www.googleapis.com/webfonts/v1/webfonts?key=${apiKey}&sort=popularity`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch fonts");
  }

  const data: GoogleFontsApiResponse = await res.json();

  return data.items.map((item) => ({
    family: item.family,
    variants: item.variants,
  }));
}
