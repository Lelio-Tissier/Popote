import type { Metadata, Viewport } from "next";
import "./globals.css";
import { FavoritesProvider } from "@/components/FavoritesProvider";

const SITE_URL = "https://popote-lelio.netlify.app";
const DESCRIPTION =
  "Bousti génère un menu maison personnalisé et ta liste de courses triée par rayon, dans ton budget. 100 % gratuit, fait maison, anti-gaspi, Bio & local.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Bousti - Ton menu maison + ta liste de courses",
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "Bousti",
    locale: "fr_FR",
    url: SITE_URL,
    title: "Bousti - Ton menu maison + ta liste de courses",
    description: DESCRIPTION,
    images: [
      {
        url: "/logo-bousti.png",
        width: 1408,
        height: 768,
        alt: "Bousti - Ton menu maison + ta liste de courses",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bousti - Ton menu maison + ta liste de courses",
    description: DESCRIPTION,
    images: ["/logo-bousti.png"],
  },
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
