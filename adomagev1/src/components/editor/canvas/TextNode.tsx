'use client';

import React from 'react';
import { Text as KText } from 'react-konva';
import type { TextLayer } from '@/types/editor';
import { fromScreen, toScreen } from '@/lib/coords';
import { useEditorActions } from '@/store/editorStore';

type Props = {
  layer: TextLayer;
  scale: number;                  // display scale (screen/original)
  selected: boolean;
  onSelect: (id: string) => void;
};

/**
 * Draw a text layer.
 * - UI coordinates = original * scale (render)
 * - On drag: convert back to original space and persist in the store
 */
const TextNode: React.FC<Props> = ({ layer, scale, selected, onSelect }) => {
  const { updateTextProps } = useEditorActions();

  // Render in screen space
  const x = toScreen(layer.x, scale);
  const y = toScreen(layer.y, scale);
  const width = layer.width ? toScreen(layer.width, scale) : undefined;

  // Map fontWeight -> Konva fontStyle (simple mapping for now)
  const fontStyle =
    typeof layer.fontWeight === 'number'
      ? layer.fontWeight >= 600
        ? 'bold'
        : 'normal'
      : layer.fontWeight === 'bold'
      ? 'bold'
      : 'normal';

  return (
    <KText
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

      // selection / UX
      onClick={() => onSelect(layer.id)}
      onTap={() => onSelect(layer.id)}
      onDragStart={() => onSelect(layer.id)}
      onMouseEnter={(e) => {
        const container = e.target.getStage()?.container();
        if (container) container.style.cursor = 'move';
      }}
      onMouseLeave={(e) => {
        const container = e.target.getStage()?.container();
        if (container) container.style.cursor = 'default';
      }}

      // persist position in ORIGINAL pixels while dragging
      onDragMove={(e) => {
        const node = e.target;
        const nextX = fromScreen(node.x(), scale);
        const nextY = fromScreen(node.y(), scale);
        updateTextProps(layer.id, { x: nextX, y: nextY });
      }}
      onDragEnd={(e) => {
        const node = e.target;
        const nextX = fromScreen(node.x(), scale);
        const nextY = fromScreen(node.y(), scale);
        updateTextProps(layer.id, { x: nextX, y: nextY });
      }}

      shadowForStrokeEnabled={false}
      perfectDrawEnabled={false}
      strokeEnabled={false}

      shadowColor={selected ? 'rgba(99,102,241,0.8)' : undefined}
      shadowBlur={selected ? 6 : 0}
      shadowOpacity={selected ? 0.8 : 0}
    />
  );
};

export default TextNode;
