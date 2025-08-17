// src/components/editor/canvas/CanvasStage.tsx
'use client';

import { useEffect, useRef } from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import type Konva from 'konva';
import useImage from 'use-image';
import { useViewportBox } from '@/hooks/useViewportBox';
import {
  useDisplay,
  useEditorActions,
  useHasImage,
  useImageMeta,
  useTextLayers,
  useSelectedId,
} from '@/store/editorStore';
import UploadController from '../UploadController';
import FileDropTarget from './FileDropTarget';
import TextNode from './TextNode';

const VIEWPORT_MAX_HEIGHT = 480;

type CanvasStageProps = { stageRef: React.RefObject<Konva.Stage | null> };

const CanvasStage: React.FC<CanvasStageProps> = ({ stageRef }) => {
  const hasImage = useHasImage();
  const image = useImageMeta();
  const display = useDisplay();
  const layers = useTextLayers();
  const selectedId = useSelectedId();
  const { setImageFromFile, setDisplayByContainer, selectTextLayer } = useEditorActions();

  const [htmlImage] = useImage(image?.src || '', 'anonymous');

  const viewportRef = useRef<HTMLDivElement>(null);
  const { width: boxW, height: boxH } = useViewportBox(viewportRef, hasImage);

  const imgSrc = image?.src;
  useEffect(() => {
    if (!boxW || !boxH || !imgSrc) return;
    setDisplayByContainer(boxW, boxH);
  }, [boxW, boxH, imgSrc, setDisplayByContainer]);

  return (
    <div className="relative flex w-full items-center justify-center">
     
      <div className="relative w-full max-w-[980px] rounded-2xl bg-muted/20 border border-border/60 p-4 overflow-hidden" style={{ minHeight: 520 }}>
        {!hasImage ? (
          <UploadController
            variant="card"
            onSelect={setImageFromFile}
            description="Drag & drop or click. Only PNG files are accepted."
            className="h-[380px]"
          />
        ) : (
          <FileDropTarget onFile={setImageFromFile} accept="image/png" className="w-full" overlayText="Drop PNG to replace background">
            <div ref={viewportRef} className="flex w-full items-center justify-center" style={{ height: VIEWPORT_MAX_HEIGHT }}>
              {!htmlImage || !display.width || !display.height ? (
                <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                  Preparing canvas…
                </div>
              ) : (
                <Stage
                  ref={stageRef}
                  width={display.width}
                  height={display.height}
                  className="rounded-xl shadow-md bg-transparent"
                  onMouseDown={(e) => {
                    // click empty stage deselects
                    if (e.target === e.target.getStage()) selectTextLayer(null);
                  }}
                >
                  <Layer listening={false}>
                    <KonvaImage image={htmlImage} width={display.width} height={display.height} />
                  </Layer>

                  {/* text layer */}
                  <Layer>
                    {layers
                      .slice()
                      .sort((a, b) => a.z - b.z)
                      .map((l) => (
                        <TextNode
                          key={l.id}
                          layer={l}
                          scale={display.scale}
                          selected={selectedId === l.id}
                          onSelect={(id) => selectTextLayer(id)}
                        />
                      ))}
                  </Layer>
                </Stage>
              )}
            </div>
          </FileDropTarget>
        )}
      </div>
    </div>
  );
};

export default CanvasStage;
