// right/propertiesPanel/PropertiesPanel.tsx
import { useEditorStore } from "@/store/editorStore";
import TypographyControls from "./TypographyControls";
import AlignmentControls from "./AlignmentControls";
import AppearanceControls from "./AppearanceControls";
import TransformControls from "./TransformControls";

export default function PropertiesPanel() {
  const selectedId = useEditorStore((s) => s.text.selectedId);
  const layer = useEditorStore(
    (s) => s.text.layers.find((l) => l.id === selectedId) || null
  );

  if (!layer) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        No text layer selected
      </div>
    );
  }

  return (
    <div className="w-full overflow-y-auto">
      <TypographyControls layer={layer} />
      <TransformControls layer={layer} />
      <AlignmentControls layer={layer} />
      <AppearanceControls layer={layer} />
    </div>
  );
}
