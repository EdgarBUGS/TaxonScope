'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { HistoryItem } from '@/lib/types';
import { ArrowLeft, BookOpen, Dna, Globe, Crown, Network, Library, ListOrdered, Users, Leaf, ExternalLink } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface IdentificationResultProps {
  result: HistoryItem;
  onBack: () => void;
}

const rankIcons: { [key: string]: React.ReactNode } = {
  domain: <Globe className="h-5 w-5 text-accent" />,
  kingdom: <Crown className="h-5 w-5 text-accent" />,
  phylum: <Network className="h-5 w-5 text-accent" />,
  class: <Library className="h-5 w-5 text-accent" />,
  order: <ListOrdered className="h-5 w-5 text-accent" />,
  family: <Users className="h-5 w-5 text-accent" />,
  genus: <Dna className="h-5 w-5 text-accent" />,
  species: <Leaf className="h-5 w-5 text-accent" />,
};

const taxonomicRanks = ['domain', 'kingdom', 'phylum', 'class', 'order', 'family', 'genus', 'species'];

export function IdentificationResult({ result, onBack }: IdentificationResultProps) {
  const confidencePercentage = Math.round(result.confidence * 100);

  const getWikipediaUrl = (species: string) => `https://en.wikipedia.org/wiki/${species.replace(/ /g, '_')}`;
  const getEolUrl = (species: string) => `https://eol.org/search?q=${species.replace(/ /g, '+')}`;

  return (
    <Card className="w-full max-w-2xl mx-auto overflow-hidden shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
            <div>
                <CardTitle className="font-headline text-3xl italic">{result.species}</CardTitle>
                <CardDescription>Taxonomic Identification Result</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onBack} className="flex-shrink-0">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Scan Another
            </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-accent/50 shadow-md">
            <Image src={result.photoDataUri} alt={`Photo of ${result.species}`} layout="fill" objectFit="cover" data-ai-hint="organism photo" />
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-headline text-lg font-semibold">Identification Confidence</h3>
              <div className="flex items-center gap-4 mt-2">
                <Progress value={confidencePercentage} className="w-full" />
                <span className="font-bold text-lg text-primary">{confidencePercentage}%</span>
              </div>
            </div>
            <div>
                <h3 className="font-headline text-lg font-semibold flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> Summary</h3>
                <p className="text-muted-foreground mt-2 text-sm">{result.summary}</p>
            </div>
          </div>
        </div>

        <Separator />

        <div>
            <h3 className="font-headline text-lg font-semibold">Taxonomic Classification</h3>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {taxonomicRanks.map(rank => (
                    <div key={rank} className="space-y-1 bg-muted/50 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                            {rankIcons[rank]}
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{rank}</p>
                        </div>
                        <p className="font-semibold text-foreground capitalize">{(result as any)[rank]}</p>
                    </div>
                ))}
            </div>
        </div>
        
        <Separator />

        <div>
          <h3 className="font-headline text-lg font-semibold">Learn More</h3>
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
            <Button asChild variant="secondary" className="w-full justify-center">
              <a href={getWikipediaUrl(result.species)} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" /> Wikipedia
              </a>
            </Button>
            <Button asChild variant="secondary" className="w-full justify-center">
              <a href={getEolUrl(result.species)} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" /> Encyclopedia of Life
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
