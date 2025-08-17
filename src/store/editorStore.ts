// src/store/editorStore.ts
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { fitToContainer } from "@/lib/layout";
import { decodePngFile } from "@/lib/image";
import type {
  EditorState,
  EditorProjectSlice,
  EditorTextSlice,
  HistoryEntry,
  TextLayer,
} from "@/types/editor";

const newProjectId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `proj_${Math.random().toString(36).slice(2)}`;

const newTextId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `text_${Math.random().toString(36).slice(2)}`;

const snapshot = (p: EditorProjectSlice, t: EditorTextSlice): HistoryEntry => ({
  project: structuredClone(p),
  text: structuredClone(t),
});

const trimPast = (past: HistoryEntry[], limit: number): HistoryEntry[] =>
  past.length > limit ? past.slice(past.length - limit) : past;

const initialProject: EditorProjectSlice = {
  projectId: newProjectId(),
  image: undefined,
};
const initialText: EditorTextSlice = { layers: [], selectedId: null };

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      project: initialProject,
      view: { display: { width: 0, height: 0, scale: 0 } },
      text: initialText,

      history: {
        past: [],
        present: snapshot(initialProject, initialText),
        future: [],
        limit: 20,
      },

      actions: {
        // ---- History controls ----
        commit() {
          // Optional external commit if you ever batch changes outside
          const { project, text, history } = get();
          const past = trimPast(
            [...history.past, history.present],
            history.limit
          );
          set({
            history: {
              past,
              present: snapshot(project, text),
              future: [], // clear future on new branch
              limit: history.limit,
            },
          });
        },

        undo() {
          const { history } = get();
          if (history.past.length === 0) return;

          const past = [...history.past];
          const previous = past.pop()!;
          const future = [history.present, ...history.future];

          set({
            project: previous.project,
            text: previous.text,
            history: { past, present: previous, future, limit: history.limit },
          });
        },

        redo() {
          const { history } = get();
          if (history.future.length === 0) return;

          const [next, ...future] = history.future;
          const past = [...history.past, history.present];

          set({
            project: next.project,
            text: next.text,
            history: { past, present: next, future, limit: history.limit },
          });
        },

        resetHistory() {
          const { project, text, history } = get();
          set({
            history: {
              past: [],
              present: snapshot(project, text),
              future: [],
              limit: history.limit,
            },
          });
        },

        // Optional: a single action that truly resets the canvas + history
        resetCanvas() {
          set((state) => {
            const project: EditorProjectSlice = {
              projectId: newProjectId(),
              image: undefined,
            };
            const text: EditorTextSlice = { layers: [], selectedId: null };
            return {
              project,
              text,
              view: {
                ...state.view,
                display: { width: 0, height: 0, scale: 0 },
              },
              history: {
                past: [],
                present: snapshot(project, text),
                future: [],
                limit: state.history.limit,
              },
            };
          });
        },

        // ---- Project / view ----
        async setImageFromFile(file) {
          const img = await decodePngFile(file);
          set((state) => {
            const project: EditorProjectSlice = {
              projectId: newProjectId(),
              image: img,
            };
            const text = state.text; // unchanged
            const past = trimPast(
              [...state.history.past, state.history.present],
              state.history.limit
            );
            return {
              project,
              view: state.view, // Canvas recalculates display
              text,
              history: {
                past,
                present: snapshot(project, text),
                future: [],
                limit: state.history.limit,
              },
            };
          });
        },

        clearImage() {
          set((state) => {
            const project: EditorProjectSlice = {
              projectId: newProjectId(),
              image: undefined,
            };
            const text = state.text; // keep text unless you want to clear it too
            const past = trimPast(
              [...state.history.past, state.history.present],
              state.history.limit
            );
            return {
              project,
              view: {
                ...state.view,
                display: { width: 0, height: 0, scale: 0 },
              },
              text,
              history: {
                past,
                present: snapshot(project, text),
                future: [],
                limit: state.history.limit,
              },
            };
          });
        },

        setDisplayByContainer(containerW, containerH) {
          // View-only; do NOT push to history
          const img = get().project.image;
          if (!img) return;
          const display = fitToContainer(
            img.originalW,
            img.originalH,
            containerW,
            containerH
          );
          set((state) => ({ view: { ...state.view, display } }));
        },

        // ---- Text actions (all push history) ----
        addTextLayer(defaults) {
          const img = get().project.image;
          if (!img) throw new Error("No image loaded");

          const id = newTextId();
          const cx = img.originalW / 2;
          const cy = img.originalH / 2;
          const zMin = get().text.layers.length
            ? get().text.layers.reduce((m, l) => Math.min(m, l.z), Infinity)
            : 0;
          const zForNew = Number.isFinite(zMin) ? zMin - 1 : 0;

          const newLayer: TextLayer = {
            id,
            text: defaults?.text ?? "Text layer",
            x: defaults?.x ?? Math.max(0, cx - 200),
            y: defaults?.y ?? Math.max(0, cy - 40),
            width: defaults?.width ?? Math.round(img.originalW * 0.6),
            rotation: defaults?.rotation ?? 0,
            fontFamily: defaults?.fontFamily ?? "Inter",
            fontSize: defaults?.fontSize ?? 64,
            fontWeight: defaults?.fontWeight ?? "bold",
            fill: defaults?.fill ?? "#ffffff",
            opacity: defaults?.opacity ?? 1,
            align: defaults?.align ?? "left",
            lineHeight: defaults?.lineHeight ?? 1.2,
            z: zForNew,
            locked: defaults?.locked ?? false,
          };

          set((state) => {
            const text: EditorTextSlice = {
              layers: [...state.text.layers, newLayer],
              selectedId: id,
            };
            const past = trimPast(
              [...state.history.past, state.history.present],
              state.history.limit
            );
            return {
              text,
              history: {
                past,
                present: snapshot(state.project, text),
                future: [],
                limit: state.history.limit,
              },
            };
          });

          return id;
        },

        selectTextLayer(id) {
          // selection change isn’t destructive; skip history
          set((state) => ({ text: { ...state.text, selectedId: id } }));
        },

        updateTextProps(id, patch) {
          set((state) => {
            const text: EditorTextSlice = {
              ...state.text,
              layers: state.text.layers.map((l) =>
                l.id === id ? { ...l, ...patch } : l
              ),
            };
            const past = trimPast(
              [...state.history.past, state.history.present],
              state.history.limit
            );
            return {
              text,
              history: {
                past,
                present: snapshot(state.project, text),
                future: [],
                limit: state.history.limit,
              },
            };
          });
        },

        deleteTextLayer(id) {
          set((state) => {
            const nextLayers = state.text.layers.filter((l) => l.id !== id);
            const text: EditorTextSlice = {
              layers: nextLayers,
              selectedId:
                state.text.selectedId === id ? null : state.text.selectedId,
            };
            const past = trimPast(
              [...state.history.past, state.history.present],
              state.history.limit
            );
            return {
              text,
              history: {
                past,
                present: snapshot(state.project, text),
                future: [],
                limit: state.history.limit,
              },
            };
          });
        },

        reorderTextLayers(nextOrderIds) {
          set((state) => {
            const byId = new Map(state.text.layers.map((l) => [l.id, l]));
            const reordered = nextOrderIds
              .map((id) => byId.get(id))
              .filter((x): x is NonNullable<typeof x> => Boolean(x));

            const total = reordered.length;
            const withZ = reordered.map((l, idx) => ({ ...l, z: total - idx }));

            const text: EditorTextSlice = { ...state.text, layers: withZ };
            const past = trimPast(
              [...state.history.past, state.history.present],
              state.history.limit
            );
            return {
              text,
              history: {
                past,
                present: snapshot(state.project, text),
                future: [],
                limit: state.history.limit,
              },
            };
          });
        },
      },
    }),
    {
      name: "canvas-project",
      partialize: (state) => ({
        project: state.project,
        view: { display: state.view.display },
        text: state.text,
        // You can also persist history if you want:
        // history: state.history,
      }),
    }
  )
);

// selectors
export const useHasImage = () =>
  useEditorStore((s) => Boolean(s.project.image));
export const useImageMeta = () => useEditorStore((s) => s.project.image);
export const useDisplay = () => useEditorStore((s) => s.view.display);
export const useEditorActions = () => useEditorStore((s) => s.actions);

// text
export const useTextLayers = () => useEditorStore((s) => s.text.layers);
export const useSelectedId = () => useEditorStore((s) => s.text.selectedId);
export const useReorderTextLayers = () =>
  useEditorStore((s) => s.actions.reorderTextLayers);

// history
export const useHistory = () => useEditorStore((s) => s.history);
