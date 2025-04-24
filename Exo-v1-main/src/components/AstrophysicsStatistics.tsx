
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { getExoplanetStatistics } from '@/services/exoplanetService';
import { Exoplanet } from '@/types/exoplanet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

interface AstrophysicsStatisticsProps {
  exoplanets: Exoplanet[];
  loading: boolean;
}

const AstrophysicsStatistics: React.FC<AstrophysicsStatisticsProps> = ({ exoplanets, loading }) => {
  if (loading) {
    return <StatisticsSkeletons />;
  }

  const stats = getExoplanetStatistics(exoplanets);
  
  // Get top 5 methods by count
  const topMethods = Object.entries(stats.methodCounts)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 5);
  
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold">Exoplanet Statistics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Key Statistics Card */}
        <Card>
          <CardHeader>
            <CardTitle>Key Metrics</CardTitle>
            <CardDescription>Statistical highlights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Exoplanets</p>
                <p className="text-3xl font-bold">{stats.totalCount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Mass (Earth masses)</p>
                <p className="text-2xl font-bold">{stats.avgMass.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Radius (Earth radii)</p>
                <p className="text-2xl font-bold">{stats.avgRadius.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Potentially Habitable</p>
                <p className="text-2xl font-bold">{stats.habitablePlanetsCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Discovery Methods Card */}
        <Card>
          <CardHeader>
            <CardTitle>Top Discovery Methods</CardTitle>
            <CardDescription>How exoplanets were found</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topMethods.map(([method, count]) => (
                <div key={method} className="flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{method}</p>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{ width: `${Math.round((count as number) / stats.totalCount * 100)}%` }}
                      />
                    </div>
                  </div>
                  <p className="font-bold">{count as number}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Discovery Timeline Card */}
        <Card>
          <CardHeader>
            <CardTitle>Discovery Timeline</CardTitle>
            <CardDescription>When exoplanets were discovered</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">First Discovery</p>
                <p className="text-xl font-bold">{stats.earliestDiscovery}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Latest Discovery</p>
                <p className="text-xl font-bold">{stats.latestDiscovery}</p>
              </div>
              <div className="space-y-2 pt-2">
                <p className="text-sm font-medium">By Decade</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stats.decadeCounts).map(([decade, count]) => (
                    <Badge key={decade} variant="outline">
                      {decade}: {count as number}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Habitable Exoplanets Table */}
      {stats.habitablePlanetsCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Potentially Habitable Exoplanets</CardTitle>
            <CardDescription>
              Planets with Earth-like radius and in the habitable zone of their star
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Radius (Earth)</TableHead>
                  <TableHead>Mass (Earth)</TableHead>
                  <TableHead>Star</TableHead>
                  <TableHead>Distance (pc)</TableHead>
                  <TableHead>Year</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.habitablePlanets.map((planet) => (
                  <TableRow key={planet.id}>
                    <TableCell className="font-medium">{planet.pl_name}</TableCell>
                    <TableCell>{planet.pl_rade !== null ? planet.pl_rade.toFixed(2) : 'Unknown'}</TableCell>
                    <TableCell>{planet.pl_masse !== null ? planet.pl_masse.toFixed(2) : 'Unknown'}</TableCell>
                    <TableCell>{planet.st_spectype || 'Unknown'}</TableCell>
                    <TableCell>{planet.st_dist !== null ? planet.st_dist.toFixed(1) : 'Unknown'}</TableCell>
                    <TableCell>{planet.pl_disc}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Skeleton component for loading state
const StatisticsSkeletons = () => (
  <div className="space-y-6">
    <h3 className="text-2xl font-semibold">Exoplanet Statistics</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-[140px]" />
            <Skeleton className="h-4 w-[100px]" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default AstrophysicsStatistics;
