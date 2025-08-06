import { Dna } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="py-4 px-6 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-20">
      <div className="container mx-auto flex items-center gap-3">
        <div className="bg-primary p-2 rounded-lg">
          <Dna className="text-primary-foreground h-6 w-6" />
        </div>
        <h1 className="text-2xl font-headline font-bold text-foreground">
          TaxonScope
        </h1>
      </div>
    </header>
  );
}
