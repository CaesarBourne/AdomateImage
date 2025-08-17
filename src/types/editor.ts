// src/types/editor.ts
export type ProjectImage = {
  src: string;
  originalW: number;
  originalH: number;
  name?: string;
  lastModified?: number;
};

export type DisplayState = {
  width: number;
  height: number;
  scale: number;
};

export type EditorProjectSlice = {
  projectId: string;
  image?: ProjectImage;
};

export type EditorViewSlice = {
  display: DisplayState;
};

/* ---- Text types (new) ---- */
export type TextAlign = 'left' | 'center' | 'right';

export type TextLayer = {
  id: string;
  text: string;
  // geometry in ORIGINAL image pixels:
  x: number;
  y: number;
  width?: number;
  rotation: number;
  lineHeight?: number;

  // style
  fontFamily: string;
  fontSize: number;                 // original px
  fontWeight: number | 'normal' | 'bold';
  fill: string;
  opacity: number;                  // 0..1
  align: TextAlign;

  z: number;
  locked?: boolean;
};

export type EditorTextSlice = {
  layers: TextLayer[];
  selectedId: string | null;
};

export type EditorActions = {
  commit: () => void;
  undo: () => void;
  redo: () => void;
  resetHistory: () => void;
  resetCanvas: () => void; // <-- add this
  setImageFromFile: (file: File) => Promise<void>;
  clearImage: () => void;
  setDisplayByContainer: (w: number, h: number) => void;

  addTextLayer: (defaults?: Partial<TextLayer>) => string;
  selectTextLayer: (id: string | null) => void;
  updateTextProps: (id: string, patch: Partial<TextLayer>) => void;
  deleteTextLayer: (id: string) => void;
  reorderTextLayers: (ids: string[]) => void;
};

export type HistoryEntry = {
  project: EditorProjectSlice;
  text: EditorTextSlice;
};

export type HistorySlice = {
  past: HistoryEntry[];
  present: HistoryEntry;
  future: HistoryEntry[];
  limit: number;
};

export type HistoryActions = {
  undo: () => void;
  redo: () => void;
  commit: () => void; // push new snapshot
  resetHistory: () => void;
};

// extend the state with the text slice:
export type EditorState = {
  project: EditorProjectSlice;
  view: EditorViewSlice;
  text: EditorTextSlice;
  history: HistorySlice;
  actions: EditorActions & HistoryActions;
};