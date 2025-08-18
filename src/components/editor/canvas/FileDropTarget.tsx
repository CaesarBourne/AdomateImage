"use client";

import { cx } from "class-variance-authority";
import { useRef, useState } from "react";

type FileDropTargetProps = {
  onFile: (file: File) => void;
  accept?: "image/png";
  disabled?: boolean;
  className?: string;
  overlayText?: string;
  children: React.ReactNode;
};

const FileDropTarget: React.FC<FileDropTargetProps> = ({
  onFile,
  accept = "image/png",
  disabled,
  className,
  overlayText = "Drop PNG to replace background",
  children,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const handleDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    if (disabled) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDragEnter: React.DragEventHandler<HTMLDivElement> = (e) => {
    if (disabled) return;
    e.preventDefault();
    dragCounter.current += 1;
    setIsDragging(true);
  };

  const handleDragLeave: React.DragEventHandler<HTMLDivElement> = (e) => {
    if (disabled) return;
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      setIsDragging(false);
    }
  };

  const handleDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    if (disabled) return;
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Only accept PNG files - reject JPG and others
    if (accept === "image/png" && file.type !== "image/png") return;

    onFile(file);
  };

  return (
    <div
      className={cx("relative", className)}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}

      {isDragging && !disabled && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl border-2 border-dashed border-primary/50 bg-background/60">
          <span className="rounded-md bg-background/80 px-3 py-1 text-sm text-muted-foreground">
            {overlayText}
          </span>
        </div>
      )}
    </div>
  );
};

export default FileDropTarget;
