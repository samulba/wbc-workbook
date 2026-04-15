import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Wellbeing Workbook",
    template: "%s | Wellbeing Workbook",
  },
  description:
    "Dein persönliches Wellbeing Workbook – für mehr Balance, Klarheit und Wohlbefinden.",
  metadataBase: new URL("https://workbooks.wellbeing-concepts.de"),
  openGraph: {
    siteName: "Wellbeing Workbook",
    locale: "de_DE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={montserrat.variable}>
      {/*
        ALTA font is loaded via @font-face in globals.css.
        Place alta.woff2 (and alta.woff) in /public/fonts/
        to activate the headline font.
      */}
      <body>{children}</body>
    </html>
  );
}
