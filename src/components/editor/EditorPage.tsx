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
    <main className="h-dvh flex overflow-hidden bg-muted/30 gap-4 p-4">
      {/* Left Panel - Independent Scroll */}
      <aside className="w-64 bg-sidebar flex flex-col rounded-xl border border-sidebar-border shadow-sm">
        <div className="p-4 border-b border-sidebar-border">
          <h2 className="text-sm font-semibold text-sidebar-foreground">
            Layers
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <LayersPanel
              hasImage={Boolean(image)}
              onReplace={setImageFromFile}
            />
          </div>
        </div>
      </aside>

      {/* Center Panel - Main Canvas Area */}
      <section className="flex-1 flex flex-col overflow-hidden bg-background rounded-xl border border-border shadow-sm">
        {/* Top Toolbar - Fixed */}
        <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-t-xl">
          <div className="px-6 py-3">
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
        </div>

        {/* Canvas Area - Scrollable */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <CanvasMetaBar />
            <CanvasStage stageRef={stageRef} />
          </div>
        </div>
      </section>

      {/* Right Panel - Independent Scroll */}
      <aside className="w-80 bg-card flex flex-col rounded-xl border border-border shadow-sm">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-semibold text-card-foreground">
            Properties
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          <PropertiesPanel />
        </div>
      </aside>
    </main>
  );
}
