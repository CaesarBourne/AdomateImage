'use client';

import React from 'react';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cx } from 'class-variance-authority';

type UploadControllerProps = {
  onSelect: (file: File) => void;
  variant?: 'button' | 'card';
  className?: string;
  disabled?: boolean;
  label?: string;       
  description?: string;  
  accept?: string;       
};

const UploadController: React.FC<UploadControllerProps> = ({
  onSelect,
  variant = 'button',
  className,
  disabled,
  label,
  description,
  accept = 'image/png',
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const inputId = React.useId();

  const openPicker = () => inputRef.current?.click();

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (accept === 'image/png' && file.type !== 'image/png') {
      // optional: toast error here
      return;
    }
    onSelect(file);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // reset so choosing the same file again still fires onChange
    if (inputRef.current) inputRef.current.value = '';
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleFiles(e.dataTransfer.files);
  };

  // ----- Card (drop-zone) variant -----
  if (variant === 'card') {
    return (
     <Card
  className={cx(
    'group select-none border-dashed cursor-pointer',
    disabled && 'pointer-events-none opacity-50',
    className
  )}
  onClick={openPicker}
  onDragOver={(e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }}
  onDrop={onDrop}
  role="button"
  tabIndex={0}
  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openPicker()}
>

        <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
          <ImageIcon className="h-10 w-10 opacity-70 group-hover:opacity-100" />
          <div className="text-sm opacity-90">(click to upload a PNG image)</div>
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}

          {/* Accessible label + hidden input (still shadcn's Input) */}
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

  // ----- Button variant (sidebar) -----
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
      <Button type="button" variant="secondary" onClick={openPicker} disabled={disabled}>
        <UploadCloud className="mr-2 h-4 w-4" />
        {label ?? 'Upload a PNG image'}
      </Button>
    </div>
  );
};

export default UploadController;
