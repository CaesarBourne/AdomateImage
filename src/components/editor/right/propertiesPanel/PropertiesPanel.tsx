import { useEditorStore } from "@/store/editorStore";
import TypographyControls from "./TypographyControls";
import AlignmentControls from "./AlignmentControls";
import AppearanceControls from "./AppearanceControls";
import TransformControls from "./TransformControls";
import SnapControls from "./SnapControls";

export default function PropertiesPanel() {
  const selectedId = useEditorStore((s) => s.text.selectedId);
  const layer = useEditorStore(
    (s) => s.text.layers.find((l) => l.id === selectedId) || null
  );

  if (!layer) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4 max-w-xs">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-card-foreground">
              No Layer Selected
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Select a text layer from the layers panel to edit its properties
              and styling options.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="pb-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-card-foreground">
            Properties
          </h3>
          <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            {layer.id.slice(0, 8)}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Text layer styling and positioning
        </p>
      </div>

      {/* Controls */}
      <div className="space-y-6">
        <TypographyControls layer={layer} />
        <TransformControls layer={layer} />
        <SnapControls layer={layer}/>
        <AlignmentControls layer={layer} />
        <AppearanceControls layer={layer} />
      </div>
    </div>
  );
}
