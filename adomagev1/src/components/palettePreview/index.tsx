"use client";

import React from "react";

/**
 * PalettePreview (single panel)
 *
 * Renders one preview that fully respects your global theme variables.
 * Dark/Light is controlled by your global ThemeProvider / shadcn ModeToggle.
 *
 * Drop this component anywhere (e.g., app/page.tsx) and use your ModeToggle
 * to flip themes. No forced `.dark` wrapper here.
 */
export default function PalettePreview() {
  return (
    <div className="min-h-screen w-full p-8 bg-[var(--background)] text-[var(--foreground)]">
      <Header />
      <div className="space-y-8">
        <ThemeCard title="Current Theme">
          <RectStack />
          <SwatchGrid />
        </ThemeCard>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Palette Preview</h1>
        <p className="text-sm opacity-80">This panel follows your global theme. Toggle light/dark with your ModeToggle.</p>
      </div>
    </div>
  );
}

function ThemeCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] shadow-sm">
      <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
        <h2 className="text-lg font-medium">{title}</h2>
        <span className="text-xs px-2 py-1 rounded bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)]">following globals.css</span>
      </div>
      <div className="p-6 space-y-6">{children}</div>
    </div>
  );
}

/**
 * Big rectangle with two nested rectangles (secondary → muted),
 * plus overlay text and a subtle ring to show focus color.
 */
function RectStack() {
  return (
    <div
      className="relative mx-auto aspect-[16/9] w-full max-w-[820px] rounded-xl border border-[var(--border)] bg-[var(--background)] outline outline-2 outline-[color:var(--ring)]/20"
    >
      <div className="absolute inset-3 rounded-lg bg-[var(--secondary)] border border-[var(--border)]" />
      <div className="absolute inset-8 rounded-md bg-[var(--muted)] border border-[var(--border)]" />

      {/* Accent chip */}
      <div className="absolute right-4 top-4 rounded-md px-2 py-1 text-xs tracking-wide border border-[var(--border)] bg-[var(--accent)] text-[var(--accent-foreground)]">
        accent
      </div>

      {/* Overlay text */}
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <p className="text-sm uppercase tracking-widest opacity-80">Overlay text</p>
          <h3 className="text-3xl md:text-4xl font-bold text-[var(--foreground)]">The quick brown fox</h3>
          <p className="mt-2 text-sm opacity-70">border → <span className="font-mono">var(--border)</span> · ring → <span className="font-mono">var(--ring)</span></p>
        </div>
      </div>
    </div>
  );
}

/**
 * Grid of simple square swatches for the common tokens.
 */
function SwatchGrid() {
  const tokens: { name: string; varName: string; fg?: string }[] = [
    { name: "background", varName: "--background", fg: "--foreground" },
    { name: "card", varName: "--card", fg: "--card-foreground" },
    { name: "popover", varName: "--popover", fg: "--popover-foreground" },
    { name: "secondary", varName: "--secondary", fg: "--secondary-foreground" },
    { name: "muted", varName: "--muted", fg: "--muted-foreground" },
    { name: "accent", varName: "--accent", fg: "--accent-foreground" },
    { name: "primary", varName: "--primary", fg: "--primary-foreground" },
    { name: "input", varName: "--input" },
    { name: "border", varName: "--border" },
    { name: "ring", varName: "--ring" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {tokens.map((t) => (
        <Swatch key={t.name} name={t.name} varName={t.varName} fg={t.fg} />
      ))}
    </div>
  );
}

function Swatch({ name, varName, fg }: { name: string; varName: string; fg?: string }) {
  return (
    <div className="rounded-lg border border-[var(--border)] overflow-hidden">
      <div
        className="h-16 grid place-items-center"
        style={{
          background: `var(${varName})`,
          color: fg ? `var(${fg})` : undefined,
        }}
      >
        <span className="text-xs font-medium capitalize">{name}</span>
      </div>
      <div className="p-2 text-[10px] font-mono opacity-80">
        <div>var({varName})</div>
        {fg ? <div className="opacity-70">fg: var({fg})</div> : null}
      </div>
    </div>
  );
}
