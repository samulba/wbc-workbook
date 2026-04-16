import type { Metadata, Viewport } from "next";
import { Montserrat, Syne } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets:  ["latin"],
  variable: "--font-montserrat",
  display:  "swap",
});

const syne = Syne({
  subsets:  ["latin"],
  variable: "--font-syne",
  weight:   ["700", "800"],
  display:  "swap",
});

export const viewport: Viewport = {
  width:        "device-width",
  initialScale: 1,
  viewportFit:  "cover",
};

export const metadata: Metadata = {
  title: {
    default:  "Wellbeing Workbook",
    template: "%s | Wellbeing Workbook",
  },
  description:
    "Dein persönliches Wellbeing Workbook – für mehr Balance, Klarheit und Wohlbefinden.",
  metadataBase: new URL("https://workbooks.wellbeing-concepts.de"),
  openGraph: {
    siteName: "Wellbeing Workbook",
    locale:   "de_DE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className={`${montserrat.variable} ${syne.variable}`}>
      <body>{children}</body>
    </html>
  );
}
