# 3) Types

### `src/types/editor.ts`

- **What:** The source of truth for data shapes.
- **Key models:**

  - `ProjectImage` — `{ src, originalW, originalH, name? }`
  - `DisplayState` — `{ width, height, scale }` for on-screen canvas.
  - `TextLayer` — geometry (x, y, width, rotation), style (fontFamily, fontSize, fontWeight, fill, opacity, align), z-index, etc.
  - History types — snapshots for undo/redo.

- **Why:** Everything else trusts these shapes.
- **Who uses it:** Stores, hooks, components.
- **Snippet:**
  `pixelRatio = originalW / display.width` (used when exporting).

### `src/types/editor copy.ts`

- **What:** A historical snapshot / draft of types.
- **Why:** Likely kept as reference while iterating.
- **Who uses it:** Not imported by the app (safe to remove later).

---

# 4) Low-level libs (pure functions)

### `src/lib/layout.ts`

- **What:** `fitToContainer(originalW, originalH, containerW, containerH)` → `{ width, height, scale }`.
- **Why:** Scales the image to fit a viewport while preserving aspect ratio.
- **Who uses it:** `editorStore.setDisplayByContainer` and the canvas.
- **Edge case:** If `containerW|H` is `0`, guard to avoid division by zero.

### `src/lib/coords.ts`

- **What:** Convert between original image px ↔ on-screen px:

  - `toScreen(originalPx, scale)`
  - `fromScreen(screenPx, scale)`

- **Why:** Store everything in **original pixels** for perfect export, render in screen space.
- **Who uses it:** `TextNode`, drag handlers, export.
- **Snippet:**
  `screenX = originalX * scale`, `originalX = screenX / scale`.

### `src/lib/image.ts`

- **What:** `decodePngFile(file)` → `{ src, originalW, originalH, name, lastModified }`.
- **Why:** Normalize uploads into a consistent `ProjectImage`.
- **Who uses it:** `editorStore.setImageFromFile`.
- **Edge case:** Validate MIME type `"image/png"` and error clearly.

### `src/lib/export.ts`

- **What:** Helpers to export the Konva stage at original size:

  - `exportPNGOriginal(stage, originalW, originalH, display)`
  - `downloadDataUrlPNG(dataUrl, filename)`

- **Why:** Keep exported PNG dimensions identical to the uploaded background.
- **Who uses it:** `useExportOriginal`.
- **Snippet:**
  `pixelRatio = originalW / display.width` → pass as Konva export `pixelRatio`.
- **Gotcha:** Very large originals (e.g., 8K) can spike memory during export.

### `src/lib/googleFonts.ts`

- **What:** Fetch Google Fonts catalog on the client using your public key.
- **Why:** Populate font family list dynamically.
- **Who uses it:** `fontStore`.
- **Edge case:** Map `"regular"` to weight `400`, filter non-numeric variants.

### `src/lib/format.ts`

- **What:** Tiny label/format helpers (e.g., `"1200×628 px"`).

### `src/lib/utils.ts`

- **What:** Generic helpers (clamp, guards, etc.).

---

# 5) State

### `src/store/editorStore.ts`

- **What:** The **single source of truth** (Zustand) for:

  - `project` (image metadata)
  - `view.display` (`{ width, height, scale }`)
  - `text.layers`, `text.selectedId`
  - `history` (past/present/future + limit)
  - Actions: `setImageFromFile`, `setDisplayByContainer`, `addTextLayer`, `updateTextProps`, `deleteTextLayer`, `reorderTextLayers`, `selectTextLayer`, plus `undo/redo/reset`.

- **Why:** Centralize data, support undo/redo, persist across refresh.
- **Who uses it:** All panels, canvas, toolbar, export hook.
- **What mutates history vs not:**

  - **Mutates history:** add/update/delete/reorder text; set/clear image.
  - **Does NOT mutate:** `setDisplayByContainer` (it’s just the viewport).

- **Persist strategy:** Only persist `project`, `view.display`, and `text` (not entire history) to keep storage small.
- **Gotchas:**

  - Batch updates on drag: frequent `updateTextProps` → consider throttling if needed.
  - Keep all geometry in **original px** (never store screen-space values).

### `src/store/fontStore.ts`

- **What:** Loads and caches Google Fonts list (families + variants).
- **Why:** Used by Typography controls to populate family + weight options.
- **Who uses it:** `TypographyControls` (and Konva via `useFontLoader`).
- **Gotcha:** Requires `NEXT_PUBLIC_GOOGLE_FONTS_API_KEY` in env.

---

# 6) Hooks

### `src/hooks/useViewportBox.ts`

- **What:** Measures the canvas container (`ResizeObserver`) and publishes width/height.
- **Why:** Recompute `view.display` using `fitToContainer(...)`.
- **Who uses it:** `CanvasStage` (it calls `setDisplayByContainer`).
- **Snippet:**
  `display = fitToContainer(originalW, originalH, boxW, boxH)`.

