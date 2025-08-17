// right/propertiesPanel/AppearanceControls.tsx
import { Section } from "./Section";
import { TextLayer } from "@/types/editor";
import { useEditorStore } from "@/store/editorStore";
import { ColorResult, SketchPicker } from "react-color";

type Props = { layer: TextLayer };

export default function AppearanceControls({ layer }: Props) {
  const update = useEditorStore((s) => s.actions.updateTextProps);

  return (
    <Section title="Appearance">
      {/* Color */}
      <div>
        <label className="block text-xs mb-1">Color</label>
        <SketchPicker
          color={layer.fill}
          onChange={(c: ColorResult) => update(layer.id, { fill: c.hex })}
        />
      </div>

      {/* Opacity */}
      <div>
        <label className="block text-xs mb-1">Opacity</label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={layer.opacity}
          onChange={(e) =>
            update(layer.id, { opacity: Number(e.target.value) })
          }
          className="w-full"
        />
      </div>
    </Section>
  );
}
