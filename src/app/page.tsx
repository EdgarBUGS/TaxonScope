'use client';

import { useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useToast } from '@/hooks/use-toast';
import { HistoryItem } from '@/lib/types';
import { AppHeader } from '@/components/app/header';
import { CameraView } from '@/components/app/camera-view';
import { IdentificationResult } from '@/components/app/identification-result';
import { HistoryPanel } from '@/components/app/history-panel';
import { identifyAndSummarizeOrganism } from '@/app/actions';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type ViewState = 'camera' | 'loading' | 'result';

export default function Home() {
  const [viewState, setViewState] = useState<ViewState>('camera');
  const [activeResult, setActiveResult] = useState<HistoryItem | null>(null);
  const [history, setHistory] = useLocalStorage<HistoryItem[]>('taxon-scope-history', []);
  const { toast } = useToast();

  const handleCapture = async (photoDataUri: string) => {
    // Client-side guard: limit to 3 per 24h using localStorage timestamped counts
    try {
      const lsKey = 'ts_caps_meta';
      const windowMs = 24 * 60 * 60 * 1000;
      const now = Date.now();
      const metaRaw = typeof window !== 'undefined' ? window.localStorage.getItem(lsKey) : null;
      let timestamps: number[] = [];
      if (metaRaw) {
        try { timestamps = JSON.parse(metaRaw) as number[]; } catch {}
      }
      // keep only within window
      timestamps = timestamps.filter(t => now - t < windowMs);
      if (timestamps.length >= 3) {
        toast({
          variant: 'destructive',
          title: 'Daily limit reached',
          description: 'You can make up to 3 identifications per day.',
        });
        return;
      }
      // tentatively record attempt (final authority is server)
      const updated = [...timestamps, now];
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(lsKey, JSON.stringify(updated));
      }
    } catch {}

    setViewState('loading');
    try {
      const resultData = await identifyAndSummarizeOrganism({ photoDataUri });
      const newHistoryItem: HistoryItem = {
        id: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        photoDataUri,
        ...resultData,
      };
      
      setHistory([newHistoryItem, ...history]);
      setActiveResult(newHistoryItem);
      setViewState('result');
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Identification Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
      setViewState('camera');
    }
  };

  const handleBackToCamera = () => {
    setActiveResult(null);
    setViewState('camera');
  };
  
  const handleSelectHistoryItem = (item: HistoryItem) => {
    setActiveResult(item);
    setViewState('result');
  };

  const handleClearHistory = () => {
    setHistory([]);
    handleBackToCamera();
  };
  
  const renderMainContent = () => {
    switch (viewState) {
      case 'loading':
        return (
          <Card className="w-full max-w-2xl mx-auto aspect-video flex flex-col items-center justify-center bg-card/50 shadow-lg">
            <CardContent className="text-center p-6">
              <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
              <p className="font-semibold font-headline text-lg text-foreground">Analyzing Image...</p>
              <p className="text-muted-foreground">Our AI is identifying the organism.</p>
            </CardContent>
          </Card>
        );
      case 'result':
        if (activeResult) {
          return <IdentificationResult result={activeResult} onBack={handleBackToCamera} />;
        }
        // Fallback to camera if no active result
        setViewState('camera');
        return <CameraView onCapture={handleCapture} attemptsLeft={getAttemptsLeft()} />;
      case 'camera':
      default:
        return <CameraView onCapture={handleCapture} attemptsLeft={getAttemptsLeft()} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="flex-grow container mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full items-start">
          <div className="lg:col-span-2">{renderMainContent()}</div>
          <div className="lg:col-span-1 lg:sticky lg:top-6">
            <HistoryPanel
              history={history}
              onClearHistory={handleClearHistory}
              onSelectHistoryItem={handleSelectHistoryItem}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function getAttemptsLeft(): number {
  try {
    const lsKey = 'ts_caps_meta';
    const windowMs = 24 * 60 * 60 * 1000;
    const now = Date.now();
    const metaRaw = typeof window !== 'undefined' ? window.localStorage.getItem(lsKey) : null;
    let timestamps: number[] = [];
    if (metaRaw) {
      try { timestamps = JSON.parse(metaRaw) as number[]; } catch {}
    }
    const recent = timestamps.filter(t => now - t < windowMs);
    return Math.max(0, 3 - recent.length);
  } catch {
    return 3;
  }
}
