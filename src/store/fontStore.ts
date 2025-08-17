import { create } from "zustand";
import { fetchGoogleFonts, GoogleFont } from "@/lib/googleFonts";

type FontState = {
  fonts: GoogleFont[];
  loaded: boolean;
  fetchFonts: () => Promise<void>;
};

export const useFontStore = create<FontState>((set) => ({
  fonts: [],
  loaded: false,
  fetchFonts: async () => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_FONTS_API_KEY;
    if (!apiKey) throw new Error("Google Fonts API key missing");

    const fonts = await fetchGoogleFonts(apiKey);
    set({ fonts, loaded: true });
  },
}));
