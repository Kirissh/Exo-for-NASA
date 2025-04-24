
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import ExoplanetFilters from '@/components/ExoplanetFilters';
import { ExoplanetFilters as FiltersType } from '@/types/exoplanet';

interface FilterSidebarProps {
  loading: boolean;
  discoveryMethods: string[];
  facilities: string[];
  yearRange: [number, number];
  filters: FiltersType;
  onFiltersChange: (filters: FiltersType) => void;
  sidebarOpen: boolean;
}

const FilterSidebar = ({
  loading,
  discoveryMethods,
  facilities,
  yearRange,
  filters,
  onFiltersChange,
  sidebarOpen
}: FilterSidebarProps) => {
  return (
    <aside
      className={`
        ${sidebarOpen ? 'block' : 'hidden'} md:block
        w-full md:w-80 lg:w-96 shrink-0 transition-all
      `}
    >
      <div className="sticky top-24">
        <Card className="border border-white/10 bg-background/25 backdrop-blur-xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full bg-white/10" />
                <Skeleton className="h-8 w-full bg-white/10" />
                <Skeleton className="h-40 w-full bg-white/10" />
                <Skeleton className="h-40 w-full bg-white/10" />
              </div>
            ) : (
              <ExoplanetFilters
                discoveryMethods={discoveryMethods}
                facilities={facilities}
                yearRange={yearRange}
                initialFilters={filters}
                onFiltersChange={onFiltersChange}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </aside>
  );
};

export default FilterSidebar;
