// right/propertiesPanel/TransformControls.tsx
import { ChangeEvent, useState } from "react";
import { Section } from "./Section";
import { TextLayer } from "@/types/editor";
import { useEditorStore } from "@/store/editorStore";
import { RotateCw } from "lucide-react";

type Props = { layer: TextLayer };

export default function TransformControls({ layer }: Props) {
  const update = useEditorStore((s) => s.actions.updateTextProps);
  const [dragging, setDragging] = useState(false);

  const numInput =
    (field: keyof Pick<TextLayer, "x" | "y">) =>
    (e: ChangeEvent<HTMLInputElement>) =>
      update(layer.id, { [field]: Number(e.target.value) });

  const startDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
    const startX = e.clientX;
    const startRotation = layer.rotation;

    const onMove = (moveEvt: MouseEvent) => {
      const delta = moveEvt.clientX - startX;
      const nextRotation = startRotation + delta; // 1px = 1deg adjust
      update(layer.id, { rotation: nextRotation });
    };

    const onUp = () => {
      setDragging(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <Section title="Transform">
      <div className="grid grid-cols-3 gap-2 items-center">
        <div>
          <label className="block text-xs mb-1">X</label>
          <input
            type="number"
            value={layer.x}
            onChange={numInput("x")}
            className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs mb-1">Y</label>
          <input
            type="number"
            value={layer.y}
            onChange={numInput("y")}
            className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs mb-1">Rotation</label>
          <div
            className={`flex items-center gap-2 px-2 py-1 rounded-md border border-input bg-background cursor-ew-resize select-none ${
              dragging ? "bg-accent/20" : ""
            }`}
            onMouseDown={startDrag}
          >
            <RotateCw size={16} className="text-muted-foreground" />
            <span className="text-sm">{Math.round(layer.rotation)}°</span>
          </div>
        </div>
      </div>
    </Section>
  );
}
