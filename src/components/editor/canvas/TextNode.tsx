// src/components/editor/canvas/TextNode.tsx
"use client";

import React, { useEffect, useRef } from "react";
import { Text as KText, Transformer } from "react-konva";
import type Konva from "konva";
import type { TextLayer } from "@/types/editor";
import { fromScreen, toScreen } from "@/lib/coords";
import { useEditorActions } from "@/store/editorStore";

type Props = {
  layer: TextLayer;
  scale: number; // display scale (screen/original)
  selected: boolean;
  onSelect: (id: string) => void;
};

const MIN_FONT_PX = 6; // original pixels

const TextNode: React.FC<Props> = ({ layer, scale, selected, onSelect }) => {
  const { updateTextProps } = useEditorActions();
  const textRef = useRef<Konva.Text>(null);
  const trRef = useRef<Konva.Transformer>(null);

  // rAF throttle for live transform
  const rafRef = useRef<number | null>(null);

  // Attach/detach transformer to the text node on selection
  useEffect(() => {
    const tr = trRef.current;
    const node = textRef.current;
    if (!tr) return;
    if (selected && node) {
      tr.nodes([node]);
      tr.getLayer()?.batchDraw();
    } else {
      tr.nodes([]);
      tr.getLayer()?.batchDraw();
    }
  }, [selected]);

  // Screen-space for render
  const x = toScreen(layer.x, scale);
  const y = toScreen(layer.y, scale);
  const width = layer.width ? toScreen(layer.width, scale) : undefined;

  // Simple fontStyle mapping
  const fontStyle =
    typeof layer.fontWeight === "number"
      ? layer.fontWeight >= 600
        ? "bold"
        : "normal"
      : layer.fontWeight === "bold"
      ? "bold"
      : "normal";

  // === Commit transform (called at end) ===
  const commitTransform = () => {
    const node = textRef.current;
    if (!node) return;

    const sx = Math.abs(node.scaleX());
    const sy = Math.abs(node.scaleY());
    const s = (sx + sy) / 2 || 1;

    const nextFontSize = Math.max(MIN_FONT_PX, layer.fontSize * s);
    const nextWidth =
      typeof layer.width === "number"
        ? Math.max(0, layer.width * s)
        : undefined;

    const nextX = fromScreen(node.x(), scale);
    const nextY = fromScreen(node.y(), scale);
    const nextRot = node.rotation();

    // reset local scale (we bake it into fontSize/width)
    node.scaleX(1);
    node.scaleY(1);

    updateTextProps(layer.id, {
      fontSize: nextFontSize,
      ...(typeof nextWidth === "number" ? { width: nextWidth } : {}),
      x: nextX,
      y: nextY,
      rotation: nextRot,
    });
  };

  // === Live transform (keeps right panel in sync while dragging) ===
  const handleTransform = () => {
    const node = textRef.current;
    if (!node) return;

    // throttle with rAF
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;

      const sx = Math.abs(node.scaleX());
      const sy = Math.abs(node.scaleY());
      const s = (sx + sy) / 2 || 1;

      const nextFontSize = Math.max(MIN_FONT_PX, layer.fontSize * s);
      const nextWidth =
        typeof layer.width === "number"
          ? Math.max(0, layer.width * s)
          : undefined;

      // Reset local scale and push to store so inspector updates live
      node.scaleX(1);
      node.scaleY(1);

      updateTextProps(layer.id, {
        fontSize: nextFontSize,
        ...(typeof nextWidth === "number" ? { width: nextWidth } : {}),
        x: fromScreen(node.x(), scale),
        y: fromScreen(node.y(), scale),
        rotation: node.rotation(),
      });
    });
  };

  return (
    <>
      <KText
        ref={textRef}
        x={x}
        y={y}
        width={width}
        text={layer.text}
        fontFamily={layer.fontFamily}
        fontSize={toScreen(layer.fontSize, scale)}
        fontStyle={fontStyle}
        fill={layer.fill}
        opacity={layer.opacity}
        align={layer.align}
        lineHeight={layer.lineHeight ?? 1.2}
        wrap="word"
        rotation={layer.rotation}
        draggable={!layer.locked}
        listening
        // Select / UX
        onClick={() => onSelect(layer.id)}
        onTap={() => onSelect(layer.id)}
        onDragStart={() => onSelect(layer.id)}
        onMouseEnter={(e) => {
          const container = e.target.getStage()?.container();
          if (container) container.style.cursor = "move";
        }}
        onMouseLeave={(e) => {
          const container = e.target.getStage()?.container();
          if (container) container.style.cursor = "default";
        }}
        // Persist position (original px) while dragging
        onDragMove={(e) => {
          const node = e.target as Konva.Text;
          updateTextProps(layer.id, {
            x: fromScreen(node.x(), scale),
            y: fromScreen(node.y(), scale),
          });
        }}
        onDragEnd={(e) => {
          const node = e.target as Konva.Text;
          updateTextProps(layer.id, {
            x: fromScreen(node.x(), scale),
            y: fromScreen(node.y(), scale),
          });
        }}
        shadowForStrokeEnabled={false}
        perfectDrawEnabled={false}
        strokeEnabled={false}
      />

      {selected && (
        <Transformer
          ref={trRef}
          // Corners → “text tool” scale (uniform); sides to change text box width
          enabledAnchors={[
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right",
            "middle-left",
            "middle-right",
          ]}
          keepRatio
          rotateEnabled
          padding={4}
          anchorSize={7}
          ignoreStroke
          borderEnabled
          borderStroke="#6366f1" // subtle indigo border
          borderStrokeWidth={1}
          anchorFill="#ffffff"
          anchorStroke="#6366f1"
          anchorStrokeWidth={1}
          // Live sync + final commit
          onTransform={handleTransform}
          onTransformEnd={commitTransform}
        />
      )}
    </>
  );
};

export default TextNode;
