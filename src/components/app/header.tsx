import { Dna } from 'lucide-react';
import Image from 'next/image';

export function AppHeader() {
  return (
    <header className="py-4 px-6 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-20">
      <div className="container mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg">
            <Dna className="text-primary-foreground h-6 w-6" />
          </div>
          <h1 className="text-2xl font-headline font-bold text-foreground">
            TaxonScope
          </h1>
        </div>
        <Image
          src="https://scontent.fmnl25-3.fna.fbcdn.net/v/t1.6435-9/116434441_889085791582368_8821061930943047908_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=qKCvS7LFYB8Q7kNvwFJsFWx&_nc_oc=Adn3f_0sZam1ZOfyAE9pky6BmiHv_gtsyw0meRdEyEfOAprnZbmszge6Iw1WOgLN17c&_nc_zt=23&_nc_ht=scontent.fmnl25-3.fna&_nc_gid=DRb8oePgZmAc1nFiNsRg5A&oh=00_AfUq7J15XX13WExLBqN6KoAPmFrKMIUYS_EWfhbQMVwdAQ&oe=68BA3869"
          alt="School Logo"
          width={40}
          height={40}
          className="rounded-full"
          data-ai-hint="school logo"
        />
      </div>
    </header>
  );
}
