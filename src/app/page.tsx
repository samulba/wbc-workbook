import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl text-center">
          <p className="text-sand font-sans text-sm uppercase tracking-widest mb-4">
            Wellbeing Concepts
          </p>
          <h1 className="font-headline text-5xl md:text-7xl text-forest leading-tight mb-6">
            Dein Wellbeing Workbook
          </h1>
          <p className="text-gray font-sans text-lg leading-relaxed mb-10 max-w-lg mx-auto">
            Mehr Klarheit, Balance und Selbstwahrnehmung – mit einem
            persönlichen Workbook, das mit dir wächst.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup">
              <Button size="lg">Jetzt starten</Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg">
                Anmelden
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Accent bar */}
      <div className="h-2 flex">
        <div className="flex-1 bg-mint" />
        <div className="flex-1 bg-sand" />
        <div className="flex-1 bg-terracotta" />
        <div className="flex-1 bg-forest" />
      </div>
    </div>
  );
}
