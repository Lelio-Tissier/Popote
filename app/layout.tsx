import type { Metadata, Viewport } from "next";
import "./globals.css";
import { FavoritesProvider } from "@/components/FavoritesProvider";

export const metadata: Metadata = {
  title: "Popote — Ton menu & tes courses, calés sur ton budget",
  description:
    "Popote génère un menu maison personnalisé et ta liste de courses triée par rayon, dans ton budget. 100 % gratuit, fait maison, anti-gaspi, Bio & local.",
};

export const viewport: Viewport = {
  themeColor: "#FBF8F3",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full">
      <body className="min-h-full">
        <FavoritesProvider>{children}</FavoritesProvider>
      </body>
    </html>
  );
}
