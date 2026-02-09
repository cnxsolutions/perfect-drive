import type { Metadata } from "next";
import { Montserrat, Oswald } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Perfect Drive | Location Premium",
  description: "Location de véhicules de prestige et utilitaires.",
  icons: {
    icon: "/logo.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${montserrat.variable} ${oswald.variable}`} suppressHydrationWarning>
      <body className="bg-darkbg text-white font-sans antialiased overflow-x-hidden selection:bg-alpine selection:text-white">
        {children}
      </body>
    </html>
  );
}
