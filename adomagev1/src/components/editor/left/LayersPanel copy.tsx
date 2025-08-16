// src/components/editor/left/LayersPanel.tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Image as ImageIcon, Pencil, Trash2, GripVertical } from 'lucide-react';
import UploadController from '../UploadController';

export type BackgroundInfo = {
  hasImage: boolean;
  name?: string;
};

export type TextLayerListItem = {
  id: string;
  name: string;          // display label, e.g. "Text layer 1"
  text?: string;         // current content preview
  selected?: boolean;    // highlighted in the list
  expanded?: boolean;    // show inline editor below the row
  muted?: boolean;       // for future (locked/hidden)
};

export type LayersPanelProps = {
  /** Background controls */
  background: BackgroundInfo;
  onReplaceBackground: (file: File) => void;
  onSelectLayer: (id: 'background' | string) => void;
  onClearBackground?: () => void;

  /** Text layers */
  textLayers: TextLayerListItem[];
  onDeleteTextLayer: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onChangeTextContent: (id: string, value: string) => void;

  /** Optional: add new text layer entry point (we’ll wire later) */
  onAddTextLayer?: () => void;
};

const RowShell: React.FC<{
  active?: boolean;
  muted?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}> = ({ active, muted, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'group w-full text-left rounded-lg border px-3 py-2 transition flex items-center gap-2',
      active ? 'bg-secondary/40 border-border' : 'hover:bg-secondary/30',
      muted && 'opacity-70'
    )}
  >
    {children}
  </button>
);

const BackgroundRow: React.FC<{
  info: BackgroundInfo;
  onSelect: () => void;
}> = ({ info, onSelect }) => (
  <RowShell active={false} onClick={onSelect}>
    <ImageIcon className="h-5 w-5 opacity-80" />
    <div className="flex-1">
      <div className="text-sm font-medium">
        {info.hasImage ? 'Background image' : 'No background'}
      </div>
      <div className="text-xs text-muted-foreground truncate">
        {info.hasImage ? info.name ?? '—' : 'Upload or replace a PNG'}
      </div>
    </div>
  </RowShell>
);

const TextLayerRow: React.FC<{
  item: TextLayerListItem;
  onSelect: () => void;
  onToggleExpand: () => void;
  onDelete: () => void;
}> = ({ item, onSelect, onToggleExpand, onDelete }) => (
  <RowShell active={item.selected} muted={item.muted} onClick={onSelect}>
    {/* Reorder handle placeholder (future drag & drop) */}
    <GripVertical className="h-4 w-4 text-muted-foreground/70" />
    <div className="flex-1 min-w-0">
      <div className="text-sm font-medium truncate">{item.name}</div>
      {item.text ? (
        <div className="text-xs text-muted-foreground truncate">{item.text}</div>
      ) : null}
    </div>
    <Button
      type="button"
      size="icon"
      variant="ghost"
      className="h-8 w-8"
      onClick={(e) => {
        e.stopPropagation();
        onToggleExpand();
      }}
      aria-label="Edit text"
    >
      <Pencil className="h-4 w-4" />
    </Button>
    <Button
      type="button"
      size="icon"
      variant="ghost"
      className="h-8 w-8 text-destructive"
      onClick={(e) => {
        e.stopPropagation();
        onDelete();
      }}
      aria-label="Delete layer"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  </RowShell>
);

export const LayersPanel: React.FC<LayersPanelProps> = ({
  background,
  onReplaceBackground,
  onSelectLayer,
  onClearBackground,
  textLayers,
  onDeleteTextLayer,
  onToggleExpand,
  onChangeTextContent,
  onAddTextLayer,
}) => {
  return (
    <div className="space-y-3">
      {/* Replace background (CTA card) */}
      <Card className="border-dashed">
        <CardContent className="py-4">
          <UploadController
            variant="button"
            label={background.hasImage ? 'Click to Replace background PNG' : 'Upload background PNG'}
            onSelect={onReplaceBackground}
            accept="image/png"
            className="w-full"
          />
          {/* Optional clear */}
          {background.hasImage && onClearBackground ? (
            <div className="mt-2">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={onClearBackground}>
                Clear background
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Background row */}
      <BackgroundRow info={background} onSelect={() => onSelectLayer('background')} />

      {/* Text layers header + add */}
      <div className="mt-2 flex items-center justify-between">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">Text layers</div>
        {onAddTextLayer ? (
          <Button size="sm" variant="secondary" onClick={onAddTextLayer}>
            + Add text
          </Button>
        ) : null}
      </div>

      {/* Text layers list */}
      <div className="space-y-2">
        {textLayers.map((t) => (
          <div key={t.id} className="space-y-2">
            <TextLayerRow
              item={t}
              onSelect={() => onSelectLayer(t.id)}
              onToggleExpand={() => onToggleExpand(t.id)}
              onDelete={() => onDeleteTextLayer(t.id)}
            />
            {/* Expanded inline editor (simple & obvious) */}
            {t.expanded ? (
              <div className="rounded-lg border bg-card p-2">
                {/* For multiline content, prefer Textarea; Input would work for one line */}
                <Textarea
                  value={t.text ?? ''}
                  placeholder="Enter text…"
                  onChange={(e) => onChangeTextContent(t.id, e.target.value)}
                  className="min-h-[70px] text-sm"
                />
                {/* For quick rename (optional) */}
                <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
                  <Input
                    value={t.name}
                    onChange={(e) => onChangeTextContent(t.id, e.target.value)}
                    className="text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onToggleExpand(t.id)}
                  >
                    Done
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        ))}

        {/* Empty state */}
        {textLayers.length === 0 ? (
          <div className="rounded-lg border bg-card/40 p-3 text-xs text-muted-foreground">
            No text layers yet. {onAddTextLayer ? 'Click “Add text” to create one.' : 'Add a text layer to get started.'}
          </div>
        ) : null}
      </div>
    </div>
  );
};
