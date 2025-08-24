## A) Requirement → Code Mapping (Checklist)

### 1) **Upload PNG & aspect-ratio fit**

**What**
Upload a PNG; the editor canvas should match the image’s aspect ratio.

**Where implemented**

- `src/components/editor/canvas/FileDropTarget.tsx` → user selects/drops file
- `src/store/editorStore.ts` → `actions.setImageFromFile`
- `src/lib/image.ts` → `decodePngFile` (reads PNG, returns `{src, originalW, originalH}`)
- `src/hooks/useViewportBox.ts` + `src/lib/layout.ts` → compute display fit
- `src/components/editor/canvas/CanvasStage.tsx` → calls `setDisplayByContainer(...)`

**How it works**

- Drop/choose triggers `setImageFromFile(file)`.
- The store uses `decodePngFile` to get original dimensions, saves to `project.image`.
- `CanvasStage` measures its viewport (`useViewportBox`) and calls `setDisplayByContainer`; `fitToContainer` computes `{ width, height, scale }` preserving aspect ratio.

**Data Flow**

- **Write**: `FileDropTarget` → `editorStore.actions.setImageFromFile` (sets `project.image`)
- **Read**: `CanvasStage` reads `project.image` and `view.display`
- **Fit math**: `display = fitToContainer(originalW, originalH, boxW, boxH)`

**Evidence**

_FileDropTarget.tsx (excerpt)_

```tsx
// .../canvas/FileDropTarget.tsx
<input
  type="file"
  accept="image/png"
  onChange={(e) => onFile(e.target.files?.[0]!)}
/>
```

_editorStore.ts (excerpt)_

```ts
// store/editorStore.ts
async setImageFromFile(file) {
  const img = await decodePngFile(file);
  set((state) => ({
    project: { projectId: newProjectId(), image: img },
    view: state.view,
  }));
}
```

_layout.ts (fit)_

```ts
// lib/layout.ts
export function fitToContainer(ow, oh, cw, ch) {
  const scale = Math.min(cw / ow, ch / oh);
  return {
    width: Math.round(ow * scale),
    height: Math.round(oh * scale),
    scale,
  };
}
```

**Gotchas**

- Non-PNG uploads are rejected by `accept="image/png"`; you likely also validate in `decodePngFile`.
- If container is tiny (0×0), guard against division by zero in `fitToContainer`.

---

### 2) **Add & manipulate text layers (drag/resize/rotate)**

**What**
Multiple text layers; move/resize/rotate independently.

**Where implemented**

- `src/store/editorStore.ts` → `addTextLayer`, `updateTextProps`, `deleteTextLayer`
- `src/components/editor/canvas/TextNode.tsx` → Konva `<Text>` with drag + selection
- `src/components/editor/right/propertiesPanel/TransformControls.tsx` → X/Y numeric + drag-to-rotate UI
- (Resize width) `AlignmentControls.tsx` often holds width/align in your panel structure.

**How it works**

- Add layer from `LayersPanel` or toolbar → store pushes a `TextLayer` with defaults.
- On canvas: `TextNode` renders in **screen px** and on drag converts back to **original px** before calling `updateTextProps`.
- Rotation controlled in `TransformControls` (drag stripe adds delta).

**Data Flow**

- **Store** keeps geometry in **original px**.
- **TextNode render**: `screen = original * display.scale`
- **Drag**: `original = screen / display.scale` → `updateTextProps(id, { x, y })`
- **Rotate**: `updateTextProps(id, { rotation })`

**Evidence**

_TextNode.tsx (drag & convert)_

```tsx
// canvas/TextNode.tsx
onDragMove={(e) => {
  const node = e.target;
  updateTextProps(layer.id, {
    x: fromScreen(node.x(), scale),
    y: fromScreen(node.y(), scale),
  });
}}
```

_TransformControls.tsx (rotate)_

```tsx
// .../TransformControls.tsx
const onMove = (evt: MouseEvent) => {
  const delta = evt.clientX - startX;
  update(layer.id, { rotation: startRotation + delta });
};
```

**Gotchas**

- Konva Text resizing via width: set `layer.width` (in original px) to enable wrapping; keep conversions consistent.
- Consider throttling `updateTextProps` during drag for perf.

---

### 3) **Edit text properties (family/size/weight/color/opacity/align/multi-line)**

**What**
Typography controls for Google Fonts family, size, weight; color & opacity; alignment; multi-line.

**Where implemented**

