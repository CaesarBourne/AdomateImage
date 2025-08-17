import { ChangeEvent, useEffect } from "react";
import { TextLayer } from "@/types/editor";
import { useEditorStore } from "@/store/editorStore";
import { Section } from "./Section";
import { useFontStore } from "@/store/fontStore";

type Props = { layer: TextLayer };

export default function TypographyControls({ layer }: Props) {
  const update = useEditorStore((s) => s.actions.updateTextProps);
  const { fonts, fetchFonts, loaded } = useFontStore();

  useEffect(() => {
    if (!loaded) fetchFonts();
  }, [loaded, fetchFonts]);

  const currentFont = fonts.find((f) => f.family === layer.fontFamily);

  return (
    <Section title="Typography">
      {/* Font Family */}
      <div>
        <label className="block text-xs mb-1">Font Family</label>
        <select
          value={layer.fontFamily}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            update(layer.id, { fontFamily: e.target.value })
          }
          className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
        >
          {!loaded && <option>Loading...</option>}
          {fonts.map((font) => (
            <option key={font.family} value={font.family}>
              {font.family}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size */}
      <div>
        <label className="block text-xs mb-1">Font Size</label>
        <div className="flex items-center gap-2">
          {/* Slider */}
          <input
            type="range"
            min={8}
            max={200}
            step={1}
            value={layer.fontSize}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              update(layer.id, { fontSize: Number(e.target.value) })
            }
            className="flex-1 accent-blue-500 cursor-pointer"
          />
          {/* Numeric Input */}
          <input
            type="number"
            min={8}
            max={200}
            step={1}
            value={layer.fontSize}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              update(layer.id, { fontSize: Number(e.target.value) })
            }
            className="w-16 rounded-md border border-input bg-background px-2 py-1 text-sm"
          />
        </div>
      </div>

      {/* Font Weight */}
      <div>
        <label className="block text-xs mb-1">Font Weight</label>
        <select
          value={layer.fontWeight}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            update(layer.id, {
              fontWeight:
                e.target.value === "normal" || e.target.value === "bold"
                  ? e.target.value
                  : Number(e.target.value),
            })
          }
          className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
        >
          {currentFont?.variants.map((variant) => {
            // normalize Google’s variant names (e.g., "regular", "700italic")
            const label =
              variant === "regular"
                ? "400"
                : variant.replace("italic", " italic");
            const value =
              variant === "regular" ? 400 : parseInt(variant) || variant;
            return (
              <option key={variant} value={value}>
                {label}
              </option>
            );
          })}
        </select>
      </div>
    </Section>
  );
}
