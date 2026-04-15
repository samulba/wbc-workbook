export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cream flex">
      {/* Left panel – decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-forest items-center justify-center p-12">
        <div className="text-cream max-w-md">
          <h2 className="font-headline text-5xl mb-6 leading-tight">
            Dein persönliches Wellbeing Workbook
          </h2>
          <p className="text-cream/80 text-lg font-sans leading-relaxed">
            Begleite dich selbst mit Klarheit, Reflexion und Achtsamkeit –
            jeden Tag ein kleiner Schritt zu mehr Wohlbefinden.
          </p>
          <div className="mt-10 flex gap-3">
            <span className="h-2 w-8 rounded-full bg-mint" />
            <span className="h-2 w-2 rounded-full bg-sand" />
            <span className="h-2 w-2 rounded-full bg-terracotta" />
          </div>
        </div>
      </div>

      {/* Right panel – form */}
      <div className="flex flex-1 items-center justify-center p-6">
        {children}
      </div>
    </div>
  );
}
