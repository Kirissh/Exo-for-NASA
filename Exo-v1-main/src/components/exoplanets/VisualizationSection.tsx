
import React from 'react';
import { Exoplanet } from '@/types/exoplanet';
import EnhancedVisualizer from '@/components/EnhancedVisualizer';
import NasaEyesViewer from '@/components/NasaEyesViewer';

interface VisualizationSectionProps {
  exoplanets: Exoplanet[];
}

const VisualizationSection = ({ exoplanets }: VisualizationSectionProps) => {
  return (
    <div className="pt-4 space-y-6">
      <EnhancedVisualizer exoplanets={exoplanets} />
      
      {/* NASA Eyes on Exoplanets 3D Viewer */}
      <div>
        <h2 className="text-lg font-semibold mb-3">3D Exoplanet Explorer</h2>
        <NasaEyesViewer />
      </div>
    </div>
  );
};

export default VisualizationSection;
