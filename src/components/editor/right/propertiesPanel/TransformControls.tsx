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
      const nextRotation = startRotation + delta;
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
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">X Position</label>
          <input
            type="number"
            value={Math.round(layer.x)}
            onChange={numInput("x")}
            className="w-full h-9 rounded-md border border-border bg-card text-card-foreground px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Y Position</label>
          <input
            type="number"
            value={Math.round(layer.y)}
            onChange={numInput("y")}
            className="w-full h-9 rounded-md border border-border bg-card text-card-foreground px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">Rotation</label>
        <div
          className={`flex items-center justify-between h-9 px-3 rounded-md border border-border bg-card cursor-ew-resize select-none transition-colors ${
            dragging ? "bg-accent border-primary" : "hover:bg-accent/50"
          }`}
          onMouseDown={startDrag}
        >
          <div className="flex items-center gap-2">
            <RotateCw size={14} className="text-muted-foreground" />
            <span className="text-sm text-card-foreground">Drag to rotate</span>
          </div>
          <span className="text-sm font-medium text-card-foreground">
            {Math.round(layer.rotation)}°
          </span>
        </div>
      </div>
    </Section>
  );
}
