// src/components/editor/right/TypographySection.tsx
"use client";

import * as React from "react";
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

import {
  useEditorActions,
  useSelectedId,
  useTextLayers,
} from "@/store/editorStore";
import { useFontLoader } from "@/hooks/useFontLoader";
import { useGoogleFonts } from "@/hooks/useGoogleFonts";

// helpers
const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));
const toNum = (v: string, fallback: number) =>
  Number.isFinite(Number(v)) ? Number(v) : fallback;

function weightLabel(n: number) {
  switch (n) {
    case 100:
      return "Thin (100)";
    case 200:
      return "Extra Light (200)";
    case 300:
      return "Light (300)";
    case 400:
      return "Regular (400)";
    case 500:
      return "Medium (500)";
    case 600:
      return "Semi Bold (600)";
    case 700:
      return "Bold (700)";
    case 800:
      return "Extra Bold (800)";
    case 900:
      return "Black (900)";
    default:
      return String(n);
  }
}

const TypographySection: React.FC = () => {
  // selection
  const selectedId = useSelectedId();
  const layers = useTextLayers();
  const layer = layers.find((l) => l.id === selectedId) ?? null;

  const { updateTextProps } = useEditorActions();

  // live Google Fonts catalog (cached locally)
  const { fonts, loading, getWeightsFor } = useGoogleFonts();

  // current family/weight (fallbacks when none yet)
  const family: string | undefined = layer?.fontFamily;
  const currentWeight: number =
    typeof layer?.fontWeight === "number" ? layer.fontWeight : 400;

  // Load only what we need (stable array)
  const weightsToLoad = React.useMemo<number[]>(
    () => [currentWeight],
    [currentWeight]
  );

  // Always call the hook; it no-ops if no family
  useFontLoader(family, weightsToLoad);

  // empty state
  if (!layer) {
    return (
      <div className="rounded-lg border bg-card p-3">
        <div className="text-sm font-medium mb-1">Typography</div>
        <div className="text-xs text-muted-foreground">
          Select a text layer to edit its font.
        </div>
      </div>
    );
  }

  // build UI options
  const availableWeights = getWeightsFor(layer.fontFamily);
  const weightStr = String(currentWeight);

  // handlers
  const onChangeFamily = (nextFamily: string) => {
    updateTextProps(layer.id, { fontFamily: nextFamily });
  };

  const onCommitFamilyInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    if (val) onChangeFamily(val);
  };

  const onChangeSizeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = clamp(toNum(e.target.value, layer.fontSize), 4, 1000);
    updateTextProps(layer.id, { fontSize: next });
  };

  const onChangeSizeSlider = (vals: number[]) => {
    const next = clamp(vals[0] ?? layer.fontSize, 4, 1000);
    updateTextProps(layer.id, { fontSize: next });
  };

  const onChangeWeight = (val: string) => {
    const n = toNum(val, currentWeight);
    updateTextProps(layer.id, { fontWeight: n }); // keep numeric 100..900
  };

  return (
    <div className="rounded-lg border bg-card p-3 space-y-3">
      <div className="text-sm font-medium">Typography</div>

      {/* Font Family */}
      <div className="grid gap-2">
        <Label htmlFor="fontFamily">Font family</Label>
        <div className="flex gap-2">
          <Select
            onValueChange={onChangeFamily}
            value={layer.fontFamily}
            disabled={loading}
          >
            <SelectTrigger className="w-[240px]">
              <SelectValue
                placeholder={loading ? "Loading fonts…" : "Choose family"}
              />
            </SelectTrigger>
            <SelectContent>
              {fonts.map((f) => (
                <SelectItem key={f.family} value={f.family}>
                  {f.family}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Free text (any Google Font name) */}
          <Input
            id="fontFamily"
            placeholder="Or type a Google Font…"
            defaultValue={layer.fontFamily}
            onBlur={onCommitFamilyInput}
            className="w-full"
          />
        </div>
        {loading && (
          <div className="text-[11px] text-muted-foreground">
            Fetching catalog…
          </div>
        )}
      </div>

      {/* Font Size (original px) */}
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="fontSize">Font size (px)</Label>
          <Input
            id="fontSize"
            type="number"
            inputMode="numeric"
            className="w-24 h-8"
            value={layer.fontSize}
            onChange={onChangeSizeInput}
            min={4}
            max={1000}
          />
        </div>
        <Slider
          value={[clamp(layer.fontSize, 4, 1000)]}
          min={4}
          max={200}
          step={1}
          onValueChange={onChangeSizeSlider}
        />
      </div>

      {/* Weight */}
      <div className="grid gap-2">
        <Label htmlFor="fontWeight">Font weight</Label>
        <Select onValueChange={onChangeWeight} value={weightStr}>
          <SelectTrigger id="fontWeight">
            <SelectValue placeholder="Weight" />
          </SelectTrigger>
          <SelectContent>
            {availableWeights.map((w) => (
              <SelectItem key={w} value={String(w)}>
                {weightLabel(w)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
};

export default TypographySection;
