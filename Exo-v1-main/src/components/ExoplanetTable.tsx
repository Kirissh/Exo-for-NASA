
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Exoplanet, ExoplanetSorting, SortField } from '@/types/exoplanet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowDown, ArrowUp, Star, ExternalLink, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ExoplanetTableProps {
  exoplanets: Exoplanet[];
  sorting: ExoplanetSorting;
  onSortChange: (field: SortField) => void;
  favoriteIds?: string[];
  onToggleFavorite?: (id: string) => void;
  onPlanetClick?: (planet: Exoplanet) => void;
}

export function ExoplanetTable({
  exoplanets,
  sorting,
  onSortChange,
  favoriteIds = [],
  onToggleFavorite,
  onPlanetClick,
}: ExoplanetTableProps) {
  const { user } = useAuth();
  
  // Handle header click for sorting
  const handleSortClick = (field: SortField) => {
    onSortChange(field);
  };
  
  // Format values for display
  const formatValue = (value: any, type: 'number' | 'text' = 'text'): string => {
    if (value === null || value === undefined) return 'Unknown';
    if (typeof value === 'number') {
      return Number.isInteger(value) ? value.toString() : value.toFixed(2);
    }
    return String(value);
  };
  
  // Get arrow icon based on sort direction
  const getSortIcon = (field: SortField) => {
    if (field !== sorting.field) return null;
    return sorting.direction === 'asc' ? 
      <ArrowUp size={14} className="ml-1" /> : 
      <ArrowDown size={14} className="ml-1" />;
  };
  
  // Get color class for values based on relative significance
  const getMassClass = (mass: number | null) => {
    if (mass === null) return '';
    if (mass < 1) return 'text-blue-400';  // Sub-Earth
    if (mass < 10) return 'text-green-400'; // Super-Earth
    if (mass < 50) return 'text-yellow-400'; // Neptune-like
    return 'text-red-400'; // Jupiter+ 
  };
  
  // Whether to show the favorites column
  const showFavorites = user && onToggleFavorite;
  
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {showFavorites && (
              <TableHead className="w-[50px] text-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Star size={14} className="inline" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Favorite</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
            )}
            <TableHead className="w-[180px]">
              <Button
                variant="ghost"
                onClick={() => handleSortClick('pl_name')}
                className="font-semibold p-0 h-auto"
              >
                Planet Name
                {getSortIcon('pl_name')}
              </Button>
            </TableHead>
            <TableHead className="w-[80px]">
              <Button
                variant="ghost"
                onClick={() => handleSortClick('pl_disc')}
                className="font-semibold p-0 h-auto"
              >
                Year
                {getSortIcon('pl_disc')}
              </Button>
            </TableHead>
            <TableHead className="w-[130px]">Discovery Method</TableHead>
            <TableHead className="w-[130px]">Facility</TableHead>
            <TableHead className="w-[90px]">
              <Button
                variant="ghost"
                onClick={() => handleSortClick('pl_masse')}
                className="font-semibold p-0 h-auto whitespace-nowrap"
              >
                Mass (M⊕)
                {getSortIcon('pl_masse')}
              </Button>
            </TableHead>
            <TableHead className="w-[90px]">
              <Button
                variant="ghost"
                onClick={() => handleSortClick('pl_rade')}
                className="font-semibold p-0 h-auto whitespace-nowrap"
              >
                Radius (R⊕)
                {getSortIcon('pl_rade')}
              </Button>
            </TableHead>
            <TableHead className="w-[90px]">
              <Button
                variant="ghost"
                onClick={() => handleSortClick('st_dist')}
                className="font-semibold p-0 h-auto"
              >
                Distance
                {getSortIcon('st_dist')}
              </Button>
            </TableHead>
            <TableHead className="w-[50px] text-center">Link</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exoplanets.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={showFavorites ? 9 : 8}
                className="h-24 text-center"
              >
                No exoplanets found matching your filters.
              </TableCell>
            </TableRow>
          ) : (
            exoplanets.map((planet) => (
              <TableRow 
                key={planet.id} 
                className="hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => onPlanetClick && onPlanetClick(planet)}
              >
                {showFavorites && (
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite?.(planet.id);
                      }}
                      className="h-7 w-7 rounded-full"
                    >
                      <Star
                        size={16}
                        className={
                          favoriteIds.includes(planet.id)
                            ? 'fill-foreground'
                            : 'text-muted-foreground'
                        }
                      />
                    </Button>
                  </TableCell>
                )}
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <span>{planet.pl_name}</span>
                    {planet.pl_orbper && planet.pl_orbper < 10 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="ml-2 text-xs">Hot</Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Short orbital period: {planet.pl_orbper.toFixed(1)} days</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </TableCell>
                <TableCell>{formatValue(planet.pl_disc)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-normal">
                    {formatValue(planet.pl_discmethod)}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{formatValue(planet.pl_facility)}</TableCell>
                <TableCell>
                  <span className={getMassClass(planet.pl_masse)}>
                    {formatValue(planet.pl_masse)}
                  </span>
                </TableCell>
                <TableCell>
                  {planet.pl_rade !== null && (
                    <div className="flex items-center gap-1">
                      <span>{formatValue(planet.pl_rade)}</span>
                      <div 
                        className="rounded-full bg-foreground/70" 
                        style={{ 
                          width: `${Math.min(planet.pl_rade || 0, 15) * 1.5}px`, 
                          height: `${Math.min(planet.pl_rade || 0, 15) * 1.5}px`,
                          opacity: 0.7
                        }} 
                      />
                    </div>
                  )}
                  {planet.pl_rade === null && (
                    <span>Unknown</span>
                  )}
                </TableCell>
                <TableCell>
                  {planet.st_dist ? (
                    <div>
                      <span className="text-sm">
                        {formatValue(planet.st_dist)} pc
                      </span>
                      <span className="text-xs text-muted-foreground block">
                        ~{(planet.st_dist * 3.26).toFixed(0)} ly
                      </span>
                    </div>
                  ) : (
                    <span>Unknown</span>
                  )}
                </TableCell>
                <TableCell>
                  <a
                    href={planet.nasa_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center"
                    aria-label={`NASA data for ${planet.pl_name}`}
                  >
                    <ExternalLink size={14} />
                  </a>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default ExoplanetTable;
