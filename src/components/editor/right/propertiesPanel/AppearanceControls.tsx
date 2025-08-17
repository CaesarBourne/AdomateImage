import { Section } from "./Section";
import { TextLayer } from "@/types/editor";
import { useEditorStore } from "@/store/editorStore";
import { ColorResult, SketchPicker } from "react-color";
import { useState } from "react";
import { Palette } from "lucide-react";

type Props = { layer: TextLayer };

export default function AppearanceControls({ layer }: Props) {
  const update = useEditorStore((s) => s.actions.updateTextProps);
  const [showColorPicker, setShowColorPicker] = useState(false);

  return (
    <Section title="Appearance">
      {/* Color */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">Color</label>
        <div className="relative">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="flex items-center gap-3 w-full h-9 px-3 rounded-md border border-border bg-card hover:bg-accent/50 transition-colors"
          >
            <div
              className="w-5 h-5 rounded border border-border shadow-sm"
              style={{ backgroundColor: layer.fill }}
            />
            <span className="text-sm text-card-foreground flex-1 text-left">
              {layer.fill.toUpperCase()}
            </span>
            <Palette size={14} className="text-muted-foreground" />
          </button>

          {showColorPicker && (
            <div className="absolute top-full mt-2 z-50">
              <div
                className="fixed inset-0"
                onClick={() => setShowColorPicker(false)}
              />
              <div className="relative">
                <SketchPicker
                  color={layer.fill}
                  onChange={(c: ColorResult) =>
                    update(layer.id, { fill: c.hex })
                  }
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Opacity */}
      {/* Opacity */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs text-muted-foreground">Opacity</label>
          <span className="text-xs text-foreground font-medium">
            {Math.round(layer.opacity * 100)}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={layer.opacity}
          onChange={(e) =>
            update(layer.id, { opacity: Number(e.target.value) })
          }
          className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary slider-thumb"
        />
      </div>
    </Section>
  );
}
