// app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Image Text Composer",
    template: "%s · Image Text Composer",
  },
  description:
    "Desktop-only image editor to upload a PNG and overlay fully customizable text. Built with Next.js, Konva, and Google Fonts.",
  applicationName: "Image Text Composer",
  keywords: [
    "image editor",
    "PNG",
    "text overlay",
    "Konva",
    "Next.js",
    "Google Fonts",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Image Text Composer",
    description:
      "Upload a PNG, add styled text layers, and export at original dimensions.",
    images: [
      { url: "/og.png", width: 1200, height: 630, alt: "Image Text Composer" },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [{ url: "/favicon.ico" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0b" },
    { color: "#ffffff" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
