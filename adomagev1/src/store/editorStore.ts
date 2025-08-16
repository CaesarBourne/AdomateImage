'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fitToContainer } from '@/lib/layout';
import { decodePngFile } from '@/lib/image';
import { EditorState } from '@/types/editor';
// import type { EditorState } from '@/types/editor';

const newProjectId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `proj_${Math.random().toString(36).slice(2)}`;


// project.image holds the uploaded PNG (dataURL + original size)
// view.display is how big we render on screen (fit-to-container)
// actions mutate the above
 
export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      project: {
        projectId: newProjectId(),
        image: undefined,
      },
      view: {
        display: { width: 0, height: 0, scale: 0 },
      },
      actions: {
        // Load a PNG file, decode to dataURL and then read natural size,
        // and set as the current project image.
    
async setImageFromFile(file) {
  const img = await decodePngFile(file);

  set(() => ({
    project: {
      projectId: newProjectId(),
      image: img,
    },
  }));
},

        clearImage() {
          set((state) => ({
            project: { projectId: newProjectId(), image: undefined },
            view: { ...state.view, display: { width: 0, height: 0, scale: 0 } },
          }));
        },

        setDisplayByContainer(containerW, containerH) {
          const { project } = get();
          const img = project.image;
          if (!img) return;

          const display = fitToContainer(img.originalW, img.originalH, containerW, containerH);
          set((state) => ({ view: { ...state.view, display } }));
        },
      },
    }),
    {
      name: 'canvas-project', 
      partialize: (state) => ({
        project: state.project,
        view: { display: state.view.display }, 
      }),
    }
  )
);

export const useHasImage = () => useEditorStore((s) => Boolean(s.project.image));
export const useImageMeta = () => useEditorStore((s) => s.project.image);
export const useDisplay = () => useEditorStore((s) => s.view.display);
export const useEditorActions = () => useEditorStore((s) => s.actions);
