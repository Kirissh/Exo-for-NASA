
import React, { useRef, useEffect, useState } from 'react';
import { Exoplanet } from '@/types/exoplanet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from '@/contexts/ThemeContext';
import { ChevronDown, Download, RotateCw } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EnhancedVisualizerProps {
  exoplanets: Exoplanet[];
}

type VisualizationMode = 'mass-distance' | 'mass-radius' | 'temperature-orbit' | 'discovery-year';

export default function EnhancedVisualizer({ exoplanets }: EnhancedVisualizerProps) {
  const scatterPlotRef = useRef<HTMLCanvasElement>(null);
  const histogramRef = useRef<HTMLCanvasElement>(null);
  const timelineRef = useRef<HTMLCanvasElement>(null);
  const [vizMode, setVizMode] = useState<VisualizationMode>('mass-distance');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [colorBy, setColorBy] = useState<'discovery' | 'temperature' | 'mass'>('discovery');
  const { theme } = useTheme();
  
  // Draw scatter plot visualization
  useEffect(() => {
    if (!scatterPlotRef.current || exoplanets.length === 0) return;
    
    const ctx = scatterPlotRef.current.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions 
    const dpr = window.devicePixelRatio || 1;
    ctx.canvas.width = ctx.canvas.clientWidth * dpr;
    ctx.canvas.height = ctx.canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);
    
    // Clear canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Background color based on theme
    const bgColor = theme === 'dark' ? '#0a0a0c' : '#f8f8fc';
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Draw stars in background
    if (theme === 'dark') {
      drawStarField(ctx, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
    }
    
    // Determine data points based on visualization mode
    const validPlanets = exoplanets.filter(planet => {
      if (vizMode === 'mass-distance') {
        return planet.pl_masse !== null && planet.st_dist !== null;
      } else if (vizMode === 'mass-radius') {
        return planet.pl_masse !== null && planet.pl_rade !== null;
      } else if (vizMode === 'temperature-orbit') {
        return planet.pl_orbper !== null && planet.pl_eqt !== null;
      } else {
        // discovery-year mode
        return planet.pl_disc !== null && planet.pl_masse !== null;
      }
    });
    
    if (validPlanets.length === 0) {
      drawNoDataMessage(ctx, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
      return;
    }
    
    // Find max values for scaling based on mode and zoom level
    const bounds = getDataBounds(validPlanets, vizMode, zoomLevel);
    
    // Padding for axes
    const padding = 40;
    const width = ctx.canvas.clientWidth - padding * 2;
    const height = ctx.canvas.clientHeight - padding * 2;
    
    // Draw axes
    const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const axisColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)';
    const textColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';
    
    // Draw grid
    drawGrid(ctx, padding, width, height, 5, gridColor);
    
    // Draw axes
    drawAxes(ctx, padding, width, height, axisColor);
    
    // Draw axis labels based on viz mode
    drawAxisLabels(ctx, padding, width, height, vizMode, textColor);
    
    // Plot points
    validPlanets.forEach(planet => {
      let x = 0, y = 0, radius = 4;
      
      if (vizMode === 'mass-distance') {
        if (planet.st_dist === null || planet.pl_masse === null) return;
        x = padding + ((planet.st_dist - bounds.minX) / (bounds.maxX - bounds.minX)) * width;
        y = height + padding - ((planet.pl_masse - bounds.minY) / (bounds.maxY - bounds.minY)) * height;
        radius = Math.max(3, Math.min(8, 3 + (planet.pl_masse / 50) * 5));
      }
      else if (vizMode === 'mass-radius') {
        if (planet.pl_masse === null || planet.pl_rade === null) return;
        x = padding + ((planet.pl_masse - bounds.minX) / (bounds.maxX - bounds.minX)) * width;
        y = height + padding - ((planet.pl_rade - bounds.minY) / (bounds.maxY - bounds.minY)) * height;
        radius = Math.max(3, Math.min(7, 3 + (planet.pl_rade / 3) * 4));
      }
      else if (vizMode === 'temperature-orbit') {
        if (planet.pl_orbper === null || planet.pl_eqt === null) return;
        x = padding + ((planet.pl_orbper - bounds.minX) / (bounds.maxX - bounds.minX)) * width;
        y = height + padding - ((planet.pl_eqt - bounds.minY) / (bounds.maxY - bounds.minY)) * height;
        radius = 4;
      }
      else if (vizMode === 'discovery-year') {
        if (planet.pl_disc === null || planet.pl_masse === null) return;
        x = padding + ((planet.pl_disc - bounds.minX) / (bounds.maxX - bounds.minX)) * width;
        y = height + padding - ((planet.pl_masse - bounds.minY) / (bounds.maxY - bounds.minY)) * height;
        radius = Math.max(3, Math.min(8, 3 + (planet.pl_masse / 50) * 5));
      }
      
      // Draw point
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      
      // Color based on selected attribute
      const pointColor = getPointColor(planet, colorBy, theme);
      ctx.fillStyle = pointColor;
      ctx.fill();
      
      // Add stroke for better visibility
      ctx.strokeStyle = theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
    
    // Draw legend
    drawLegend(ctx, width, padding, colorBy, theme);
    
  }, [exoplanets, vizMode, zoomLevel, colorBy, theme]);
  
  // Draw histogram visualization
  useEffect(() => {
    if (!histogramRef.current || exoplanets.length === 0) return;
    
    const ctx = histogramRef.current.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1;
    ctx.canvas.width = ctx.canvas.clientWidth * dpr;
    ctx.canvas.height = ctx.canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);
    
    // Clear canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Background color based on theme
    const bgColor = theme === 'dark' ? '#0a0a0c' : '#f8f8fc';
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    const padding = 40;
    const width = ctx.canvas.clientWidth - padding * 2;
    const height = ctx.canvas.clientHeight - padding * 2;
    const textColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';
    
    // Group exoplanets by discovery method
    const methodCounts: Record<string, number> = {};
    exoplanets.forEach(planet => {
      const method = planet.pl_discmethod || 'Unknown';
      methodCounts[method] = (methodCounts[method] || 0) + 1;
    });
    
    // Sort methods by count (descending)
    const sortedMethods = Object.keys(methodCounts).sort((a, b) => methodCounts[b] - methodCounts[a]);
    
    // Calculate bar properties
    const barCount = sortedMethods.length;
    const barWidth = Math.max(10, Math.min(40, width / (barCount * 1.5)));
    const barSpacing = barWidth * 0.5;
    
    // Find max count for scaling
    const maxCount = Math.max(...Object.values(methodCounts));
    
    // Draw axes
    const axisColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)';
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height + padding);
    ctx.lineTo(width + padding, height + padding);
    ctx.stroke();
    
    // Y-axis label
    ctx.save();
    ctx.font = '12px Arial';
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.translate(padding - 25, height / 2 + padding);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Number of Exoplanets', 0, 0);
    ctx.restore();
    
    // X-axis label
    ctx.font = '12px Arial';
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.fillText('Discovery Method', width / 2 + padding, height + padding + 30);
    
    // Draw bars
    sortedMethods.forEach((method, i) => {
      const count = methodCounts[method];
      const barHeight = (count / maxCount) * height;
      const x = padding + i * (barWidth + barSpacing);
      const y = height + padding - barHeight;
      
      // Draw bar
      const barColor = getDiscoveryMethodColor(method, theme);
      ctx.fillStyle = barColor;
      ctx.fillRect(x, y, barWidth, barHeight);
      
      // Draw bar border
      ctx.strokeStyle = theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, barWidth, barHeight);
      
      // Draw value on top of bar
      ctx.fillStyle = textColor;
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(count.toString(), x + barWidth / 2, y - 5);
      
      // Draw method label
      ctx.save();
      ctx.translate(x + barWidth / 2, height + padding + 10);
      ctx.rotate(Math.PI / 4); // Angle labels to fit better
      ctx.fillStyle = textColor;
      ctx.font = '9px Arial';
      ctx.textAlign = 'left';
      // Truncate long method names
      const displayMethod = method.length > 15 ? method.substring(0, 12) + '...' : method;
      ctx.fillText(displayMethod, 0, 0);
      ctx.restore();
    });
    
  }, [exoplanets, theme]);
  
  // Draw timeline visualization
  useEffect(() => {
    if (!timelineRef.current || exoplanets.length === 0) return;
    
    const ctx = timelineRef.current.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1;
    ctx.canvas.width = ctx.canvas.clientWidth * dpr;
    ctx.canvas.height = ctx.canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);
    
    // Clear canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Background color based on theme
    const bgColor = theme === 'dark' ? '#0a0a0c' : '#f8f8fc';
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // If theme is dark, add some stars
    if (theme === 'dark') {
      drawStarField(ctx, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
    }
    
    const padding = 40;
    const width = ctx.canvas.clientWidth - padding * 2;
    const height = ctx.canvas.clientHeight - padding * 2;
    const textColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';
    
    // Group exoplanets by discovery year
    interface YearData {
      year: number;
      count: number;
      methods: Record<string, number>;
    }
    
    const yearData: Record<number, YearData> = {};
    
    exoplanets.forEach(planet => {
      if (!planet.pl_disc) return;
      
      if (!yearData[planet.pl_disc]) {
        yearData[planet.pl_disc] = {
          year: planet.pl_disc,
          count: 0,
          methods: {}
        };
      }
      
      yearData[planet.pl_disc].count++;
      
      const method = planet.pl_discmethod || 'Unknown';
      yearData[planet.pl_disc].methods[method] = (yearData[planet.pl_disc].methods[method] || 0) + 1;
    });
    
    // Convert to array and sort by year
    const timelineData = Object.values(yearData).sort((a, b) => a.year - b.year);
    
    if (timelineData.length === 0) {
      drawNoDataMessage(ctx, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
      return;
    }
    
    // Find min/max years and max count
    const minYear = timelineData[0].year;
    const maxYear = timelineData[timelineData.length - 1].year;
    const maxCount = Math.max(...timelineData.map(d => d.count));
    
    // Draw axes
    const axisColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)';
    const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    // Draw grid lines
    drawGrid(ctx, padding, width, height, 5, gridColor);
    
    // Draw axes
    drawAxes(ctx, padding, width, height, axisColor);
    
    // Y-axis label
    ctx.save();
    ctx.font = '12px Arial';
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.translate(padding - 25, height / 2 + padding);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Exoplanets Discovered', 0, 0);
    ctx.restore();
    
    // X-axis label
    ctx.font = '12px Arial';
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.fillText('Year of Discovery', width / 2 + padding, height + padding + 30);
    
    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = theme === 'dark' ? '#6366f1' : '#4f46e5';
    ctx.lineWidth = 2;
    
    // Draw timeline path
    timelineData.forEach((data, i) => {
      const x = padding + ((data.year - minYear) / (maxYear - minYear)) * width;
      const y = height + padding - (data.count / maxCount) * height;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    
    // Add data points
    timelineData.forEach(data => {
      const x = padding + ((data.year - minYear) / (maxYear - minYear)) * width;
      const y = height + padding - (data.count / maxCount) * height;
      
      // Draw point
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = theme === 'dark' ? '#818cf8' : '#4f46e5';
      ctx.fill();
      ctx.strokeStyle = theme === 'dark' ? 'white' : 'black';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw year labels for significant years or at regular intervals
      if (data.count > maxCount * 0.7 || data.year % 5 === 0) {
        ctx.font = '10px Arial';
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.fillText(data.year.toString(), x, height + padding + 15);
        
        // Draw value above significant points
        if (data.count > maxCount * 0.5) {
          ctx.fillText(data.count.toString(), x, y - 10);
        }
      }
    });
    
  }, [exoplanets, theme]);
  
  // Handle export of the current visualization
  const handleExportVisualization = () => {
    let canvas: HTMLCanvasElement | null = null;
    
    // Determine which canvas to export based on active tab
    if (document.querySelector('[data-state="active"]')?.getAttribute('value') === 'scatter') {
      canvas = scatterPlotRef.current;
    } else if (document.querySelector('[data-state="active"]')?.getAttribute('value') === 'methods') {
      canvas = histogramRef.current;
    } else if (document.querySelector('[data-state="active"]')?.getAttribute('value') === 'timeline') {
      canvas = timelineRef.current;
    }
    
    if (!canvas) return;
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.download = `cosmic-explorer-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };
  
  return (
    <Card className="bg-card border-border shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Advanced Visualization</CardTitle>
          <Button variant="outline" size="sm" onClick={handleExportVisualization} className="gap-2">
            <Download size={16} />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="scatter" className="w-full">
          <div className="flex flex-col sm:flex-row justify-between mb-4">
            <TabsList className="mb-4 sm:mb-0">
              <TabsTrigger value="scatter">Scatter Plot</TabsTrigger>
              <TabsTrigger value="methods">Discovery Methods</TabsTrigger>
              <TabsTrigger value="timeline">Discovery Timeline</TabsTrigger>
            </TabsList>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <TabsContent value="scatter" className="mt-0 mb-0">
                <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                  <Select
                    value={vizMode}
                    onValueChange={(value) => setVizMode(value as VisualizationMode)}
                  >
                    <SelectTrigger className="h-9 w-full sm:w-[180px]">
                      <SelectValue placeholder="Visualization Mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mass-distance">Mass vs. Distance</SelectItem>
                      <SelectItem value="mass-radius">Mass vs. Radius</SelectItem>
                      <SelectItem value="temperature-orbit">Temperature vs. Orbit</SelectItem>
                      <SelectItem value="discovery-year">Discovery Year</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={colorBy}
                    onValueChange={(value) => setColorBy(value as 'discovery' | 'temperature' | 'mass')}
                  >
                    <SelectTrigger className="h-9 w-full sm:w-[120px]">
                      <SelectValue placeholder="Color By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="discovery">Discovery Method</SelectItem>
                      <SelectItem value="temperature">Temperature</SelectItem>
                      <SelectItem value="mass">Mass</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                    <span className="text-xs w-6">
                      {zoomLevel}%
                    </span>
                    <Slider
                      value={[zoomLevel]}
                      min={10}
                      max={200}
                      step={10}
                      className="w-24"
                      onValueChange={(value) => setZoomLevel(value[0])}
                    />
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoomLevel(100)}>
                      <RotateCw size={14} />
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </div>
          </div>
          
          <ScrollArea className="h-[500px] rounded-md">
            <TabsContent value="scatter" className="mt-0">
              <div className="flex flex-col items-center">
                <canvas 
                  ref={scatterPlotRef} 
                  className="w-full h-[500px] rounded-md" 
                />
                <p className="mt-4 text-sm text-muted-foreground max-w-[800px] text-center">
                  {vizMode === 'mass-distance' && 
                    "This scatter plot shows the relationship between planet mass (Earth masses) and distance from Earth (parsecs). The size represents planet mass and color indicates discovery method."}
                  
                  {vizMode === 'mass-radius' && 
                    "This visualization plots exoplanet mass (Earth masses) against radius (Earth radii), revealing density patterns. Points closer to the bottom right are denser planets."}
                  
                  {vizMode === 'temperature-orbit' && 
                    "This chart visualizes equilibrium temperature against orbital period. Planets in the middle range might have conditions more suitable for liquid water."}
                    
                  {vizMode === 'discovery-year' && 
                    "This view shows the mass distribution of exoplanets discovered over time, highlighting trends in detection capabilities."}
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="methods" className="mt-0">
              <div className="flex flex-col items-center">
                <canvas 
                  ref={histogramRef} 
                  className="w-full h-[500px] rounded-md" 
                />
                <p className="mt-4 text-sm text-muted-foreground max-w-[800px] text-center">
                  This histogram shows the distribution of exoplanet discoveries by detection method. 
                  Transit and radial velocity techniques have historically been the most prolific methods for identifying new worlds.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="timeline" className="mt-0">
              <div className="flex flex-col items-center">
                <canvas 
                  ref={timelineRef} 
                  className="w-full h-[500px] rounded-md" 
                />
                <p className="mt-4 text-sm text-muted-foreground max-w-[800px] text-center">
                  The timeline shows the number of exoplanets discovered each year. Note the significant increase following the launch of the Kepler Space Telescope in 2009,
                  demonstrating how advances in technology have accelerated our rate of discovery.
                </p>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Helper functions for visualization

function drawGrid(
  ctx: CanvasRenderingContext2D, 
  padding: number, 
  width: number, 
  height: number, 
  divisions: number, 
  color: string
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.5;
  
  // Vertical grid lines
  for (let i = 0; i <= divisions; i++) {
    const x = padding + (width / divisions) * i;
    ctx.beginPath();
    ctx.moveTo(x, padding);
    ctx.lineTo(x, height + padding);
    ctx.stroke();
  }
  
  // Horizontal grid lines
  for (let i = 0; i <= divisions; i++) {
    const y = padding + (height / divisions) * i;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width + padding, y);
    ctx.stroke();
  }
}

function drawAxes(
  ctx: CanvasRenderingContext2D, 
  padding: number, 
  width: number, 
  height: number, 
  color: string
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height + padding);
  ctx.lineTo(width + padding, height + padding);
  ctx.stroke();
}

function drawAxisLabels(
  ctx: CanvasRenderingContext2D, 
  padding: number, 
  width: number, 
  height: number, 
  vizMode: VisualizationMode,
  textColor: string
) {
  ctx.fillStyle = textColor;
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  
  // X-axis label
  let xLabel = '';
  if (vizMode === 'mass-distance') {
    xLabel = 'Distance from Earth (parsecs)';
  } else if (vizMode === 'mass-radius') {
    xLabel = 'Planet Mass (Earth masses)';
  } else if (vizMode === 'temperature-orbit') {
    xLabel = 'Orbital Period (days)';
  } else if (vizMode === 'discovery-year') {
    xLabel = 'Discovery Year';
  }
  ctx.fillText(xLabel, width / 2 + padding, height + padding + 25);
  
  // Y-axis label
  ctx.save();
  ctx.translate(padding - 25, height / 2 + padding);
  ctx.rotate(-Math.PI / 2);
  
  let yLabel = '';
  if (vizMode === 'mass-distance') {
    yLabel = 'Planet Mass (Earth masses)';
  } else if (vizMode === 'mass-radius') {
    yLabel = 'Planet Radius (Earth radii)';
  } else if (vizMode === 'temperature-orbit') {
    yLabel = 'Equilibrium Temperature (K)';
  } else if (vizMode === 'discovery-year') {
    yLabel = 'Planet Mass (Earth masses)';
  }
  
  ctx.fillText(yLabel, 0, 0);
  ctx.restore();
}

function drawStarField(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  // Draw random stars in background
  for (let i = 0; i < 150; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const radius = Math.random() * 1.2;
    const opacity = Math.random() * 0.8 + 0.2;
    
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.fill();
  }
}

function drawNoDataMessage(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  ctx.fillStyle = 'rgba(150, 150, 150, 0.8)';
  ctx.font = '14px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('No data available for selected visualization', width / 2, height / 2);
}

function drawLegend(
  ctx: CanvasRenderingContext2D,
  width: number,
  padding: number,
  colorBy: 'discovery' | 'temperature' | 'mass',
  theme: string
) {
  const textColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)';
  ctx.font = '12px Arial';
  ctx.textAlign = 'left';
  ctx.fillStyle = textColor;
  
  // Draw legend title
  let legendTitle = '';
  if (colorBy === 'discovery') {
    legendTitle = 'Discovery Methods:';
    
    // Common discovery methods
    const methods = [
      { method: 'Transit', color: theme === 'dark' ? 'rgba(102, 126, 234, 0.8)' : 'rgba(79, 70, 229, 0.8)' },
      { method: 'Radial Velocity', color: theme === 'dark' ? 'rgba(246, 173, 85, 0.8)' : 'rgba(217, 119, 6, 0.8)' },
      { method: 'Imaging', color: theme === 'dark' ? 'rgba(72, 187, 120, 0.8)' : 'rgba(4, 120, 87, 0.8)' },
      { method: 'Other', color: theme === 'dark' ? 'rgba(237, 100, 166, 0.8)' : 'rgba(190, 24, 93, 0.8)' }
    ];
    
    ctx.fillText(legendTitle, width - 150, padding + 15);
    
    methods.forEach((item, i) => {
      const legendY = padding + 35 + i * 20;
      
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(width - 140, legendY, 5, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = textColor;
      ctx.fillText(item.method, width - 130, legendY + 4);
    });
  } 
  else if (colorBy === 'temperature') {
    legendTitle = 'Temperature (K):';
    
    const temps = [
      { range: '< 200 (Cold)', color: theme === 'dark' ? 'rgba(59, 130, 246, 0.8)' : 'rgba(29, 78, 216, 0.8)' },
      { range: '200-400 (Temperate)', color: theme === 'dark' ? 'rgba(52, 211, 153, 0.8)' : 'rgba(4, 120, 87, 0.8)' },
      { range: '400-800 (Warm)', color: theme === 'dark' ? 'rgba(251, 191, 36, 0.8)' : 'rgba(217, 119, 6, 0.8)' },
      { range: '> 800 (Hot)', color: theme === 'dark' ? 'rgba(239, 68, 68, 0.8)' : 'rgba(185, 28, 28, 0.8)' }
    ];
    
    ctx.fillText(legendTitle, width - 150, padding + 15);
    
    temps.forEach((item, i) => {
      const legendY = padding + 35 + i * 20;
      
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(width - 140, legendY, 5, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = textColor;
      ctx.fillText(item.range, width - 130, legendY + 4);
    });
  } 
  else if (colorBy === 'mass') {
    legendTitle = 'Mass (Earth masses):';
    
    const masses = [
      { range: '< 1 (Sub-Earth)', color: theme === 'dark' ? 'rgba(96, 165, 250, 0.8)' : 'rgba(37, 99, 235, 0.8)' },
      { range: '1-5 (Earth-like)', color: theme === 'dark' ? 'rgba(74, 222, 128, 0.8)' : 'rgba(22, 163, 74, 0.8)' },
      { range: '5-20 (Super-Earth)', color: theme === 'dark' ? 'rgba(250, 204, 21, 0.8)' : 'rgba(202, 138, 4, 0.8)' },
      { range: '> 20 (Gas Giant)', color: theme === 'dark' ? 'rgba(248, 113, 113, 0.8)' : 'rgba(220, 38, 38, 0.8)' }
    ];
    
    ctx.fillText(legendTitle, width - 150, padding + 15);
    
    masses.forEach((item, i) => {
      const legendY = padding + 35 + i * 20;
      
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(width - 140, legendY, 5, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = textColor;
      ctx.fillText(item.range, width - 130, legendY + 4);
    });
  }
}

function getPointColor(
  planet: Exoplanet,
  colorBy: 'discovery' | 'temperature' | 'mass',
  theme: string
): string {
  if (colorBy === 'discovery') {
    switch (planet.pl_discmethod) {
      case 'Transit':
        return theme === 'dark' ? 'rgba(102, 126, 234, 0.8)' : 'rgba(79, 70, 229, 0.8)'; // Indigo
      case 'Radial Velocity':
        return theme === 'dark' ? 'rgba(246, 173, 85, 0.8)' : 'rgba(217, 119, 6, 0.8)'; // Orange
      case 'Imaging':
        return theme === 'dark' ? 'rgba(72, 187, 120, 0.8)' : 'rgba(4, 120, 87, 0.8)'; // Green
      default:
        return theme === 'dark' ? 'rgba(237, 100, 166, 0.8)' : 'rgba(190, 24, 93, 0.8)'; // Pink
    }
  } 
  else if (colorBy === 'temperature') {
    if (!planet.pl_eqt) return theme === 'dark' ? 'rgba(156, 163, 175, 0.8)' : 'rgba(107, 114, 128, 0.8)'; // Gray for unknown
    
    if (planet.pl_eqt < 200) {
      return theme === 'dark' ? 'rgba(59, 130, 246, 0.8)' : 'rgba(29, 78, 216, 0.8)'; // Blue (cold)
    } else if (planet.pl_eqt < 400) {
      return theme === 'dark' ? 'rgba(52, 211, 153, 0.8)' : 'rgba(4, 120, 87, 0.8)'; // Green (temperate)
    } else if (planet.pl_eqt < 800) {
      return theme === 'dark' ? 'rgba(251, 191, 36, 0.8)' : 'rgba(217, 119, 6, 0.8)'; // Yellow (warm)
    } else {
      return theme === 'dark' ? 'rgba(239, 68, 68, 0.8)' : 'rgba(185, 28, 28, 0.8)'; // Red (hot)
    }
  }
  else { // Mass
    if (!planet.pl_masse) return theme === 'dark' ? 'rgba(156, 163, 175, 0.8)' : 'rgba(107, 114, 128, 0.8)'; // Gray for unknown
    
    if (planet.pl_masse < 1) {
      return theme === 'dark' ? 'rgba(96, 165, 250, 0.8)' : 'rgba(37, 99, 235, 0.8)'; // Blue (sub-Earth)
    } else if (planet.pl_masse < 5) {
      return theme === 'dark' ? 'rgba(74, 222, 128, 0.8)' : 'rgba(22, 163, 74, 0.8)'; // Green (Earth-like)
    } else if (planet.pl_masse < 20) {
      return theme === 'dark' ? 'rgba(250, 204, 21, 0.8)' : 'rgba(202, 138, 4, 0.8)'; // Yellow (super-Earth)
    } else {
      return theme === 'dark' ? 'rgba(248, 113, 113, 0.8)' : 'rgba(220, 38, 38, 0.8)'; // Red (gas giant)
    }
  }
}

function getDiscoveryMethodColor(method: string, theme: string): string {
  switch (method) {
    case 'Transit':
      return theme === 'dark' ? 'rgba(102, 126, 234, 0.8)' : 'rgba(79, 70, 229, 0.8)';
    case 'Radial Velocity':
      return theme === 'dark' ? 'rgba(246, 173, 85, 0.8)' : 'rgba(217, 119, 6, 0.8)';
    case 'Imaging':
      return theme === 'dark' ? 'rgba(72, 187, 120, 0.8)' : 'rgba(4, 120, 87, 0.8)';
    case 'Microlensing':
      return theme === 'dark' ? 'rgba(167, 139, 250, 0.8)' : 'rgba(126, 34, 206, 0.8)';
    case 'Astrometry':
      return theme === 'dark' ? 'rgba(251, 146, 60, 0.8)' : 'rgba(194, 65, 12, 0.8)';
    case 'TTV':
      return theme === 'dark' ? 'rgba(232, 121, 249, 0.8)' : 'rgba(168, 85, 247, 0.8)';
    default:
      return theme === 'dark' ? 'rgba(237, 100, 166, 0.8)' : 'rgba(190, 24, 93, 0.8)';
  }
}

function getDataBounds(
  planets: Exoplanet[], 
  mode: VisualizationMode,
  zoomLevel: number
): { minX: number, maxX: number, minY: number, maxY: number } {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  
  // Handle different visualization modes
  planets.forEach(planet => {
    if (mode === 'mass-distance') {
      if (planet.st_dist !== null) {
        minX = Math.min(minX, planet.st_dist);
        maxX = Math.max(maxX, planet.st_dist);
      }
      if (planet.pl_masse !== null) {
        minY = Math.min(minY, planet.pl_masse);
        maxY = Math.max(maxY, planet.pl_masse);
      }
    }
    else if (mode === 'mass-radius') {
      if (planet.pl_masse !== null) {
        minX = Math.min(minX, planet.pl_masse);
        maxX = Math.max(maxX, planet.pl_masse);
      }
      if (planet.pl_rade !== null) {
        minY = Math.min(minY, planet.pl_rade);
        maxY = Math.max(maxY, planet.pl_rade);
      }
    }
    else if (mode === 'temperature-orbit') {
      if (planet.pl_orbper !== null) {
        minX = Math.min(minX, planet.pl_orbper);
        maxX = Math.max(maxX, planet.pl_orbper);
      }
      if (planet.pl_eqt !== null) {
        minY = Math.min(minY, planet.pl_eqt);
        maxY = Math.max(maxY, planet.pl_eqt);
      }
    }
    else if (mode === 'discovery-year') {
      if (planet.pl_disc !== null) {
        minX = Math.min(minX, planet.pl_disc);
        maxX = Math.max(maxX, planet.pl_disc);
      }
      if (planet.pl_masse !== null) {
        minY = Math.min(minY, planet.pl_masse);
        maxY = Math.max(maxY, planet.pl_masse);
      }
    }
  });
  
  // Apply zoom level - adjust the max values to zoom in/out
  if (mode === 'mass-distance') {
    maxY = maxY * (100 / zoomLevel);
    maxX = maxX * (100 / zoomLevel);
  }
  else if (mode === 'mass-radius') {
    maxX = maxX * (100 / zoomLevel);
    maxY = maxY * (100 / zoomLevel);
  }
  else if (mode === 'temperature-orbit') {
    maxX = maxX * (100 / zoomLevel);
  }
  
  // For discovery year, don't zoom the X axis (years)
  
  // Set defaults if no data is available
  if (minX === Infinity) minX = 0;
  if (maxX === -Infinity) maxX = 100;
  if (minY === Infinity) minY = 0;
  if (maxY === -Infinity) maxY = 100;
  
  // Ensure we don't have zero range
  if (minX === maxX) maxX += 1;
  if (minY === maxY) maxY += 1;
  
  return { minX, maxX, minY, maxY };
}
