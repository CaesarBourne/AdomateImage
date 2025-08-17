"use client";

import React from "react";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Pencil,
  GripVertical,
} from "lucide-react";
import UploadController from "../UploadController";
import { shortFileLabel } from "@/lib/format";
import { Textarea } from "@/components/ui/textarea";

import {
  useImageMeta,
  useTextLayers,
  useSelectedId,
  useEditorActions,
  useReorderTextLayers,
} from "@/store/editorStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LayersPanelProps = {
  hasImage: boolean;
  onReplace: (file: File) => void;
};

const LayersPanel: React.FC<LayersPanelProps> = ({ hasImage, onReplace }) => {
  const meta = useImageMeta();
  const bgLabel = shortFileLabel(meta?.name, { maxBase: 10 });

  const layers = useTextLayers();
  const selectedId = useSelectedId();
  const { addTextLayer, selectTextLayer, updateTextProps, deleteTextLayer } =
    useEditorActions();
  const reorderTextLayers = useReorderTextLayers();

  // inline edit state
  const [editingId, setEditingId] = React.useState<string | null>(null);

  // Show top-most first (higher z first) so reordering feels like stacking
  const ordered = React.useMemo(
    () => [...layers].sort((a, b) => b.z - a.z),
    [layers]
  );

  // Simple native DnD
  const draggingId = React.useRef<string | null>(null);
  const [dragOverId, setDragOverId] = React.useState<string | null>(null);

  const onDragStart = (id: string) => (e: React.DragEvent) => {
    draggingId.current = id;
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (overId: string) => (e: React.DragEvent) => {
    e.preventDefault(); // allow drop
    e.dataTransfer.dropEffect = "move";
    if (dragOverId !== overId) setDragOverId(overId);
  };

  const onDragLeave = () => setDragOverId((prev) => prev); // keep highlight stable unless drop elsewhere

  const onDrop = (overId: string) => (e: React.DragEvent) => {
    e.preventDefault();
    const fromId = draggingId.current;
    draggingId.current = null;
    setDragOverId(null);
    if (!fromId || fromId === overId) return;

    const ids = ordered.map((l) => l.id);
    const fromIdx = ids.indexOf(fromId);
    const toIdx = ids.indexOf(overId);
    if (fromIdx < 0 || toIdx < 0) return;

    const next = [...ids];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);

    // Persist order -> store assigns z accordingly
    reorderTextLayers(next);
  };

  return (
    <div className="space-y-4">
      {/* Upload/Replace background */}
      <div className="space-y-3">
        <UploadController
          variant="card"
          label={hasImage ? "Replace Background" : "Upload Background"}
          onSelect={onReplace}
          accept="image/png"
          className="w-full"
        />

        {/* Background Info Card */}
        <div className="flex items-center gap-3 rounded-lg border border-sidebar-border bg-sidebar-accent/30 px-3 py-2.5">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-md bg-sidebar flex items-center justify-center">
              <ImageIcon className="h-4 w-4 text-sidebar-foreground" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-sidebar-foreground">
              Background
            </div>
            <div
              className="truncate text-xs text-sidebar-foreground/70"
              title={meta?.name ?? undefined}
            >
              {hasImage ? bgLabel : "No image selected"}
            </div>
          </div>
        </div>
      </div>

      {/* Text Layers Section */}
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-sidebar-foreground">
            Text Layers
          </h4>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => addTextLayer()}
            disabled={!hasImage}
            className="h-7 gap-1.5 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Layer
          </Button>
        </div>

        {/* Layers List */}
        <div className="space-y-2">
          {ordered.map((l, idx) => {
            const active = l.id === selectedId;
            const isEditing = editingId === l.id;
            const isDragOver = dragOverId === l.id;

            return (
              <div
                key={l.id}
                draggable
                onDragStart={onDragStart(l.id)}
                onDragOver={onDragOver(l.id)}
                onDragLeave={onDragLeave}
                onDrop={onDrop(l.id)}
                className={cn(
                  "rounded-lg border transition-all duration-200 cursor-grab",
                  active
                    ? "bg-sidebar-accent border-sidebar-accent-foreground/20 shadow-sm"
                    : "bg-sidebar border-sidebar-border hover:bg-sidebar-accent/50",
                  isDragOver &&
                    "ring-2 ring-sidebar-primary/40 ring-offset-1 ring-offset-sidebar"
                )}
                onClick={() => selectTextLayer(l.id)}
                title="Drag to reorder • Click to select"
              >
                <div className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className="flex-shrink-0 text-sidebar-foreground/60 hover:text-sidebar-foreground cursor-grab"
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <GripVertical className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-sidebar-foreground">
                            Layer {idx + 1}
                          </div>
                          {active && (
                            <div className="w-2 h-2 rounded-full bg-sidebar-primary" />
                          )}
                        </div>
                        {!isEditing && (
                          <div className="text-xs text-sidebar-foreground/70 truncate mt-0.5">
                            {l.text || "(empty text)"}
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingId(isEditing ? null : l.id)}
                        className="h-7 w-7 p-0 hover:bg-sidebar-accent"
                        title="Edit text"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTextLayer(l.id)}
                        className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
                        title="Delete layer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Inline Editor */}
                  {isEditing && (
                    <div
                      className="mt-3 pt-3 border-t border-sidebar-border"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Textarea
                        value={l.text ?? ""}
                        onChange={(e) =>
                          updateTextProps(l.id, { text: e.target.value })
                        }
                        placeholder="Enter your text..."
                        rows={3}
                        className="text-sm bg-sidebar border-sidebar-border focus:border-sidebar-primary"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            setEditingId(null);
                          }
                        }}
                      />
                      <div className="mt-2 text-xs text-sidebar-foreground/60">
                        <span className="font-medium">Shift+Enter</span> for new
                        line • <span className="font-medium">Enter</span> to
                        finish
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Empty State */}
          {ordered.length === 0 && (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-sidebar-muted flex items-center justify-center mx-auto mb-3">
                <Plus className="h-6 w-6 text-sidebar-foreground/40" />
              </div>
              <p className="text-sm text-sidebar-foreground/70">
                No text layers yet
              </p>
              <p className="text-xs text-sidebar-foreground/50 mt-1">
                Add a layer to get started
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LayersPanel;
