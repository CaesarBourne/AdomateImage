'use client';
 
import React from 'react';
import UploadController from '../UploadController';
 
const CanvasStage: React.FC = () => {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
 
  const handleSelect = React.useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
  }, []);
 
  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);
 
  return (
    <div className="relative flex w-full items-center justify-center">
      <div
        className={[
          'relative w-full max-w-[980px] rounded-2xl bg-muted/20',
          'border border-border/60 p-4',
        ].join(' ')}
        style={{ minHeight: 520 }}
      >
        {!previewUrl ? (
          <UploadController
            variant="card"
            onSelect={handleSelect}
            className="h-[380px]"
          />
        ) : (
          <div className="flex items-center justify-center">
            <img
              src={previewUrl}
              alt="Background"
              className="max-h-[480px] w-auto rounded-xl shadow-md"
              draggable={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};
 
export default CanvasStage;