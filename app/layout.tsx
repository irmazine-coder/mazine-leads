import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MAZINE LEADS",
  description: "Central privada de prospecção comercial da MAZINE.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
