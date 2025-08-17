'use client';

import React from 'react';
import { UploadCloud } from 'lucide-react';
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
  label?: string;        // e.g. "Click to Replace background png"
  description?: string;
  accept?: string;       // default: 'image/png'
};

const UploadController: React.FC<UploadControllerProps> = ({
  onSelect,
  variant = 'button',
  className,
  disabled,
  label = 'Upload background PNG',
  description,
  accept = 'image/png',
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const inputId = React.useId();
  const [drag, setDrag] = React.useState(false);

  const openPicker = () => inputRef.current?.click();

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (accept === 'image/png' && file.type !== 'image/png') return;
    onSelect(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => handleFiles(e.target.files);

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDrag(false);
    handleFiles(e.dataTransfer.files);
  };

  // --- CARD variant (matches mock) ---
  if (variant === 'card') {
    return (
      <Card
        className={cx(
          'group select-none cursor-pointer rounded-lg border border-dashed',
          'bg-muted/20 hover:bg-muted/30 transition',
          drag && 'ring-2 ring-sidebar-ring/60',
          disabled && 'pointer-events-none opacity-50',
          className
        )}
        onClick={openPicker}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); e.dataTransfer.dropEffect = 'copy'; }}
        onDragEnter={() => setDrag(true)}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openPicker()}
      >
        <CardContent className="grid place-items-center p-0 min-h-[110px]">
          <div className="flex flex-col items-center gap-2 py-4">
            <UploadCloud className="h-5 w-5 opacity-90" />
            <div className="text-sm font-medium leading-tight text-center">
              {label}
            </div>
            <div className="text-[11px] text-muted-foreground">PNG only</div>
            {description && (
              <p className="mt-1 text-xs text-muted-foreground">{description}</p>
            )}
          </div>

          <Label htmlFor={inputId} className="sr-only">Upload PNG</Label>
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

  // --- BUTTON variant (unchanged) ---
  return (
    <div className={className}>
      <Label htmlFor={inputId} className="sr-only">Upload PNG</Label>
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
        {label}
      </Button>
    </div>
  );
};

export default UploadController;
