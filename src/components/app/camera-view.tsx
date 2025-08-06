'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, VideoOff, Upload } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface CameraViewProps {
  onCapture: (imageDataUrl: string) => void;
}

export function CameraView({ onCapture }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCameraPermission(false);
        // Do not toast here as it can be annoying if user doesn't want to give permission
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
      }
    };

    getCameraPermission();
    
    return () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    };
  }, []);

  const handleCapture = useCallback(() => {
    if (videoRef.current && canvasRef.current && hasCameraPermission) {
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
  }, [onCapture, hasCameraPermission]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        onCapture(dataUrl);
      };
      reader.onerror = () => {
        toast({
          variant: 'destructive',
          title: 'File Read Error',
          description: 'Could not read the selected file.',
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  return (
    <Card className="w-full max-w-2xl mx-auto overflow-hidden shadow-lg">
      <CardContent className="p-0 relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-auto aspect-video ${!hasCameraPermission ? 'bg-muted' : ''}`}
        />
        <canvas ref={canvasRef} className="hidden" />
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />

        {hasCameraPermission === null && (
          <div className="absolute inset-0 bg-muted flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="ml-2">Initializing Camera...</p>
          </div>
        )}
        
        {hasCameraPermission === false && (
            <div className="absolute inset-0 bg-muted flex flex-col items-center justify-center p-4">
                <Alert variant="destructive">
                    <VideoOff className="h-4 w-4" />
                    <AlertTitle>Camera Access Not Available</AlertTitle>
                    <AlertDescription>
                        Camera access is denied or not supported. You can upload an image instead.
                    </AlertDescription>
                </Alert>
            </div>
        )}
      </CardContent>
      <CardFooter className="p-4 bg-muted/50 border-t grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Button onClick={handleCapture} disabled={!hasCameraPermission} className="w-full">
          <Camera className="mr-2 h-5 w-5" />
          Capture Organism
        </Button>
        <Button onClick={handleUploadClick} variant="secondary" className="w-full">
          <Upload className="mr-2 h-5 w-5" />
          Upload Image
        </Button>
      </CardFooter>
    </Card>
  );
}
