"use client";

import { cn } from "@/lib/utils";

type LayerItem = {
  id: string;
  label: string;
  active?: boolean;
  muted?: boolean;
};

export function LayersPanel({
  items,
  onSelect,
}: {
  items: LayerItem[];
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      {items.map((it) => (
        <button
          key={it.id}
          onClick={() => onSelect(it.id)}
          className={cn(
            "w-full text-left rounded-lg px-3 py-3 border transition",
            it.active ? "bg-secondary/40 border-border" : "hover:bg-secondary/30",
            it.muted && "opacity-70"
          )}
        >
          <div className="text-sm leading-snug line-clamp-2">{it.label}</div>
        </button>
      ))}
    </div>
  );
}
