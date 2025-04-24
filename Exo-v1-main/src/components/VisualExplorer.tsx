
import React, { useRef, useEffect } from 'react';
import { Exoplanet } from '@/types/exoplanet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface VisualExplorerProps {
  exoplanets: Exoplanet[];
}

export function VisualExplorer({ exoplanets }: VisualExplorerProps) {
  const scatterPlotRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!scatterPlotRef.current || exoplanets.length === 0) return;
    
    const ctx = scatterPlotRef.current.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Set canvas dimensions to match display size
    const dpr = window.devicePixelRatio || 1;
    ctx.canvas.width = ctx.canvas.clientWidth * dpr;
    ctx.canvas.height = ctx.canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);
    
    // Draw background
    ctx.fillStyle = '#1a1f35';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Draw stars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * ctx.canvas.width;
      const y = Math.random() * ctx.canvas.height;
      const radius = Math.random() * 1.5;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Get valid data points (mass and distance)
    const validPlanets = exoplanets.filter(planet => 
      planet.pl_masse !== null && planet.st_dist !== null
    );
    
    // Find max values for scaling
    let maxMass = 0;
    let maxDistance = 0;
    
    validPlanets.forEach(planet => {
      if (planet.pl_masse && planet.pl_masse > maxMass) {
        maxMass = planet.pl_masse;
      }
      if (planet.st_dist && planet.st_dist > maxDistance) {
        maxDistance = planet.st_dist;
      }
    });
    
    // Padding
    const padding = 30;
    const width = ctx.canvas.clientWidth - padding * 2;
    const height = ctx.canvas.clientHeight - padding * 2;
    
    // Draw axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height + padding);
    ctx.lineTo(width + padding, height + padding);
    ctx.stroke();
    
    // Axis labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Distance from Earth (parsecs)', width / 2 + padding, height + padding + 20);
    
    ctx.save();
    ctx.translate(padding - 20, height / 2 + padding);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Planet Mass (Earth masses)', 0, 0);
    ctx.restore();
    
    // Plot points
    validPlanets.forEach(planet => {
      if (planet.pl_masse === null || planet.st_dist === null) return;
      
      const x = padding + (planet.st_dist / maxDistance) * width;
      const y = height + padding - (planet.pl_masse / maxMass) * height;
      const radius = Math.max(3, Math.min(8, 3 + (planet.pl_masse / maxMass) * 5));
      
      // Draw point
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      
      // Color based on discovery method
      switch (planet.pl_discmethod) {
        case 'Transit':
          ctx.fillStyle = 'rgba(102, 126, 234, 0.8)'; // Indigo
          break;
        case 'Radial Velocity':
          ctx.fillStyle = 'rgba(246, 173, 85, 0.8)'; // Orange
          break;
        case 'Imaging':
          ctx.fillStyle = 'rgba(72, 187, 120, 0.8)'; // Green
          break;
        default:
          ctx.fillStyle = 'rgba(237, 100, 166, 0.8)'; // Pink
      }
      
      ctx.fill();
      
      // Hover effect (to be implemented with interactivity)
    });
    
    // Draw legend
    const legendItems = [
      { method: 'Transit', color: 'rgba(102, 126, 234, 0.8)' },
      { method: 'Radial Velocity', color: 'rgba(246, 173, 85, 0.8)' },
      { method: 'Imaging', color: 'rgba(72, 187, 120, 0.8)' },
      { method: 'Other', color: 'rgba(237, 100, 166, 0.8)' }
    ];
    
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    
    legendItems.forEach((item, i) => {
      const legendX = width - 150;
      const legendY = padding + 20 + i * 20;
      
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(legendX, legendY, 5, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText(item.method, legendX + 15, legendY + 4);
    });
    
  }, [exoplanets]);
  
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-xl">Visual Explorer</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="scatter">
          <TabsList className="mb-4">
            <TabsTrigger value="scatter">Mass vs. Distance</TabsTrigger>
            <TabsTrigger value="orbit">Orbit Visualization</TabsTrigger>
          </TabsList>
          
          <TabsContent value="scatter" className="mt-0">
            <div className="flex flex-col items-center">
              <canvas
                ref={scatterPlotRef}
                className="w-full h-[400px] rounded-md"
                style={{ maxWidth: '800px' }}
              />
              <p className="mt-4 text-sm text-muted-foreground max-w-[600px] text-center">
                This scatter plot shows the relationship between planet mass (Earth masses) and 
                distance from Earth (parsecs). The color indicates the discovery method and the 
                size represents the planet's relative mass.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="orbit" className="mt-0">
            <div className="flex items-center justify-center h-[400px] text-center">
              <p className="text-muted-foreground">
                3D orbit visualization will be implemented in a future update.
                This feature will allow you to explore the orbital characteristics
                of selected exoplanets in an interactive 3D environment.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default VisualExplorer;
