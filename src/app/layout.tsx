import type { Metadata, Viewport } from "next";
import { Montserrat, Syne, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

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

// Brand serif used on wellbeing-concepts.de (landing / editorial headlines)
const cormorant = Cormorant_Garamond({
  subsets:  ["latin"],
  variable: "--font-cormorant",
  weight:   ["400", "500", "600", "700"],
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

// Inline script runs synchronously before paint — prevents flash of wrong theme
const themeScript = `
try {
  var t = localStorage.getItem('theme');
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (t === 'dark' || (!t && prefersDark)) {
    document.documentElement.classList.add('dark');
  }
} catch(e) {}
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="de"
      className={`${montserrat.variable} ${syne.variable} ${cormorant.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Anti-FOUC: apply dark class before first paint */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
