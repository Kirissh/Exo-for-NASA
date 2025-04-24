
import React, { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExoplanetFilters as FiltersType } from '@/types/exoplanet';
import { X, SlidersHorizontal, Search } from 'lucide-react';

interface ExoplanetFiltersProps {
  discoveryMethods: string[];
  facilities: string[];
  yearRange: [number, number];
  initialFilters: FiltersType;
  onFiltersChange: (filters: FiltersType) => void;
}

export function ExoplanetFilters({
  discoveryMethods,
  facilities,
  yearRange,
  initialFilters,
  onFiltersChange,
}: ExoplanetFiltersProps) {
  const [filters, setFilters] = useState<FiltersType>(initialFilters);
  const [currentYearRange, setCurrentYearRange] = useState<[number, number]>(initialFilters.yearRange);
  
  // Update filters
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({
      ...prev,
      searchTerm: e.target.value,
    }));
  };
  
  const handleYearRangeChange = (values: number[]) => {
    const newYearRange: [number, number] = [values[0], values[1]];
    setCurrentYearRange(newYearRange);
    
    // Add a small debounce for the slider
    clearTimeout((window as any).yearRangeTimeout);
    (window as any).yearRangeTimeout = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        yearRange: newYearRange,
      }));
    }, 300);
  };
  
  const toggleDiscoveryMethod = (method: string) => {
    setFilters((prev) => {
      const currentMethods = prev.discoveryMethods;
      const newMethods = currentMethods.includes(method)
        ? currentMethods.filter((m) => m !== method)
        : [...currentMethods, method];
        
      return {
        ...prev,
        discoveryMethods: newMethods,
      };
    });
  };
  
  const toggleFacility = (facility: string) => {
    setFilters((prev) => {
      const currentFacilities = prev.facilities;
      const newFacilities = currentFacilities.includes(facility)
        ? currentFacilities.filter((f) => f !== facility)
        : [...currentFacilities, facility];
        
      return {
        ...prev,
        facilities: newFacilities,
      };
    });
  };
  
  const resetFilters = () => {
    const resetValues = {
      yearRange: yearRange,
      discoveryMethods: [],
      facilities: [],
      searchTerm: '',
    };
    setFilters(resetValues);
    setCurrentYearRange(yearRange);
  };
  
  const getActiveFilterCount = (): number => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.discoveryMethods.length > 0) count++;
    if (filters.facilities.length > 0) count++;
    if (filters.yearRange[0] !== yearRange[0] || filters.yearRange[1] !== yearRange[1]) count++;
    return count;
  };
  
  return (
    <div className="space-y-6 p-4 bg-card rounded-lg border border-border backdrop-blur-sm bg-opacity-70">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <SlidersHorizontal size={18} />
          Filters
        </h3>
        
        {getActiveFilterCount() > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetFilters}
            className="text-xs h-8 gap-1 hover:bg-destructive/10 hover:text-destructive"
          >
            <X size={14} />
            Clear All
            <Badge variant="secondary" className="ml-1 h-5 text-xs">
              {getActiveFilterCount()}
            </Badge>
          </Button>
        )}
      </div>
      
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          id="search"
          placeholder="Search exoplanets..."
          value={filters.searchTerm}
          onChange={handleSearchChange}
          className="bg-muted border-border pl-9"
        />
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <Label className="text-sm font-medium">
            Discovery Year
          </Label>
          <span className="text-sm text-muted-foreground">
            {currentYearRange[0]} - {currentYearRange[1]}
          </span>
        </div>
        
        <Slider
          defaultValue={[yearRange[0], yearRange[1]]}
          min={yearRange[0]}
          max={yearRange[1]}
          step={1}
          value={[currentYearRange[0], currentYearRange[1]]}
          onValueChange={handleYearRangeChange}
          className="mb-1"
        />
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{yearRange[0]}</span>
          <span>{yearRange[1]}</span>
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <Label className="text-sm font-medium">
            Discovery Methods
          </Label>
          {filters.discoveryMethods.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {filters.discoveryMethods.length} selected
            </Badge>
          )}
        </div>
        
        <ScrollArea className="h-40 rounded-md border border-border p-2 bg-muted/30 backdrop-blur-sm">
          <div className="space-y-2">
            {discoveryMethods.map((method) => (
              <div 
                key={method} 
                className={`flex items-center space-x-2 p-1.5 rounded-sm transition-colors ${
                  filters.discoveryMethods.includes(method) 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-muted'
                }`}
              >
                <Checkbox
                  id={`method-${method}`}
                  checked={filters.discoveryMethods.includes(method)}
                  onCheckedChange={() => toggleDiscoveryMethod(method)}
                  className={filters.discoveryMethods.includes(method) ? 'text-primary' : ''}
                />
                <Label
                  htmlFor={`method-${method}`}
                  className="text-sm cursor-pointer w-full"
                >
                  {method}
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <Label className="text-sm font-medium">
            Facilities
          </Label>
          {filters.facilities.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {filters.facilities.length} selected
            </Badge>
          )}
        </div>
        
        <ScrollArea className="h-40 rounded-md border border-border p-2 bg-muted/30 backdrop-blur-sm">
          <div className="space-y-2">
            {facilities.map((facility) => (
              <div 
                key={facility} 
                className={`flex items-center space-x-2 p-1.5 rounded-sm transition-colors ${
                  filters.facilities.includes(facility) 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-muted'
                }`}
              >
                <Checkbox
                  id={`facility-${facility}`}
                  checked={filters.facilities.includes(facility)}
                  onCheckedChange={() => toggleFacility(facility)}
                  className={filters.facilities.includes(facility) ? 'text-primary' : ''}
                />
                <Label
                  htmlFor={`facility-${facility}`}
                  className="text-sm cursor-pointer w-full"
                >
                  {facility}
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

export default ExoplanetFilters;
