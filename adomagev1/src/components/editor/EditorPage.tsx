'use client';

import { useRef } from 'react';
import type Konva from 'konva';
import CanvasStage from './canvas/CanvasStage';
import { CanvasToolbar } from './top/CanvasToolbar';
import LayersPanel from './left/LayersPanel';           // ← updated import
import  TextInspector  from './right/TextInspector';

import { useEditorActions, useImageMeta } from '@/store/editorStore';
import { useExportOriginal } from '@/hooks/useExportOriginal';
import TypographySection from './right/TypographySection';

export default function EditorPage() {
  const stageRef = useRef<Konva.Stage>(null);
  const { clearImage, setImageFromFile } = useEditorActions();
  const image = useImageMeta();
  const { exportOriginal } = useExportOriginal(stageRef);

  return (
    <main className="h-dvh grid grid-cols-[260px_1fr_340px] gap-0">
      <aside className="border-r bg-sidebar p-3">
        <h2 className="mb-3 text-sm font-medium">Layers</h2>
        <LayersPanel
          hasImage={Boolean(image)}
          onReplace={setImageFromFile}
        />
      </aside>

      <section className="relative">
        <div className="px-4 pt-3">
          <CanvasToolbar
            onExport={exportOriginal}
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
          <CanvasStage stageRef={stageRef} />
        </div>
      </section>

<aside className="border-l bg-card p-3 space-y-4">
  {/* <TextInspector /> */}
  <TypographySection/>
</aside>
    </main>
  );
}
