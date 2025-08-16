'use client';

import { useRef } from 'react';
import type Konva from 'konva';

import { CanvasToolbar } from './top/CanvasToolbar';
import { LayersPanel } from './left/LayersPanel';
import { TextInspector } from './right/TextInspector';
import { TextContentCard } from './right/TextContentCard';
import CanvasStage from './canvas/CanvasStage';

import { useEditorActions } from '@/store/editorStore';
import { useExportOriginal } from '@/hooks/useExportOriginal';   // ← NEW

export default function EditorPage() {
  // Stage ref for the visible canvas
  const stageRef = useRef<Konva.Stage>(null);

  // Store actions
  const { clearImage } = useEditorActions();

  // Export hook
  const { exportOriginal } = useExportOriginal(stageRef);

  return (
    <main className="h-dvh grid grid-cols-[260px_1fr_340px] gap-0">
      {/* Left: Layers */}
      <aside className="border-r bg-sidebar p-3">
        <h2 className="text-sm font-medium mb-3">Layers</h2>
        <LayersPanel
          items={[
            { id: 't1', label: 'The best way to predict the future is to create it', active: true },
            { id: 'bg', label: 'background', active: false, muted: true },
          ]}
          onSelect={(id) => console.log('select:', id)}
        />
      </aside>

      {/* Center: Canvas + Top toolbar */}
      <section className="relative">
        <div className="px-4 pt-3">
          <CanvasToolbar
            onExport={exportOriginal}               // ← uses the hook
            onReset={clearImage}
            onUndo={() => console.log('undo')}
            onRedo={() => console.log('redo')}
            canUndo={false}
            canRedo={false}
            historyIndex={0}
            historyLimit={20}
          />
        </div>

        <div className="p-6">
          <CanvasStage stageRef={stageRef} />       {/* ← pass ref down */}
        </div>
      </section>

      {/* Right: Inspector */}
      <aside className="border-l bg-card p-3 space-y-4">
        <TextInspector
          fontFamily="Inter"
          fontSize={80}
          fontWeight="Bold"
          color="#ffffff"
          opacity={95}
          align="center"
          multiline
          onChange={(patch) => console.log(patch)}
        />
        <TextContentCard
          value="PREDICTT THER AN"
          tag="background"
          onChange={(v) => console.log('text:', v)}
        />
      </aside>
    </main>
  );
}
