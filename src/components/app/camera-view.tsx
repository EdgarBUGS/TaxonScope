'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, VideoOff } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface CameraViewProps {
  onCapture: (imageDataUrl: string) => void;
}

export function CameraView({ onCapture }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | undefined;

    async function setupCamera() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Camera access is not supported by your browser.');
        setHasCamera(false);
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasCamera(true);
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('Could not access the camera. Please grant permission and try again.');
        setHasCamera(false);
      }
    }

    setupCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        onCapture(dataUrl);
      }
    }
  }, [onCapture]);
  
  return (
    <Card className="w-full max-w-2xl mx-auto overflow-hidden shadow-lg">
      <CardContent className="p-0 relative">
        {hasCamera === null && (
          <div className="aspect-video bg-muted flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="ml-2">Initializing Camera...</p>
          </div>
        )}
        {hasCamera === false && (
          <div className="aspect-video bg-muted flex flex-col items-center justify-center p-4">
             <Alert variant="destructive">
              <VideoOff className="h-4 w-4" />
              <AlertTitle>Camera Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}
        {hasCamera && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-auto aspect-video"
            />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
      <CardFooter className="p-4 bg-muted/50 border-t">
        <Button onClick={handleCapture} disabled={!hasCamera} className="w-full">
          <Camera className="mr-2 h-5 w-5" />
          Capture Organism
        </Button>
      </CardFooter>
    </Card>
  );
}
