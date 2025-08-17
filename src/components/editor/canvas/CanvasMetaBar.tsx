// src/components/editor/canvas/CanvasMetaBar.tsx
"use client";

import * as React from "react";
import { useHasImage, useImageMeta } from "@/store/editorStore";

const CanvasMetaBar: React.FC = () => {
  const hasImage = useHasImage();
  const meta = useImageMeta();

  if (!hasImage || !meta) return null;

  return (
    <div className="mb-2 text-xs text-muted-foreground">
      {meta.originalW}×{meta.originalH} px
    </div>
  );
};

export default CanvasMetaBar;
