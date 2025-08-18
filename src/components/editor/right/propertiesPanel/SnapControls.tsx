"use client";

import { Section } from "./Section";
import { useEditorStore, useImageMeta } from "@/store/editorStore";
import type { TextLayer } from "@/types/editor";
import React from "react";

type Props = { layer: TextLayer };

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

function estimateBox(layer: TextLayer, imgW: number): { w: number; h: number } {
  const w = typeof layer.width === "number" ? layer.width : 0;
  const lineHeight = layer.lineHeight ?? 1.2;
  const lines = Math.max(1, layer.text.split("\n").length);
  const h = Math.max(1, Math.round(layer.fontSize * lineHeight * lines));
  return { w: clamp(w, 0, imgW), h };
}

export default function SnapControls({ layer }: Props) {
  const img = useImageMeta();
  const update = useEditorStore((s) => s.actions.updateTextProps);
  const [pad, setPad] = React.useState<number>(0);

  if (!img) return null;
  const { originalW, originalH } = img;
  const { w, h } = estimateBox(layer, originalW);

  const snap = (hPos: string, vPos: string) => {
    let x = layer.x;
    let y = layer.y;

    // Horizontal position
    if (hPos === "left") {
      x = clamp(pad, 0, Math.max(0, originalW - w));
    } else if (hPos === "center") {
      x = clamp(Math.round((originalW - w) / 2), 0, Math.max(0, originalW - w));
    } else if (hPos === "right") {
      x = clamp(originalW - w - pad, 0, Math.max(0, originalW - w));
    }

    // Vertical position
    if (vPos === "top") {
      y = clamp(pad, 0, Math.max(0, originalH - h));
    } else if (vPos === "center") {
      y = clamp(Math.round((originalH - h) / 2), 0, Math.max(0, originalH - h));
    } else if (vPos === "bottom") {
      y = clamp(originalH - h - pad, 0, Math.max(0, originalH - h));
    }

    update(layer.id, { x, y });
  };

  return (
    <Section title="Snap to Canvas">
      <div className="flex items-center gap-2">
        <label className="text-xs text-muted-foreground">Padding</label>
        <input
          type="number"
          min={0}
          value={pad}
          onChange={(e) => setPad(Math.max(0, Number(e.target.value || 0)))}
          className="w-20 h-8 rounded-md border border-border bg-card text-card-foreground px-2 text-sm"
        />
        <span className="text-xs text-muted-foreground">px</span>
      </div>

      <div className="grid grid-cols-3 gap-1 w-24 h-24 mx-auto border-2 border-border rounded-md overflow-hidden">
        <button
          className="bg-card hover:bg-accent border-r border-b border-border"
          onClick={() => snap("left", "top")}
          title="Top Left"
        />
        <button
          className="bg-card hover:bg-accent border-r border-b border-border"
          onClick={() => snap("center", "top")}
          title="Top Center"
        />
        <button
          className="bg-card hover:bg-accent border-b border-border"
          onClick={() => snap("right", "top")}
          title="Top Right"
        />

        <button
          className="bg-card hover:bg-accent border-r border-b border-border"
          onClick={() => snap("left", "center")}
          title="Middle Left"
        />
        <button
          className="bg-card hover:bg-accent border-r border-b border-border"
          onClick={() => snap("center", "center")}
          title="Center"
        />
        <button
          className="bg-card hover:bg-accent border-b border-border"
          onClick={() => snap("right", "center")}
          title="Middle Right"
        />

        <button
          className="bg-card hover:bg-accent border-r border-border"
          onClick={() => snap("left", "bottom")}
          title="Bottom Left"
        />
        <button
          className="bg-card hover:bg-accent border-r border-border"
          onClick={() => snap("center", "bottom")}
          title="Bottom Center"
        />
        <button
          className="bg-card hover:bg-accent"
          onClick={() => snap("right", "bottom")}
          title="Bottom Right"
        />
      </div>

      <p className="text-[11px] text-muted-foreground">
        Click on the box above to snap text to that position
      </p>
    </Section>
  );
}



