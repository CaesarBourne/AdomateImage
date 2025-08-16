export function shortFileLabel(
  fileName?: string,
  opts?: { maxBase?: number; ellipsis?: string }
): string {
  if (!fileName) return '—';
  const { maxBase = 8, ellipsis = '…' } = opts ?? {};

  const dot = fileName.lastIndexOf('.');
  const base = (dot > 0 ? fileName.slice(0, dot) : fileName).trim();
  const ext  = dot > -1 ? fileName.slice(dot + 1).toLowerCase() : '';

  const head = base.length > maxBase ? base.slice(0, maxBase) + ellipsis : base;
  return ext ? `${head}.${ext}` : head;
}
