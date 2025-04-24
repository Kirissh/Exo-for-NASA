
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Exoplanet } from '@/types/exoplanet';
import { ExternalLink, Rocket, Globe as Planet, Thermometer, Waves, Ruler, Star as StarIcon, CircleDot as Orbit } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExoplanetDetailDialogProps {
  planet: Exoplanet | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Import NoteTakingFeature
import { NoteTakingFeature } from '@/components/NoteTakingFeature';

export default function ExoplanetDetailDialog({ 
  planet, 
  open, 
  onOpenChange 
}: ExoplanetDetailDialogProps) {
  if (!planet) return null;
  
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'Unknown';
    if (typeof value === 'number') {
      return Number.isInteger(value) ? value.toString() : value.toFixed(2);
    }
    return String(value);
  };
  
  // Calculate habitable zone metrics (simplified)
  const isInHabitableZone = planet.pl_eqt ? planet.pl_eqt > 180 && planet.pl_eqt < 310 : false;
  const habitabilityScore = isInHabitableZone ? Math.min(100, Math.max(0, 100 - Math.abs(273 - (planet.pl_eqt || 0)) * 2)) : 0;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Planet className="h-6 w-6" />
              {planet.pl_name}
            </DialogTitle>
            <Badge variant={isInHabitableZone ? "outline" : "secondary"} className={isInHabitableZone ? "bg-green-900/20 text-green-400" : ""}>
              {isInHabitableZone ? "Potentially Habitable" : "Non-Habitable"}
            </Badge>
          </div>
          <DialogDescription>
            Discovered in {planet.pl_disc} via {planet.pl_discmethod} by {planet.pl_facility}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="physical">Physical Properties</TabsTrigger>
            <TabsTrigger value="stellar">Stellar Data</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="col-span-2">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
                        <Orbit size={14} /> Orbital Properties
                      </h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">Period:</span>
                          <span>{formatValue(planet.pl_orbper)} days</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">Semi-major axis:</span>
                          <span>{formatValue(planet.pl_orbsmax)} AU</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">Eccentricity:</span>
                          <span>{formatValue(planet.pl_orbeccen)}</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
                        <Ruler size={14} /> Planet Size
                      </h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">Mass:</span>
                          <span>{formatValue(planet.pl_masse)} M⊕</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">Radius:</span>
                          <span>{formatValue(planet.pl_rade)} R⊕</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">Temperature:</span>
                          <span>{formatValue(planet.pl_eqt)} K</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Habitability Card */}
              <Card>
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-3 flex items-center gap-1">
                    <Thermometer size={16} /> Habitability Analysis
                  </h4>
                  <div className="space-y-2">
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${habitabilityScore > 50 ? 'bg-green-500' : 'bg-amber-500'}`} 
                        style={{width: `${habitabilityScore}%`}}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Low</span>
                      <span className={habitabilityScore > 50 ? 'text-green-400' : 'text-amber-400'}>
                        {habitabilityScore.toFixed(0)}%
                      </span>
                      <span className="text-muted-foreground">High</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    {isInHabitableZone 
                      ? "This planet falls within the estimated habitable zone temperature range of its star."
                      : "This planet is outside the estimated habitable zone temperature range."
                    }
                  </p>
                </CardContent>
              </Card>
              
              {/* Distance Card */}
              <Card>
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-2 flex items-center gap-1">
                    <Rocket size={16} /> Distance from Earth
                  </h4>
                  <div className="space-y-1">
                    <div className="flex items-end gap-1">
                      <span className="text-2xl font-bold">{formatValue(planet.st_dist)}</span>
                      <span className="text-sm text-muted-foreground">parsecs</span>
                    </div>
                    <div className="flex items-end gap-1">
                      <span className="text-lg">{planet.st_dist ? (planet.st_dist * 3.26).toFixed(1) : 'Unknown'}</span>
                      <span className="text-sm text-muted-foreground">light years</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {planet.st_dist 
                        ? `At this distance, a radio signal would take approximately ${(planet.st_dist * 3.26).toFixed(0)} years to reach this system.`
                        : "Distance unknown - unable to calculate signal travel time."
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-end">
              <Button variant="outline" size="sm" asChild className="gap-2">
                <a href={planet.nasa_url} target="_blank" rel="noopener noreferrer">
                  NASA Exoplanet Archive <ExternalLink size={14} />
                </a>
              </Button>
            </div>
          </TabsContent>
          
          {/* Physical Properties Tab */}
          <TabsContent value="physical" className="space-y-4 mt-4">
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-4">Planet Classifications</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium mb-2">Mass Classification</h5>
                    <ul className="space-y-1 text-sm">
                      <li className={`flex items-center gap-2 ${planet.pl_masse && planet.pl_masse < 0.1 ? 'text-blue-400 font-medium' : 'text-muted-foreground'}`}>
                        <span className="w-3 h-3 bg-blue-400 rounded-full inline-block"></span>
                        Mercurian (&lt; 0.1 M⊕)
                      </li>
                      <li className={`flex items-center gap-2 ${planet.pl_masse && planet.pl_masse >= 0.1 && planet.pl_masse < 0.5 ? 'text-blue-400 font-medium' : 'text-muted-foreground'}`}>
                        <span className="w-3 h-3 bg-cyan-400 rounded-full inline-block"></span>
                        Sub-Earth (0.1 - 0.5 M⊕)
                      </li>
                      <li className={`flex items-center gap-2 ${planet.pl_masse && planet.pl_masse >= 0.5 && planet.pl_masse < 2 ? 'text-green-400 font-medium' : 'text-muted-foreground'}`}>
                        <span className="w-3 h-3 bg-green-400 rounded-full inline-block"></span>
                        Earth-like (0.5 - 2 M⊕)
                      </li>
                      <li className={`flex items-center gap-2 ${planet.pl_masse && planet.pl_masse >= 2 && planet.pl_masse < 10 ? 'text-emerald-400 font-medium' : 'text-muted-foreground'}`}>
                        <span className="w-3 h-3 bg-emerald-400 rounded-full inline-block"></span>
                        Super-Earth (2 - 10 M⊕)
                      </li>
                      <li className={`flex items-center gap-2 ${planet.pl_masse && planet.pl_masse >= 10 && planet.pl_masse < 50 ? 'text-yellow-400 font-medium' : 'text-muted-foreground'}`}>
                        <span className="w-3 h-3 bg-yellow-400 rounded-full inline-block"></span>
                        Neptune-like (10 - 50 M⊕)
                      </li>
                      <li className={`flex items-center gap-2 ${planet.pl_masse && planet.pl_masse >= 50 ? 'text-red-400 font-medium' : 'text-muted-foreground'}`}>
                        <span className="w-3 h-3 bg-red-400 rounded-full inline-block"></span>
                        Gas Giant (&gt; 50 M⊕)
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium mb-2">Orbital Classification</h5>
                    <ul className="space-y-1 text-sm">
                      <li className={`flex items-center gap-2 ${planet.pl_orbper && planet.pl_orbper < 1 ? 'text-red-400 font-medium' : 'text-muted-foreground'}`}>
                        <span className="w-3 h-3 bg-red-400 rounded-full inline-block"></span>
                        Ultra-short Period (&lt; 1 day)
                      </li>
                      <li className={`flex items-center gap-2 ${planet.pl_orbper && planet.pl_orbper >= 1 && planet.pl_orbper < 10 ? 'text-orange-400 font-medium' : 'text-muted-foreground'}`}>
                        <span className="w-3 h-3 bg-orange-400 rounded-full inline-block"></span>
                        Hot Orbit (1 - 10 days)
                      </li>
                      <li className={`flex items-center gap-2 ${planet.pl_orbper && planet.pl_orbper >= 10 && planet.pl_orbper < 100 ? 'text-yellow-400 font-medium' : 'text-muted-foreground'}`}>
                        <span className="w-3 h-3 bg-yellow-400 rounded-full inline-block"></span>
                        Warm Orbit (10 - 100 days)
                      </li>
                      <li className={`flex items-center gap-2 ${planet.pl_orbper && planet.pl_orbper >= 100 && planet.pl_orbper < 400 ? 'text-green-400 font-medium' : 'text-muted-foreground'}`}>
                        <span className="w-3 h-3 bg-green-400 rounded-full inline-block"></span>
                        Temperate Orbit (100 - 400 days)
                      </li>
                      <li className={`flex items-center gap-2 ${planet.pl_orbper && planet.pl_orbper >= 400 ? 'text-blue-400 font-medium' : 'text-muted-foreground'}`}>
                        <span className="w-3 h-3 bg-blue-400 rounded-full inline-block"></span>
                        Cold Orbit (&gt; 400 days)
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-3">Physical Data</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <ul className="space-y-3 text-sm">
                      <li>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Mass (Earth masses):</span>
                          <span className="font-medium">{formatValue(planet.pl_masse)}</span>
                        </div>
                        {planet.pl_masse && (
                          <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                            <div 
                              className="h-1.5 rounded-full bg-primary" 
                              style={{width: `${Math.min(100, (planet.pl_masse / 50) * 100)}%`}}
                            ></div>
                          </div>
                        )}
                      </li>
                      <li>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Radius (Earth radii):</span>
                          <span className="font-medium">{formatValue(planet.pl_rade)}</span>
                        </div>
                        {planet.pl_rade && (
                          <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                            <div 
                              className="h-1.5 rounded-full bg-primary" 
                              style={{width: `${Math.min(100, (planet.pl_rade / 15) * 100)}%`}}
                            ></div>
                          </div>
                        )}
                      </li>
                      <li>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Orbital Period (days):</span>
                          <span className="font-medium">{formatValue(planet.pl_orbper)}</span>
                        </div>
                        {planet.pl_orbper && (
                          <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                            <div 
                              className="h-1.5 rounded-full bg-primary" 
                              style={{width: `${Math.min(100, (planet.pl_orbper / 400) * 100)}%`}}
                            ></div>
                          </div>
                        )}
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <ul className="space-y-3 text-sm">
                      <li>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Orbital Eccentricity:</span>
                          <span className="font-medium">{formatValue(planet.pl_orbeccen)}</span>
                        </div>
                        {planet.pl_orbeccen !== null && (
                          <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                            <div 
                              className="h-1.5 rounded-full bg-primary" 
                              style={{width: `${Math.min(100, planet.pl_orbeccen * 100)}%`}}
                            ></div>
                          </div>
                        )}
                      </li>
                      <li>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Equilibrium Temperature (K):</span>
                          <span className="font-medium">{formatValue(planet.pl_eqt)}</span>
                        </div>
                        {planet.pl_eqt && (
                          <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                            <div 
                              className={`h-1.5 rounded-full ${planet.pl_eqt > 600 ? 'bg-red-500' : planet.pl_eqt > 300 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                              style={{width: `${Math.min(100, (planet.pl_eqt / 1000) * 100)}%`}}
                            ></div>
                          </div>
                        )}
                      </li>
                      <li>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Semi-Major Axis (AU):</span>
                          <span className="font-medium">{formatValue(planet.pl_orbsmax)}</span>
                        </div>
                        {planet.pl_orbsmax && (
                          <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                            <div 
                              className="h-1.5 rounded-full bg-primary" 
                              style={{width: `${Math.min(100, (planet.pl_orbsmax / 10) * 100)}%`}}
                            ></div>
                          </div>
                        )}
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Stellar Data Tab */}
          <TabsContent value="stellar" className="space-y-4 mt-4">
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-3 flex items-center gap-1">
                  <StarIcon size={16} /> Host Star Data
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-sm font-medium mb-2">Stellar Properties</h5>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Spectral Type:</span>
                        <span>{formatValue(planet.st_spectype)}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Stellar Mass (M☉):</span>
                        <span>{formatValue(planet.st_mass)}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Stellar Radius (R☉):</span>
                        <span>{formatValue(planet.st_rad)}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Effective Temperature (K):</span>
                        <span>{formatValue(planet.st_teff)}</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium mb-2">Star Classification</h5>
                    {planet.st_spectype ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-12 h-12 rounded-full" 
                            style={{ 
                              background: getStellarTypeColor(planet.st_spectype),
                              boxShadow: `0 0 15px 5px ${getStellarTypeGlow(planet.st_spectype)}` 
                            }}
                          ></div>
                          <div>
                            <div className="font-medium">Type {planet.st_spectype?.[0] || '?'}</div>
                            <div className="text-xs text-muted-foreground">
                              {getStellarTypeDescription(planet.st_spectype)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm italic">Spectral data not available</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-3 flex items-center gap-1">
                  <Waves size={16} /> Stellar Habitable Zone
                </h4>
                
                {planet.st_mass && planet.st_teff ? (
                  <div className="space-y-4">
                    <div className="relative h-12 w-full bg-gradient-to-r from-red-500/30 via-green-500/30 to-blue-500/30 rounded-md overflow-hidden">
                      {planet.pl_orbsmax && (
                        <div 
                          className="absolute top-0 h-full w-1 bg-white"
                          style={{ left: `${getHabitableZonePosition(planet)}%` }}
                        ></div>
                      )}
                      
                      {/* Habitable Zone Marker */}
                      <div className="absolute top-0 h-full bg-green-500/50"
                        style={{ 
                          left: `${getHabitableZoneInner(planet.st_mass, planet.st_teff)}%`, 
                          width: `${getHabitableZoneOuter(planet.st_mass, planet.st_teff) - getHabitableZoneInner(planet.st_mass, planet.st_teff)}%` 
                        }}
                      ></div>
                      
                      {/* Labels */}
                      <div className="absolute bottom-0 left-2 text-[10px] text-red-300">Hot</div>
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-[10px] text-green-300">Habitable</div>
                      <div className="absolute bottom-0 right-2 text-[10px] text-blue-300">Cold</div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      {planet.pl_orbsmax 
                        ? isInHabitableZone 
                          ? `This planet orbits at ${planet.pl_orbsmax.toFixed(2)} AU, which may place it within the habitable zone of its star.`
                          : `This planet orbits at ${planet.pl_orbsmax.toFixed(2)} AU, outside the estimated habitable zone of its star.`
                        : "Orbital data insufficient to determine position in habitable zone."
                      }
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm italic">
                    Insufficient stellar data to estimate habitable zone
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Notes Tab */}
          <TabsContent value="notes" className="mt-4">
            <NoteTakingFeature 
              exoplanetId={planet.pl_name} 
              exoplanetName={planet.pl_name}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// Helper functions for stellar data visualization
function getStellarTypeColor(spectralType: string | null): string {
  if (!spectralType) return 'rgb(200, 200, 200)';
  
  const type = spectralType.charAt(0).toUpperCase();
  switch (type) {
    case 'O': return 'rgb(155, 176, 255)'; // Blue
    case 'B': return 'rgb(170, 191, 255)'; // Blue-white
    case 'A': return 'rgb(213, 224, 255)'; // White
    case 'F': return 'rgb(249, 245, 231)'; // Yellow-white
    case 'G': return 'rgb(255, 237, 176)'; // Yellow (Sun-like)
    case 'K': return 'rgb(255, 218, 181)'; // Orange
    case 'M': return 'rgb(255, 180, 180)'; // Red
    case 'L': return 'rgb(200, 120, 120)'; // Dark red
    case 'T': return 'rgb(160, 80, 80)';   // Methane dwarf
    case 'Y': return 'rgb(120, 60, 60)';   // Brown dwarf
    default: return 'rgb(200, 200, 200)';  // Unknown
  }
}

function getStellarTypeGlow(spectralType: string | null): string {
  if (!spectralType) return 'rgba(200, 200, 200, 0.5)';
  
  const type = spectralType.charAt(0).toUpperCase();
  switch (type) {
    case 'O': return 'rgba(155, 176, 255, 0.7)'; // Blue
    case 'B': return 'rgba(170, 191, 255, 0.7)'; // Blue-white
    case 'A': return 'rgba(213, 224, 255, 0.7)'; // White
    case 'F': return 'rgba(249, 245, 231, 0.7)'; // Yellow-white
    case 'G': return 'rgba(255, 237, 176, 0.7)'; // Yellow (Sun-like)
    case 'K': return 'rgba(255, 218, 181, 0.7)'; // Orange
    case 'M': return 'rgba(255, 180, 180, 0.7)'; // Red
    case 'L': return 'rgba(200, 120, 120, 0.7)'; // Dark red
    case 'T': return 'rgba(160, 80, 80, 0.7)';   // Methane dwarf
    case 'Y': return 'rgba(120, 60, 60, 0.7)';   // Brown dwarf
    default: return 'rgba(200, 200, 200, 0.5)';  // Unknown
  }
}

function getStellarTypeDescription(spectralType: string | null): string {
  if (!spectralType) return 'Unknown stellar type';
  
  const type = spectralType.charAt(0).toUpperCase();
  switch (type) {
    case 'O': return 'Very hot, luminous blue star';
    case 'B': return 'Hot, blue-white star';
    case 'A': return 'White or blue-white star';
    case 'F': return 'Yellow-white star';
    case 'G': return 'Yellow star (Sun-like)';
    case 'K': return 'Orange dwarf star';
    case 'M': return 'Red dwarf star';
    case 'L': return 'Red/brown dwarf';
    case 'T': return 'Methane dwarf (cool brown dwarf)';
    case 'Y': return 'Ultra-cool brown dwarf';
    default: return 'Unknown stellar classification';
  }
}

// Functions to calculate habitable zone (simplified model)
function getHabitableZoneInner(starMass: number, starTemp: number): number {
  // Very simplified calculation - normally would use detailed stellar models
  return Math.max(5, Math.min(40, 20 - (starTemp / 1000) * 5 + (starMass * 5)));
}

function getHabitableZoneOuter(starMass: number, starTemp: number): number {
  // Very simplified calculation - normally would use detailed stellar models
  return Math.max(30, Math.min(70, 50 - (starTemp / 1000) * 3 + (starMass * 5)));
}

function getHabitableZonePosition(planet: Exoplanet): number {
  if (!planet.pl_orbsmax || !planet.st_mass || !planet.st_teff) return 50;
  
  // Map the orbital distance to visual percent (0-100)
  // This is a very simplified approximation
  return Math.min(95, Math.max(5, (planet.pl_orbsmax / 5) * 50));
}
