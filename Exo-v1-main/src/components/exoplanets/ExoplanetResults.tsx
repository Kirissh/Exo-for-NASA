
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import ExoplanetTable from '@/components/ExoplanetTable';
import PaginationControl from '@/components/ui/pagination-control';
import ExoplanetDetailDialog from '@/components/ExoplanetDetailDialog';
import { Exoplanet, ExoplanetSorting, SortField } from '@/types/exoplanet';

interface ExoplanetResultsProps {
  loading: boolean;
  error: string | null;
  exoplanets: Exoplanet[];
  sorting: ExoplanetSorting;
  currentPage: number;
  totalPages: number;
  favoriteIds: string[];
  itemsPerPage: number;
  totalFilteredCount: number;
  selectedPlanet: Exoplanet | null;
  dialogOpen: boolean;
  onSortChange: (field: SortField) => void;
  onToggleFavorite?: (id: string) => void;
  onPageChange: (page: number) => void;
  onPlanetSelect: (planet: Exoplanet) => void;
  onDialogOpenChange: (open: boolean) => void;
}

const ExoplanetResults = ({
  loading,
  error,
  exoplanets,
  sorting,
  currentPage,
  totalPages,
  favoriteIds,
  itemsPerPage,
  totalFilteredCount,
  selectedPlanet,
  dialogOpen,
  onSortChange,
  onToggleFavorite,
  onPageChange,
  onPlanetSelect,
  onDialogOpenChange
}: ExoplanetResultsProps) => {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Exoplanet Results</h2>
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : error ? (
        <Card className="bg-destructive/10 border-destructive">
          <CardContent className="py-4">
            <p className="text-center text-destructive">{error}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <ExoplanetTable
            exoplanets={exoplanets}
            sorting={sorting}
            onSortChange={onSortChange}
            favoriteIds={favoriteIds}
            onToggleFavorite={onToggleFavorite}
            onPlanetClick={onPlanetSelect}
          />
          
          <div className="mt-4 flex justify-center">
            <PaginationControl
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>
          
          <div className="mt-2 text-center text-xs text-muted-foreground">
            Showing {Math.min(totalFilteredCount, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(totalFilteredCount, currentPage * itemsPerPage)} of {totalFilteredCount} exoplanets
          </div>
        </>
      )}
      
      {/* Planet Detail Dialog */}
      <ExoplanetDetailDialog 
        planet={selectedPlanet}
        open={dialogOpen}
        onOpenChange={onDialogOpenChange}
      />
    </div>
  );
};

export default ExoplanetResults;
