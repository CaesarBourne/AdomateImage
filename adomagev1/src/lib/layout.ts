
import { DisplayState } from "@/types/editor";

export const fitToContainer = (
  originalW: number,
  originalH: number,
  boxW: number,
  boxH: number
): DisplayState => {
  if (originalW <= 0 || originalH <= 0 || boxW <= 0 || boxH <= 0) {
    return { width: 0, height: 0, scale: 0 };
  }
  const scale = Math.min(boxW / originalW, boxH / originalH);
  const width = Math.floor(originalW * scale);
  const height = Math.floor(originalH * scale);
  return { width, height, scale };
};
