

//  convert values between ORIGINAL image pixels (source of truth)
//  and SCREEN (display) pixels using the current scale.


export function toScreen(valueOriginal: number, scale: number): number {
  return valueOriginal * scale;
}

export function fromScreen(valueScreen: number, scale: number): number {
  return valueScreen / scale;
}

export function toScreenPoint(
  p: { x: number; y: number },
  scale: number
): { x: number; y: number } {
  return { x: toScreen(p.x, scale), y: toScreen(p.y, scale) };
}

export function fromScreenPoint(
  p: { x: number; y: number },
  scale: number
): { x: number; y: number } {
  return { x: fromScreen(p.x, scale), y: fromScreen(p.y, scale) };
}

export function toScreenSize(sizeOriginal: number, scale: number): number {
  return toScreen(sizeOriginal, scale);
}

export function fromScreenSize(sizeScreen: number, scale: number): number {
  return fromScreen(sizeScreen, scale);
}
