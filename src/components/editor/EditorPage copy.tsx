// // src/components/editor/EditorPage.tsx (excerpt)
// import { useRef, useState } from 'react';
// import type Konva from 'konva';
// import CanvasStage from './canvas/CanvasStage';
// import { CanvasToolbar } from './top/CanvasToolbar';
// import { LayersPanel } from './left/LayersPanel';
// import { TextInspector } from './right/TextInspector';
// import { TextContentCard } from './right/TextContentCard';
// import { useEditorActions, useImageMeta } from '@/store/editorStore';
// import { useExportOriginal } from '@/hooks/useExportOriginal';

// export default function EditorPage() {
//   const stageRef = useRef<Konva.Stage>(null);
//   const { clearImage, setImageFromFile } = useEditorActions();
//   const image = useImageMeta();
//   const { exportOriginal } = useExportOriginal(stageRef);

//   // Temporary local state to mock text rows (we’ll move this to zustand soon)
//   const [textRows, setTextRows] = useState([
//     { id: 't1', name: 'Text layer 1', text: '', selected: false, expanded: false },
//     { id: 't2', name: 'Text layer 2', text: '', selected: false, expanded: false },
//   ]);

//   return (
//     <main className="h-dvh grid grid-cols-[260px_1fr_340px] gap-0">
//       <aside className="border-r bg-sidebar p-3">
//         <h2 className="text-sm font-medium mb-3">Layers</h2>
//         <LayersPanel
//           background={{ hasImage: Boolean(image), name: image?.name }}
//           onReplaceBackground={setImageFromFile}
//           onClearBackground={clearImage}
//           onSelectLayer={(id) => console.log('select layer:', id)}
//           textLayers={textRows}
//           onDeleteTextLayer={(id) => setTextRows((r) => r.filter((t) => t.id !== id))}
//           onToggleExpand={(id) =>
//             setTextRows((r) => r.map((t) => (t.id === id ? { ...t, expanded: !t.expanded } : t)))
//           }
//           onChangeTextContent={(id, value) =>
//             setTextRows((r) => r.map((t) => (t.id === id ? { ...t, text: value, name: t.name } : t)))
//           }
//           onAddTextLayer={() =>
//             setTextRows((r) => [
//               ...r,
//               { id: `t${Date.now()}`, name: `Text layer ${r.length + 1}`, text: '', selected: false, expanded: true },
//             ])
//           }
//         />
//       </aside>

//       <section className="relative">
//         <div className="px-4 pt-3">
//           <CanvasToolbar
//             onExport={exportOriginal}
//             onReset={clearImage}
//             onUndo={() => console.log('undo')}
//             onRedo={() => console.log('redo')}
//             canUndo={false}
//             canRedo={false}
//             historyIndex={0}
//             historyLimit={20}
//           />
//         </div>

//         <div className="p-6">
//           <CanvasStage stageRef={stageRef} />
//         </div>
//       </section>

//       <aside className="border-l bg-card p-3 space-y-4">
//         {/* Right side stays as-is for now */}
//         <TextInspector
//           fontFamily="Inter"
//           fontSize={80}
//           fontWeight="Bold"
//           color="#ffffff"
//           opacity={95}
//           align="center"
//           multiline
//           onChange={(patch) => console.log(patch)}
//         />
//         <TextContentCard
//           value="PREDICTT THER AN"
//           tag="background"
//           onChange={(v) => console.log('text:', v)}
//         />
//       </aside>
//     </main>
//   );
// }
