// src/store/editorStore.ts
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fitToContainer } from '@/lib/layout';
import { decodePngFile } from '@/lib/image';
import type { EditorState, TextLayer } from '@/types/editor';

const newProjectId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `proj_${Math.random().toString(36).slice(2)}`;

const newTextId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `text_${Math.random().toString(36).slice(2)}`;

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      project: { projectId: newProjectId(), image: undefined },
      view: { display: { width: 0, height: 0, scale: 0 } },

      // ✅ NEW text slice
      text: { layers: [], selectedId: null },

      actions: {
        async setImageFromFile(file) {
          const img = await decodePngFile(file);
          set((state) => ({
            project: { projectId: newProjectId(), image: img },
            view: state.view, // Canvas will recompute display
          }));
        },

        clearImage() {
          set((state) => ({
            project: { projectId: newProjectId(), image: undefined },
            view: { ...state.view, display: { width: 0, height: 0, scale: 0 } },
          }));
        },

        setDisplayByContainer(containerW, containerH) {
          const img = get().project.image;
          if (!img) return;
          const display = fitToContainer(img.originalW, img.originalH, containerW, containerH);
          set((state) => ({ view: { ...state.view, display } }));
        },

        // ---------- Text actions ----------
        addTextLayer(defaults) {
          const img = get().project.image;
          if (!img) throw new Error('No image loaded');

          const id = newTextId();
          const cx = img.originalW / 2;
          const cy = img.originalH / 2;
          // const zMax = get().text.layers.reduce((m, l) => Math.max(m, l.z), 0);
          const zMin = get().text.layers.length
    ? get().text.layers.reduce((m, l) => Math.min(m, l.z), Infinity)
    : 0;
  const zForNew = Number.isFinite(zMin) ? zMin - 1 : 0;


          const layer: TextLayer = {
            id,
            text: defaults?.text ?? 'Text layer',
            x: defaults?.x ?? Math.max(0, cx - 200),
            y: defaults?.y ?? Math.max(0, cy - 40),
width: defaults?.width ?? Math.round(img.originalW * 0.6),            
            rotation: defaults?.rotation ?? 0,
            fontFamily: defaults?.fontFamily ?? 'Inter',
            fontSize: defaults?.fontSize ?? 64,
            fontWeight: defaults?.fontWeight ?? 'bold',
            fill: defaults?.fill ?? '#ffffff',
            opacity: defaults?.opacity ?? 1,
            align: defaults?.align ?? 'left',
            lineHeight: defaults?.lineHeight ?? 1.2,
            z: zForNew,  
            locked: defaults?.locked ?? false,
          };

          set((state) => ({
            text: { layers: [...state.text.layers, layer], selectedId: id },
          }));

          return id;
        },

        selectTextLayer(id) {
          set((state) => ({ text: { ...state.text, selectedId: id } }));
        },

        updateTextProps(id, patch) {
          set((state) => ({
            text: {
              ...state.text,
              layers: state.text.layers.map((l) => (l.id === id ? { ...l, ...patch } : l)),
            },
          }));
        },

        deleteTextLayer(id) {
          set((state) => {
            const next = state.text.layers.filter((l) => l.id !== id);
            const selectedId = state.text.selectedId === id ? null : state.text.selectedId;
            return { text: { layers: next, selectedId } };
          });
        },
reorderTextLayers(nextOrderIds: string[]) {
          set((state) => {
            const byId = new Map(state.text.layers.map((l) => [l.id, l]));
            const reordered = nextOrderIds
              .map((id) => byId.get(id))
              .filter((x): x is NonNullable<typeof x> => Boolean(x));

            // Highest z on top (first item)
            const total = reordered.length;
            const withZ = reordered.map((l, idx) => ({ ...l, z: total - idx }));

            return { text: { ...state.text, layers: withZ } };
          });
        },
      },
    }),
    {
      name: 'canvas-project',
      partialize: (state) => ({
        project: state.project,
        view: { display: state.view.display },
        text: state.text,
      }),
    }
  )
);

// existing selectors
export const useHasImage     = () => useEditorStore((s) => Boolean(s.project.image));
export const useImageMeta    = () => useEditorStore((s) => s.project.image);
export const useDisplay      = () => useEditorStore((s) => s.view.display);
export const useEditorActions= () => useEditorStore((s) => s.actions);

// ✅ NEW selectors used by your panels/canvas
export const useTextLayers   = () => useEditorStore((s) => s.text.layers);
export const useSelectedId   = () => useEditorStore((s) => s.text.selectedId);
export const useReorderTextLayers = () => useEditorStore((s) => s.actions.reorderTextLayers);