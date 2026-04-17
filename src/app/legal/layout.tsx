import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-forest/10 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-headline text-forest text-[1.1rem] hover:text-forest/80">
            Wellbeing Workbook
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-forest transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zur App
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-14">
        <div className="legal-content text-gray-800 leading-relaxed">
          {children}
        </div>
      </main>

      <style>{`
        .legal-content h1 { font-family: var(--font-headline, serif); font-size: 2.25rem; line-height: 1.1; color: #445c49; margin-bottom: 0.75rem; }
        .legal-content h2 { font-family: var(--font-headline, serif); font-size: 1.5rem; line-height: 1.2; color: #445c49; margin-top: 2rem; margin-bottom: 0.75rem; }
        .legal-content h3 { font-family: var(--font-headline, serif); font-size: 1.125rem; line-height: 1.3; color: #445c49; margin-top: 1.25rem; margin-bottom: 0.5rem; }
        .legal-content p  { margin-bottom: 1rem; font-size: 0.95rem; }
        .legal-content ul { margin-bottom: 1rem; padding-left: 1.25rem; list-style-type: disc; }
        .legal-content li { margin-bottom: 0.25rem; font-size: 0.95rem; }
        .legal-content a  { color: #445c49; text-decoration: underline; text-underline-offset: 2px; }
        .legal-content a:hover { color: rgba(68, 92, 73, 0.75); }
        .legal-content strong { color: #445c49; font-weight: 600; }
        .legal-content code { background: rgba(68, 92, 73, 0.08); padding: 0.1rem 0.35rem; border-radius: 0.25rem; font-size: 0.875em; }
      `}</style>

      <footer className="border-t border-forest/10 py-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center text-xs text-gray-500 space-x-4">
          <Link href="/legal/impressum" className="hover:text-forest">Impressum</Link>
          <Link href="/legal/datenschutz" className="hover:text-forest">Datenschutz</Link>
          <Link href="/legal/agb" className="hover:text-forest">AGB</Link>
        </div>
      </footer>
    </div>
  );
}
