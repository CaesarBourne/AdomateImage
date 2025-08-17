// src/components/editor/right/TextInspector.tsx
"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useFontLoader } from "@/hooks/useFontLoader";
import {
  useEditorActions,
  useSelectedId,
  useTextLayers,
} from "@/store/editorStore";

const FONT_FAMILIES = ["Inter", "Roboto", "Open Sans", "Montserrat", "Lato"];
const WEIGHTS = ["regular", 400, 500, 600, 700, "bold"] as const;

export default function TextInspector() {
  const selectedId = useSelectedId();
  const layers = useTextLayers();
  const layer = layers.find((l) => l.id === selectedId) ?? null;

  const { updateTextProps } = useEditorActions();

  // ✅ Always call the hook (safe even if no layer/family)
  const family = layer?.fontFamily;
  useFontLoader(family, [400, 700]);

  if (!layer) {
    return (
      <div className="rounded-lg border bg-card p-3 text-sm text-muted-foreground">
        Select a text layer to edit its typography.
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border bg-card p-3">
      {/* Font family */}
      <div className="space-y-1.5">
        <Label>Font family</Label>
        <Select
          value={layer.fontFamily}
          onValueChange={(v) => updateTextProps(layer.id, { fontFamily: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose font…" />
          </SelectTrigger>
          <SelectContent>
            {FONT_FAMILIES.map((f) => (
              <SelectItem key={f} value={f}>
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Size + Weight */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Font size (px)</Label>
          <Input
            type="number"
            min={1}
            value={layer.fontSize}
            onChange={(e) =>
              updateTextProps(layer.id, {
                fontSize: Math.max(1, Number(e.target.value || 1)),
              })
            }
          />
        </div>

        <div className="space-y-1.5">
          <Label>Weight</Label>
          <Select
            value={
              // display "regular" for 400, "bold" for "bold", otherwise the numeric
              typeof layer.fontWeight === "number"
                ? layer.fontWeight === 400
                  ? "regular"
                  : String(layer.fontWeight)
                : layer.fontWeight === "bold"
                ? "bold"
                : "regular"
            }
            onValueChange={(v) => {
              // ✅ Save only allowed values: number | "normal" | "bold"
              const next =
                v === "bold" ? "bold" : v === "regular" ? 400 : Number(v); // 100..900
              updateTextProps(layer.id, { fontWeight: next });
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {WEIGHTS.map((w) => (
                <SelectItem key={String(w)} value={String(w)}>
                  {String(w)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Opacity */}
      <div className="space-y-1.5">
        <Label>Opacity</Label>
        <div className="flex items-center gap-3">
          <div className="grow">
            <Slider
              value={[Math.round(layer.opacity * 100)]}
              onValueChange={([v]) =>
                updateTextProps(layer.id, { opacity: (v ?? 100) / 100 })
              }
              min={0}
              max={100}
              step={1}
            />
          </div>
          <Input
            className={cn("w-16 text-right")}
            type="number"
            min={0}
            max={100}
            value={Math.round(layer.opacity * 100)}
            onChange={(e) => {
              const n = Math.max(0, Math.min(100, Number(e.target.value || 0)));
              updateTextProps(layer.id, { opacity: n / 100 });
            }}
          />
        </div>
      </div>
    </div>
  );
}
