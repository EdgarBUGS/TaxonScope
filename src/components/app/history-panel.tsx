'use client';

import { HistoryItem } from '@/lib/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface HistoryPanelProps {
  history: HistoryItem[];
  onClearHistory: () => void;
  onSelectHistoryItem: (item: HistoryItem) => void;
}

export function HistoryPanel({ history, onClearHistory, onSelectHistoryItem }: HistoryPanelProps) {
  return (
    <Card className="h-full flex flex-col shadow-lg">
      <CardHeader className="border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="font-headline flex items-center gap-2">
            <History className="h-5 w-5" />
            Scan History
          </CardTitle>
          {history.length > 0 && (
            <Button variant="ghost" size="icon" onClick={onClearHistory} aria-label="Clear history" className="h-8 w-8">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        <CardDescription>Your previously identified organisms.</CardDescription>
      </CardHeader>
      <CardContent className="p-2 md:p-4 flex-grow overflow-y-auto min-h-[300px]">
        {history.length === 0 ? (
          <div className="text-center text-muted-foreground h-full flex flex-col justify-center items-center p-4">
            <History className="h-12 w-12 mb-4 text-muted-foreground/50" />
            <p className="font-semibold">No history yet</p>
            <p className="text-sm">Your scans will appear here.</p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {history.map(item => (
              <AccordionItem value={item.id} key={item.id}>
                <AccordionTrigger className="hover:no-underline p-2 rounded-md hover:bg-accent/10">
                  <div className="flex items-center gap-4 text-left w-full">
                    <div className="relative h-12 w-12 rounded-md overflow-hidden flex-shrink-0">
                      <Image src={item.photoDataUri} alt={item.species} layout="fill" objectFit="cover" data-ai-hint="organism thumbnail" />
                    </div>
                    <div className="flex-grow">
                        <p className="font-semibold italic truncate">{item.species}</p>
                        <p className="text-xs text-muted-foreground">
                            {new Date(item.timestamp).toLocaleString()}
                        </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-2">
                  <div className="pl-4 pr-2 space-y-3">
                      <p className="text-xs text-muted-foreground line-clamp-3">{item.summary}</p>
                      <Button variant="link" size="sm" className="p-0 h-auto text-primary" onClick={() => onSelectHistoryItem(item)}>View full details &rarr;</Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
