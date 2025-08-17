import { Section } from "./Section";
import { TextLayer, TextAlign } from "@/types/editor";
import { useEditorStore } from "@/store/editorStore";
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { LucideIcon } from "lucide-react";

type Props = {
  layer: TextLayer;
};

const alignments: { value: TextAlign; icon: LucideIcon; label: string }[] = [
  { value: "left", icon: AlignLeft, label: "Left" },
  { value: "center", icon: AlignCenter, label: "Center" },
  { value: "right", icon: AlignRight, label: "Right" },
];

export default function AlignmentControls({ layer }: Props) {
  const update = useEditorStore((s) => s.actions.updateTextProps);

  return (
    <Section title="Alignment">
      <div className="grid grid-cols-3 gap-1 p-1 bg-muted rounded-md">
        {alignments.map(({ value, icon: Icon, label }) => (
          <button
            key={value}
            onClick={() => update(layer.id, { align: value })}
            className={`flex items-center justify-center h-8 rounded-sm transition-all ${
              layer.align === value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }`}
            title={label}
          >
            <Icon size={16} />
          </button>
        ))}
      </div>
    </Section>
  );
}
