import { Button } from "@/components/ui/button";
import { Undo2, Redo2, Download, RotateCcw } from "lucide-react";

type Props = {
  onExport: () => void;
  onReset: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  historyIndex?: number;      // current step (0-based)
  historyLimit?: number;      // max steps (default 20)
};

export function CanvasToolbar({
  onExport,
  onReset,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  historyIndex = 0,
  historyLimit = 20,
}: Props) {
  const counter = `${Math.max(0, historyIndex)}/${historyLimit}`;

  return (
    <div className="flex items-center justify-end gap-3">
      {/* Undo / Redo group with counter */}
      <div className="flex items-center gap-1 rounded-lg border bg-card px-1 py-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onUndo}
          disabled={!canUndo}
          aria-label="Undo"
        >
          <Undo2 className="h-4 w-4" />
        </Button>

        <span className="px-1 text-xs tabular-nums text-muted-foreground">
          {counter}
        </span>

        <Button
          variant="ghost"
          size="icon"
          onClick={onRedo}
          disabled={!canRedo}
          aria-label="Redo"
        >
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Download + Reset */}
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          className="gap-2"
          onClick={onExport}
          aria-label="Download image"
        >
          <Download className="h-4 w-4" />
          Download
        </Button>

        <Button
          variant="outline"
          className="gap-2"
          onClick={onReset}
          aria-label="Reset canvas"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>
    </div>
  );
}