### `src/hooks/useFontLoader.ts`

- **What:** Injects a `link` to Google Fonts **CSS2** and waits on the **Font Loading API**:

  - `useFontLoader(family?: string, weights: number[] = [])` → `'idle'|'loading'|'active'|'inactive'`.

- **Why:** Ensure the selected family/weights are available before Konva draws text.
- **Who uses it:** `TypographyControls` (and indirectly benefits `TextNode`).
- **Snippet (href):**
  `https://fonts.googleapis.com/css2?family=${encode(family)}:wght@400;700&display=swap`
- **Gotcha:** On slow networks, use a timeout + show “Loading font…” feedback.

### `src/hooks/useExportOriginal.ts`

- **What:** Small orchestrator to export the stage at **original** size; verifies dimensions with an `Image()` probe; triggers download.
- **Why:** Keeps the export button simple in the toolbar.
- **Who uses it:** `CanvasToolbar` via `EditorPage`.
- **Snippet:**

  ```ts
  const pixelRatio = image.originalW / display.width;
  stage.toDataURL({ pixelRatio });
  ```

---

# 7) UI primitives

### `src/components/ui/*` (button, input, select, slider, etc.)

- **What:** Reusable, accessible components (mostly shadcn/ui + Tailwind).
- **Why:** Consistent UX without rewriting controls.
- **Who uses it:** All panels (typography/transform/alignment/appearance), toolbar.

### `src/components/theme-provider/index.tsx`

- **What:** Light/dark theme provider.
- **Why:** Wraps the app to support theming.
- **Who uses it:** `layout.tsx`.

### `src/components/modeToggle/index.tsx`

- **What:** UI control to toggle theme.
- **Why:** Handy in the toolbar or header.

---

# 8) Canvas building blocks

### `src/components/editor/canvas/FileDropTarget.tsx`

- **What:** Drop zone to accept PNG files (or click to choose).
- **Why:** Fast way to set/replace the background image.
- **Who uses it:** `CanvasStage` (when no image yet).

### `src/components/editor/canvas/TextNode.tsx`

- **What:** A Konva `<Text>` wrapper that:

  - Renders **screen-space** values by converting from original px (`toScreen`).
  - Handles drag (on each move, convert back to original px and update store).
  - Shows a selection “glow” (shadow) when selected.

- **Why:** Encapsulates the tricky “store originals, render scaled” part.
- **Who uses it:** `CanvasStage` when mapping `layers`.
- **Snippet:**

  ```ts
  const x = toScreen(layer.x, scale);
  onDragMove={({ target }) =>
    updateTextProps(id, { x: fromScreen(target.x(), scale) })}
  ```

- **Gotcha:** If you add resize/rotate handles later, keep all conversions consistent.

### `src/components/editor/canvas/CanvasStage.tsx`

- **What:** The Konva stage + layers:

  - Background image layer (non-interactive).
  - Text layers (interactive).
  - Selection clearing on empty stage click.
  - Connects viewport size → `fitToContainer`.

- **Why:** Central canvas where editing happens.
- **Who uses it:** `EditorPage` center column.
- **Event flow:** pointer drag → `updateTextProps` → store updates → component re-renders → Konva repaint.

### `src/components/editor/canvas/CanvasMetaBar.tsx`

- **What:** Shows three quick stats: `Original`, `On-screen`, and `Export` (same as original).
- **Why:** Confidence that export matches the source dimensions.
- **Who uses it:** `EditorPage` above the canvas.

---

# 9) Editor panels

### `src/components/editor/top/CanvasToolbar.tsx`

- **What:** Export, reset, undo/redo buttons (and slots for future tools).
- **Why:** Global actions for the current project.
- **Who uses it:** `EditorPage` top bar.
- **Reads:** `useHistory` (to enable/disable undo/redo).
- **Calls:** `useEditorActions().{undo,redo,clearImage}` and `useExportOriginal().exportOriginal`.

### `src/components/editor/left/LayersPanel.tsx`

- **What:** List of text layers with add/delete/reorder, inline label, selection.
- **Why:** Manage stacking order and which layer is active.
- **Who uses it:** `EditorPage` left column.
- **Reads:** `text.layers`, `text.selectedId`.
- **Calls:** `addTextLayer`, `deleteTextLayer`, `reorderTextLayers`, `selectTextLayer`.

### Right panel sections (composed by `PropertiesPanel.tsx`)

_All of these read the **selected** layer and call `updateTextProps`._

- **`Section.tsx`**

  - **What:** Simple titled wrapper for a group of controls.
  - **Why:** Visual consistency across sections.
  - **Who:** Used by all right-panel controls.

- **`TypographyControls.tsx`**

  - **What:** Font family (from `fontStore`), size (slider + number), weight (from variants), lazy load selected family via `useFontLoader`.
  - **Why:** Covers required typography features.
  - **Reads:** `layer.fontFamily`, `fontStore.fonts`.
  - **Calls:** `updateTextProps(id, { fontFamily, fontSize, fontWeight })`.
  - **Gotcha:** Map `"regular"` → `400`; numeric `100..900` preferred for precision.

