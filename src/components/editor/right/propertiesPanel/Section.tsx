// right/propertiesPanel/Section.tsx
import { ReactNode } from "react";

export function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="p-4 border-b border-border">
      <h3 className="text-sm font-medium mb-3 text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
