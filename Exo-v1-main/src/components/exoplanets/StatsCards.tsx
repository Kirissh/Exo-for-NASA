
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface StatsCardsProps {
  loading: boolean;
  totalExoplanets: number;
  filteredCount: number;
  favoritesCount: number;
  isLoggedIn: boolean;
}

const StatsCards = ({ 
  loading, 
  totalExoplanets, 
  filteredCount, 
  favoritesCount,
  isLoggedIn
}: StatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="border-white/10 bg-background/30 backdrop-blur-lg shadow-sm">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">
              Total Exoplanets
            </p>
            {loading ? (
              <Skeleton className="h-10 w-20 mx-auto mt-2 bg-white/10" />
            ) : (
              <p className="text-3xl font-bold">
                {totalExoplanets}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-white/10 bg-background/30 backdrop-blur-lg shadow-sm">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">
              Filtered Results
            </p>
            {loading ? (
              <Skeleton className="h-10 w-20 mx-auto mt-2 bg-white/10" />
            ) : (
              <p className="text-3xl font-bold">
                {filteredCount}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-white/10 bg-background/30 backdrop-blur-lg shadow-sm">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">
              {isLoggedIn ? 'Your Favorites' : 'Sign In to Save Favorites'}
            </p>
            {loading || !isLoggedIn ? (
              <p className="text-3xl font-bold mt-2">-</p>
            ) : (
              <p className="text-3xl font-bold">
                {favoritesCount}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;
