"use client";

import React from "react";
import { UploadCloud, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cx } from "class-variance-authority";

type UploadControllerProps = {
  onSelect: (file: File) => void;
  variant?: "button" | "card";
  className?: string;
  disabled?: boolean;
  label?: string; // e.g. "Click to Replace background png"
  description?: string;
  accept?: string; // default: 'image/png'
};
const MAX_SIZE_MB = 4;

const UploadController: React.FC<UploadControllerProps> = ({
  onSelect,
  variant = "button",
  className,
  disabled,
  label = "Upload background PNG",
  description,
  accept = "image/png",
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const inputId = React.useId();
  const [drag, setDrag] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const openPicker = () => inputRef.current?.click();

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    // type check
    if (accept === "image/png" && file.type !== "image/png") {
      if (file.type === "image/jpeg" || file.type === "image/jpg") {
        setError("JPG files are not supported. Please use PNG format only.");
      } else {
        setError("Only PNG files are allowed");
      }
      return;
    }

    // size check
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_SIZE_MB) {
      setError(
        `File is too large (${sizeMB.toFixed(
          1
        )}MB). Max ${MAX_SIZE_MB}MB allowed.`
      );
      return;
    }

    setError(null);
    onSelect(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    handleFiles(e.target.files);

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDrag(false);
    handleFiles(e.dataTransfer.files);
  };

  // --- CARD variant (with error feedback) ---
  if (variant === "card") {
    return (
      <Card
        className={cx(
          "group select-none cursor-pointer rounded-lg border border-dashed",
          "bg-muted/20 hover:bg-muted/30 transition",
          drag && "ring-2 ring-sidebar-ring/60",
          error && "border-red-500/60 bg-red-50/50 dark:bg-red-950/20",
          disabled && "pointer-events-none opacity-50",
          className
        )}
        onClick={openPicker}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
          e.dataTransfer.dropEffect = "copy";
        }}
        onDragEnter={() => setDrag(true)}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openPicker()}
      >
        <CardContent className="grid place-items-center p-0 min-h-[110px]">
          <div className="flex flex-col items-center gap-2 py-4">
            <UploadCloud className="h-5 w-5 opacity-90" />
            <div className="text-sm font-medium leading-tight text-center">
              {label}
            </div>
            <div className="text-[11px] text-muted-foreground">
              PNG only, max {MAX_SIZE_MB}MB
            </div>
            {description && (
              <p className="mt-1 text-xs text-muted-foreground">
                {description}
              </p>
            )}
            {error && (
              <div className="mt-2 flex items-center gap-1.5 px-3 py-2 rounded-md bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                <AlertCircle className="h-3 w-3 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-xs text-red-700 dark:text-red-300 font-medium">
                  {error}
                </p>
              </div>
            )}
          </div>

          <Label htmlFor={inputId} className="sr-only">
            Upload PNG
          </Label>
          <Input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={accept}
            onChange={onChange}
            className="hidden"
            disabled={disabled}
          />
        </CardContent>
      </Card>
    );
  }

  // --- BUTTON variant (with error feedback) ---
  return (
    <div className={className}>
      <Label htmlFor={inputId} className="sr-only">
        Upload PNG
      </Label>
      <Input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        onChange={onChange}
        className="hidden"
        disabled={disabled}
      />
      <Button
        type="button"
        variant="secondary"
        onClick={openPicker}
        disabled={disabled}
        className={cx(error && "border-red-500/60")}
      >
        <UploadCloud className="mr-2 h-4 w-4" />
        {label}
      </Button>
      {error && (
        <div className="mt-2 flex items-center gap-1.5 px-3 py-2 rounded-md bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
          <AlertCircle className="h-3 w-3 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-xs text-red-700 dark:text-red-300 font-medium">
            {error}
          </p>
        </div>
      )}
    </div>
  );
};
export default UploadController;