- `src/components/editor/right/propertiesPanel/TypographyControls.tsx`
- `src/store/fontStore.ts` + `src/lib/googleFonts.ts` → fetch fonts;
- `src/hooks/useFontLoader.ts` → load Google Fonts (CSS2 + Font Loading API)
- `src/components/editor/right/propertiesPanel/AppearanceControls.tsx` → color, opacity
- `src/components/editor/right/propertiesPanel/AlignmentControls.tsx` → align + width for wrapping
- Multi-line: `TextLayer.text` supports `\n`; Konva `wrap="word"` set in `TextNode.tsx`.

**How it works**

- Font list fetched once into `fontStore`; families populate a `<select>`.
- On change, `updateTextProps(id, { fontFamily | fontSize | fontWeight })`.
- `useFontLoader(family, [weights])` injects a CSS2 link + waits for `document.fonts`.
- `AppearanceControls` updates `fill` & `opacity`.
- `AlignmentControls` updates `align` and optional `width` to wrap text.

**Data Flow**

- Panels **read** selected layer from store; **write** via `updateTextProps`.
- **Konva draw** uses the updated style immediately.

**Evidence**

_TypographyControls.tsx (family/size/weight)_

```tsx
// .../TypographyControls.tsx
<select
  value={layer.fontFamily}
  onChange={(e) => update(layer.id, { fontFamily: e.target.value })}
/>
<input
  type="number"
  value={layer.fontSize}
  onChange={(e) => update(layer.id, { fontSize: Number(e.target.value) })}
/>
<select
  value={layer.fontWeight}
  onChange={(e) => update(layer.id, { fontWeight: Number(e.target.value) })}
/>
```

_TextNode.tsx (wrap + style)_

```tsx
// canvas/TextNode.tsx
<KText
  text={layer.text}
  fontFamily={layer.fontFamily}
  fontSize={toScreen(layer.fontSize, scale)}
  fill={layer.fill}
  opacity={layer.opacity}
  align={layer.align}
  lineHeight={layer.lineHeight ?? 1.2}
  wrap="word"
/>
```

**Gotchas**

- Map `"regular"` → `400`; numeric `100..900` preferred for precision.
- Use `lineHeight` carefully; Konva expects a multiplier (not px).

---

### 4) **Reorder layers (stacking order)**

**What**
Change z-index / stacking order.

**Where implemented**

- `src/components/editor/left/LayersPanel.tsx` (UI for order)
- `src/store/editorStore.ts` → `reorderTextLayers(nextOrderIds)` recomputes `z`

**How it works**

- Panel creates a new order array of ids and calls `reorderTextLayers`.
- Store maps ids → layers and assigns descending `z` (topmost first).

**Data Flow**

- **Write:** `reorderTextLayers` mutates `text.layers` and **pushes history**.

**Evidence**

_editorStore.ts (reorder)_

```ts
// store/editorStore.ts
reorderTextLayers(nextOrderIds) {
  const byId = new Map(state.text.layers.map((l) => [l.id, l]));
  const reordered = nextOrderIds.map((id) => byId.get(id)).filter(Boolean);
  const total = reordered.length;
  const withZ = reordered.map((l, idx) => ({ ...l, z: total - idx }));
  return { text: { ...state.text, layers: withZ } };
}
```

**Gotchas**

- Always reassign `z` consistently (no gaps), so sorting `layers.sort((a,b)=>a.z-b.z)` is stable.

---

### 5) **Export final PNG at original dimensions**

**What**
Export PNG with exact original width/height.

**Where implemented**

- `src/hooks/useExportOriginal.ts` → `exportOriginal()`
- `src/lib/export.ts` → `exportPNGOriginal(stage, originalW, originalH, display)` and `downloadDataUrlPNG(...)`

**How it works**

- Compute `pixelRatio = image.originalW / display.width`.
- Konva `toDataURL({ pixelRatio })` upscales the on-screen canvas to original dimensions.
- Download the data URL.

**Data Flow**

- **Read:** `image.originalW/H`, `view.display.width`
- **No store writes**; a download side-effect only.

**Evidence**

_useExportOriginal.ts (excerpt)_

```ts
// hooks/useExportOriginal.ts
const pixelRatio = image.originalW / display.width;
const dataUrl = exportPNGOriginal(
  stageRef.current,
  image.originalW,
  image.originalH,
  display
);
downloadDataUrlPNG(dataUrl, image.name ?? "export");
```

**Gotchas**

- Very large exports can spike memory; consider warning for > \~30MP.

---

### 6) **Canvas UX: snap-to center (V/H), arrow key nudge**