- **`TransformControls.tsx`**

  - **What:** X/Y numeric inputs; a drag-to-rotate stripe.
  - **Why:** Precise positioning + rotation.
  - **Calls:** `updateTextProps(id, { x, y, rotation })`.
  - **Snippet:** accumulate mouse delta → `nextRotation = startRotation + delta`.

- **`SnapControls.tsx`**

  - **What:** Snap buttons (center, edges) and keyboard nudges (arrows, with Shift for larger steps).
  - **Why:** Fast alignment to canvas edges and center lines.
  - **Reads:** `view.display` (to know canvas size); `text.selectedId`.
  - **Calls:** `updateTextProps(id, { x, y })` with computed positions.
  - **Math:**

    - Center X: `x = (originalW - layerWidth) / 2`
    - Center Y: `y = (originalH - lineHeightPx) / 2`

  - **Gotcha:** Remember all values are **original px**, not screen px.

- **`AlignmentControls.tsx`**

  - **What:** Text alignment (`left|center|right`) + optional text box width to enable wrapping.
  - **Why:** Multi-line alignment and wrapping.
  - **Calls:** `updateTextProps(id, { align, width })`.

- **`AppearanceControls.tsx`**

  - **What:** Fill color, opacity %, line-height (optional extra styling).
  - **Why:** Visual styling.
  - **Calls:** `updateTextProps(id, { fill, opacity, lineHeight })`.

- **`PropertiesPanel.tsx`**

  - **What:** The orchestrator: shows an empty-state if nothing selected; otherwise renders sections (Typography → Transform → Snap → Alignment → Appearance).
  - **Why:** A single, predictable editor surface for the active layer.
  - **Reads:** `text.selectedId`, `text.layers`.

---

# 10) Composition

### `src/components/editor/EditorPage.tsx`

- **What:** The 3-column layout:

  - **Left:** `LayersPanel`
  - **Center:** `CanvasToolbar`, `CanvasMetaBar` (optional), `CanvasStage`
  - **Right:** `PropertiesPanel`

- **Why:** Puts the whole editor together.
- **Who uses it:** `src/app/page.tsx`.
- **Data & event flow summary here:** The page doesn’t hold state; it wires components that read/write the **Zustand store** and call **hooks** (like export).
- **`EditorPage copy.tsx`** — A previous iteration kept around as a reference (not used).

---

# 11) Public assets

### `public/*.svg` (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`)

- **What:** Icons/illustrations for UI or placeholders.
- **Why:** Lightweight vector assets.
- **Who uses it:** Any component via `<img src="/file.svg" />` or as background images.

---

## Data flow (end-to-end recap)

1. **User uploads PNG** → `FileDropTarget` → `editorStore.actions.setImageFromFile(file)` → `lib/image.decodePngFile` returns `{ src, originalW, originalH }` → store saves it in `project.image`.
2. **Viewport fits canvas** → `CanvasStage` uses `useViewportBox` → `editorStore.actions.setDisplayByContainer(boxW, boxH)` → `lib/layout.fitToContainer` computes `{ width, height, scale }` → store updates `view.display`.
3. **Render** → `CanvasStage` draws background image at `display.width/height`.
   Each `TextNode` renders by converting original → screen:
   `screenX = layer.x * display.scale`.
4. **Edit text** (right panel) → sections call `updateTextProps` with **original px** (not screen px). Store updates → Konva re-renders.
5. **Drag on canvas** → `TextNode` converts back to original on each move:
   `nextX = target.x() / display.scale` → `updateTextProps`.
6. **Snap & nudge** → `SnapControls` computes new `x,y` based on **originalW/H** from the image (through display scale) and calls `updateTextProps`.
7. **Fonts** → `fontStore` fetches families; `TypographyControls` picks a family; `useFontLoader` injects CSS2 + waits for load before rendering.
8. **Undo/Redo** → actions that change text or project push a snapshot to history; toolbar triggers `undo/redo`.
9. **Export** → `useExportOriginal` calculates `pixelRatio = originalW / display.width`, calls `exportPNGOriginal` → downloaded PNG matches original dimensions exactly.

---

## Trade-offs & gotchas (quick hits)

- **Original px everywhere:** Perfect exports and stable math, at the cost of always converting to/from screen space when rendering and dragging.
- **Zustand store:** Super light and flexible, but you must be disciplined about which actions push to history and which don’t (viewport sizing should not).
- **Konva export:** Very large images can be heavy in memory; consider warning if `originalW*originalH` is huge.
- **Fonts on slow networks:** `useFontLoader` handles a timeout & status; UI should show “Loading…” to avoid jank.
- **Keyboard/drag batching:** In long drags or key-repeat nudges, consider throttling `updateTextProps` to keep the store updates lean.

That’s the full tour. If you read files in this order, you’ll always meet the “helpers” before the things that depend on them, and the editor logic will click into place fast.
