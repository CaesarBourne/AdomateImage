// src/components/editor/left/LayersPanel.tsx
'use client';

import React from 'react';
import { Image as ImageIcon, Plus, Trash2, Pencil, GripVertical } from 'lucide-react';
import UploadController from '../UploadController';
import { shortFileLabel } from '@/lib/format';
import { Textarea } from '@/components/ui/textarea';

import {
  useImageMeta,
  useTextLayers,
  useSelectedId,
  useEditorActions,
  useReorderTextLayers,
} from '@/store/editorStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type LayersPanelProps = {
  hasImage: boolean;
  onReplace: (file: File) => void;
};

const LayersPanel: React.FC<LayersPanelProps> = ({ hasImage, onReplace }) => {
  const meta = useImageMeta();
  const bgLabel = shortFileLabel(meta?.name, { maxBase: 10 });

  const layers = useTextLayers();
  const selectedId = useSelectedId();
  const { addTextLayer, selectTextLayer, updateTextProps, deleteTextLayer } = useEditorActions();
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
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (overId: string) => (e: React.DragEvent) => {
    e.preventDefault(); // allow drop
    e.dataTransfer.dropEffect = 'move';
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
      <UploadController
        variant="card"
        label={hasImage ? 'Click to Replace background png' : 'Upload background PNG'}
        onSelect={onReplace}
        accept="image/png"
        className="w-full"
      />

      {/* Background  */}
      <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
        <ImageIcon className="h-5 w-5 opacity-80" />
        <div className="min-w-0">
          <div className="text-sm font-medium">Background image</div>
          <div className="truncate text-xs text-muted-foreground" title={meta?.name ?? undefined}>
            {hasImage ? bgLabel : 'No image selected'}
          </div>
        </div>
      </div>

      {/* Text layers header + add */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Text layers</h3>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => addTextLayer()}
          disabled={!hasImage}
          className="gap-1"
        >
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      {/* List (draggable) */}
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
                'rounded-lg border p-2 cursor-grab transition-colors',
                active ? 'bg-secondary/40 border-border' : 'hover:bg-secondary/30',
                isDragOver && 'ring-1 ring-primary/40'
              )}
              onClick={() => selectTextLayer(l.id)}
              title="Drag to reorder • Click to select"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="shrink-0 text-muted-foreground"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <GripVertical className="h-4 w-4" />
                  </span>

                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">
                      {`Text layer ${idx + 1}`}
                    </div>
                    {!isEditing ? (
                      <div className="text-xs text-muted-foreground truncate">
                        {l.text || '(empty)'}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingId(isEditing ? null : l.id)}
                    aria-label="Edit text"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteTextLayer(l.id)}
                    aria-label="Delete layer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* inline editor */}
{isEditing && (
  <div className="mt-2" onClick={(e) => e.stopPropagation()}>
    <Textarea
      value={l.text ?? ''}
      onChange={(e) => updateTextProps(l.id, { text: e.target.value })}
      placeholder="Type text…"
      rows={4}
      className="text-sm"
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          // Enter = done (don’t insert a newline)
          e.preventDefault();
          setEditingId(null);
        }
        // Shift+Enter falls through → inserts "\n"
      }}
    />
    <div className="mt-1 text-[11px] text-muted-foreground">
      Shift+Enter = new line • Enter = done
    </div>
  </div>
)}
            </div>
          );
        })}
        {ordered.length === 0 && (
          <div className="text-xs text-muted-foreground">No text layers yet.</div>
        )}
      </div>
    </div>
  );
};

export default LayersPanel;