**What**
Snap to canvas center/edges; arrow key nudging.

**Where implemented**

- **Snap**: `src/components/editor/right/propertiesPanel/SnapControls.tsx` (listed in tree)
- **Keys**: Often handled in `CanvasStage.tsx` or globally in `EditorPage.tsx` with `keydown` listeners.

**How it works (intended)**

- Snap buttons compute new `x,y` (in **original px**) using image original size and layer size, then call `updateTextProps`.
- Arrow keys nudge `x,y` by ±1 px (Shift = ±10 px), again in **original px**.

**Data Flow**

- **Read:** `project.image.originalW/H`, current `layer.x/y`, `view.display.scale` (if needed to estimate on-screen feedback)
- **Write:** `updateTextProps(id, { x, y })`

**Evidence (suggested skeleton if not yet implemented)**

_SnapControls.tsx (suggested ≤20 lines)_

```tsx
// .../SnapControls.tsx
const centerX = Math.round((image.originalW - (layer.width ?? 0)) / 2);
const centerY = Math.round((image.originalH - layer.fontSize) / 2);
<button onClick={() => update(layer.id, { x: centerX })}>Center X</button>
<button onClick={() => update(layer.id, { y: centerY })}>Center Y</button>
```

_CanvasStage.tsx (keys skeleton)_

```tsx
useEffect(() => {
  const onKey = (e: KeyboardEvent) => {
    if (!selectedId) return;
    const step = e.shiftKey ? 10 : 1;
    if (e.key === "ArrowLeft") update(selectedId, { x: layer.x - step });
    if (e.key === "ArrowRight") update(selectedId, { x: layer.x + step });
    if (e.key === "ArrowUp") update(selectedId, { y: layer.y - step });
    if (e.key === "ArrowDown") update(selectedId, { y: layer.y + step });
  };
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, [selectedId, layer?.x, layer?.y]);
```

**Gotchas**

- Always operate in **original px**. Don’t nudge in screen px.
- If `SnapControls.tsx` isn’t wired yet, it’s the best place to centralize snap actions.

---

### 7) **Undo/Redo (≥20 steps) + visible indicator**

**What**
At least 20 steps; visible indicator to the user.

**Where implemented**

- `src/store/editorStore.ts` → `history` slice with `past`, `present`, `future`, `limit: 20` and `undo/redo/commit`
- `src/components/editor/top/CanvasToolbar.tsx` → shows Undo/Redo buttons (and can reflect disabled state).

**How it works**

- Every mutating text/project action pushes a snapshot (`present`) onto `past` (trimming to limit).
- Undo pops from `past` to `present`; redo shifts from `future` to `present`.
- Toolbar buttons call `actions.undo()` / `actions.redo()`.

**Data Flow**

- **Write**: all layer mutations and image changes push history.
- **Read**: toolbar can inspect availability (e.g., `history.past.length > 0`).

**Evidence**

_editorStore.ts (history init)_

```ts
// store/editorStore.ts
history: {
  past: [],
  present: snapshot(initialProject, initialText),
  future: [],
  limit: 20,
},
```

_editorStore.ts (undo/redo excerpts)_

```ts
undo() {
  const { history } = get();
  if (history.past.length === 0) return;
  const past = [...history.past];
  const previous = past.pop()!;
  const future = [history.present, ...history.future];
  set({ project: previous.project, text: previous.text,
        history: { past, present: previous, future, limit: history.limit }});
}
```

**Gotchas**

- Consider batching drag updates (commit on pointer-up) if history feels too granular.

---

### 8) **Autosave to localStorage; Reset to blank**

**What**
Persist on refresh; “Reset” clears design.

**Where implemented**

- `src/store/editorStore.ts` uses `persist` (`name: 'canvas-project'`)
- `actions.resetCanvas()` restores fresh `project/text/view/display/history`
- `src/components/editor/top/CanvasToolbar.tsx` includes a Reset button (by design)

**How it works**

- Zustand persist writes selected slices into localStorage on change.
- Reset builds a new empty project and clears history.

**Data Flow**

- **Persisted**: `project`, `view.display`, `text` (partial; excludes entire history by design).

**Evidence**

_editorStore.ts (persist config)_

```ts
// store/editorStore.ts
persist(
  (set, get) => ({
    /* ... */
  }),
  {
    name: "canvas-project",
    partialize: (state) => ({
      project: state.project,
      view: { display: state.view.display },
      text: state.text,
    }),
  }
);
```

**Gotchas**

- If you want to persist history too, add it to `partialize`—but it grows quickly.

---
