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
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">Font Family</label>
        <select
          value={layer.fontFamily}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            update(layer.id, { fontFamily: e.target.value })
          }
          className="w-full h-9 rounded-md border border-border bg-card text-card-foreground px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          {!loaded && <option>Loading fonts...</option>}
          {fonts.map((font) => (
            <option key={font.family} value={font.family}>
              {font.family}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">Size</label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={8}
            max={200}
            step={1}
            value={layer.fontSize}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              update(layer.id, { fontSize: Number(e.target.value) })
            }
            className="flex-1 h-2 bg-muted rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary slider-thumb"
          />
          <input
            type="number"
            min={8}
            max={200}
            step={1}
            value={layer.fontSize}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              update(layer.id, { fontSize: Number(e.target.value) })
            }
            className="w-16 h-9 rounded-md border border-border bg-card text-card-foreground px-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Font Weight */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">Weight</label>
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
          className="w-full h-9 rounded-md border border-border bg-card text-card-foreground px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          {currentFont?.variants.map((variant) => {
            const label =
              variant === "regular"
                ? "400 - Regular"
                : variant.replace("italic", " Italic");
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
