// right/propertiesPanel/AlignmentControls.tsx
import { Section } from "./Section";
import { TextLayer, TextAlign } from "@/types/editor";
import { useEditorStore } from "@/store/editorStore";

type Props = { layer: TextLayer };

const alignments: TextAlign[] = ["left", "center", "right"];

export default function AlignmentControls({ layer }: Props) {
  const update = useEditorStore((s) => s.actions.updateTextProps);

  return (
    <Section title="Alignment">
      <div className="flex gap-2">
        {alignments.map((align) => (
          <button
            key={align}
            onClick={() => update(layer.id, { align })}
            className={`flex-1 rounded-md border px-2 py-1 text-sm ${
              layer.align === align
                ? "bg-primary text-primary-foreground"
                : "bg-background text-foreground"
            }`}
          >
            {align}
          </button>
        ))}
      </div>
    </Section>
  );
}
