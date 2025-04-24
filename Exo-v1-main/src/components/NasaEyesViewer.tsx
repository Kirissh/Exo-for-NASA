
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Rocket, Maximize2, Minimize2 } from 'lucide-react';

interface NasaEyesViewerProps {
  className?: string;
}

export default function NasaEyesViewer({ className }: NasaEyesViewerProps) {
  const [isMaximized, setIsMaximized] = useState(false);

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="bg-black/80 border-b border-white/10">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Rocket size={18} />
            <span>NASA Eyes on Exoplanets</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={toggleMaximize}>
            {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className={`w-full ${isMaximized ? 'h-[80vh]' : 'h-[500px]'} transition-all duration-300`}>
          <iframe 
            src="https://eyes.nasa.gov/apps/exo/" 
            title="NASA Eyes on Exoplanets"
            className="w-full h-full border-none"
            allow="fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            loading="lazy"
          />
        </div>
      </CardContent>
    </Card>
  );
}
