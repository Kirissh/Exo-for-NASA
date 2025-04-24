
import React from 'react';
import { Button } from '@/components/ui/button';
import { Stars } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FunButton() {
  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "bg-gradient-to-r from-blue-500/80 to-purple-500/80 text-white border border-white/20 relative overflow-hidden transition-all",
          "hover:shadow-lg hover:shadow-indigo-500/20 hover:from-blue-600/80 hover:to-purple-600/80",
        )}
      >
        <a 
          href="https://esahubble.org/images/archive/category/exoplanets/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2"
        >
          <Stars size={18} />
          <span>exo!</span>
        </a>
      </Button>
    </div>
  );
}
