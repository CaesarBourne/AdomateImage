// lib/export.ts
import type Konva from 'konva';
import type { DisplayState } from '@/types/editor';


//  Compute the pixelRatio needed so that exporting the VISIBLE Stage
//  yields an image whose pixel dimensions match the ORIGINAL image dimensions.
//
//  Assumes your Stage width/height == display.width/display.height,
//  and display.scale preserves the original aspect ratio.

export function computePixelRatioForOriginal(
  originalW: number,
  originalH: number,
  display: DisplayState
): number {
  if (originalW <= 0 || originalH <= 0) {
    throw new Error('Invalid original dimensions.');
  }
  if (display.width <= 0 || display.height <= 0 || display.scale <= 0) {
    throw new Error('Display is not ready.');
  }
  // Because fitToContainer preserves aspect, these should be equal.
  const rW = originalW / display.width;
  const rH = originalH / display.height;
  // Be safe and pick the larger one if there’s a rounding mismatch.
  return Math.max(rW, rH);
}

/**
 Export the current visible Stage as a PNG at ORIGINAL pixel dimensions.
 Returns a data URL (e.g., "data:image/png;base64,...").
 */
export function exportPNGOriginal(
  stage: Konva.Stage,
  originalW: number,
  originalH: number,
  display: DisplayState
): string {
  const pixelRatio = computePixelRatioForOriginal(originalW, originalH, display);

  const dataUrl = stage.toDataURL({
    pixelRatio,
    mimeType: 'image/png',
  });
  return dataUrl;
}

/**
 * Optional helper to trigger a download in the browser.
 */
export function downloadDataUrlPNG(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
