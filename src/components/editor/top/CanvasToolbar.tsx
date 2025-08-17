import { Button } from "@/components/ui/button";
import { Undo2, Redo2, Download, RotateCcw } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ModeToggle } from "@/components/modeToggle";

type Props = {
  onExport: () => void;
  onReset: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  historyIndex?: number; // current step (0-based)
  historyLimit?: number; // max steps (default 20)
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
  const counter = `Step ${Math.max(0, historyIndex)} of ${historyLimit}`;

  return (
    <div className="flex items-center justify-end gap-3">
      <ModeToggle/>
      {/* Undo / Redo group with counter */}
      <div className="flex items-center gap-1 rounded-lg border bg-card px-1 py-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onUndo}
                disabled={!canUndo}
                aria-label="Undo"
              >
                <Undo2 className={`h-4 w-4 ${!canUndo ? "opacity-40" : ""}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Undo{" "}
              <span className="text-xs text-muted-foreground">(Ctrl+Z)</span>
            </TooltipContent>
          </Tooltip>

          <span className="px-1 text-xs tabular-nums text-muted-foreground">
            {counter}
          </span>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onRedo}
                disabled={!canRedo}
                aria-label="Redo"
              >
                <Redo2 className={`h-4 w-4 ${!canRedo ? "opacity-40" : ""}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Redo{" "}
              <span className="text-xs text-muted-foreground">
                (Ctrl+Shift+Z)
              </span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Download + Reset */}
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                className="gap-2"
                onClick={onExport}
                aria-label="Download image"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export canvas as PNG</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="gap-2"
                onClick={onReset}
                aria-label="Reset canvas"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset canvas to default</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
