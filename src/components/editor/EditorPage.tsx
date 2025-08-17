// src/components/editor/EditorPage.tsx
"use client";

import { useRef, useEffect } from "react";
import type Konva from "konva";
import CanvasStage from "./canvas/CanvasStage";
import { CanvasToolbar } from "./top/CanvasToolbar";
import LayersPanel from "./left/LayersPanel";
import {
  useEditorActions,
  useHistory,
  useImageMeta,
} from "@/store/editorStore";
import { useExportOriginal } from "@/hooks/useExportOriginal";
import PropertiesPanel from "./right/propertiesPanel/PropertiesPanel";
import CanvasMetaBar from "./canvas/CanvasMetaBar";

export default function EditorPage() {
  const stageRef = useRef<Konva.Stage>(null);
  const image = useImageMeta();
  const history = useHistory();

  const { setImageFromFile, undo, redo, resetCanvas } = useEditorActions();
  const { exportOriginal } = useExportOriginal(stageRef);

  // (Optional) keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      if (e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (
        (e.key.toLowerCase() === "z" && e.shiftKey) ||
        e.key.toLowerCase() === "y"
      ) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  return (
    <main className="h-dvh grid grid-cols-[260px_1fr_340px] gap-0">
      <aside className="border-r bg-sidebar p-3">
        <h2 className="mb-3 text-sm font-medium">Layers</h2>
        <LayersPanel hasImage={Boolean(image)} onReplace={setImageFromFile} />
      </aside>

      <section className="relative">
        <div className="px-4 pt-3">
          <CanvasToolbar
            onExport={exportOriginal}
            onReset={resetCanvas}
            onUndo={undo}
            onRedo={redo}
            canUndo={history.past.length > 0}
            canRedo={history.future.length > 0}
            historyIndex={history.past.length}
            historyLimit={history.limit}
          />
        </div>

        <div className="p-6">
          <CanvasMetaBar />
          <CanvasStage stageRef={stageRef} />
        </div>
      </section>

      <aside className="border-l bg-card p-3 space-y-4">
        <PropertiesPanel />
      </aside>
    </main>
  );
}
