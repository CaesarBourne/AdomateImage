// src/hooks/useExportOriginal.ts
'use client';

import { useCallback, useMemo } from 'react';
import type Konva from 'konva';
import { useDisplay, useImageMeta } from '@/store/editorStore';
import { exportPNGOriginal, downloadDataUrlPNG } from '@/lib/export';

export function useExportOriginal(stageRef: React.RefObject<Konva.Stage | null>) {
  const image = useImageMeta();
  const display = useDisplay();

  const canExport = useMemo(() => {
    return Boolean(stageRef.current && image && display.width > 0 && display.height > 0);
  }, [stageRef, image, display.width, display.height]);

  const exportOriginal = useCallback(() => {
    if (!stageRef.current || !image || display.width <= 0 || display.height <= 0) return;

    const dataUrl = exportPNGOriginal(
      stageRef.current,
      image.originalW,
      image.originalH,
      display
    );

    const probe = new Image();
    probe.onload = () => {
      const expected = `${image.originalW}x${image.originalH}`;
      const actual = `${probe.naturalWidth}x${probe.naturalHeight}`;
      const pixelRatio = image.originalW / display.width;


      // console check
      console.log(
        '%cExport check',
        'color:#fff;background:#16a34a;padding:2px 6px;border-radius:4px;',
        { expected, actual, pixelRatio, display }
      );
      if (actual !== expected) console.warn('Export size mismatch!', { expected, actual });
    };
    probe.src = dataUrl;

    downloadDataUrlPNG(dataUrl, image.name ?? 'export');
  }, [stageRef, image, display]);

  return { canExport, exportOriginal };
}
