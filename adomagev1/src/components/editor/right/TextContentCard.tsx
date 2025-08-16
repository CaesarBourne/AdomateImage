import React from 'react'
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export const TextContentCard = ({
  value,
  tag,
  onChange,
}: {
  value: string;
  tag?: string;
  onChange: (v: string) => void;
}) => {
  return (
        <Card className="p-4 space-y-3">
      <div className="space-y-2">
        <Label>Text</Label>
        <Input value={value} onChange={(e) => onChange(e.target.value)} />
      </div>

      {tag && (
        <div className="rounded-md bg-muted/30 px-3 py-2 text-sm opacity-80">
          {tag}
        </div>
      )}
    </Card>

  )
}
