
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Exoplanet, ExoplanetFilters as FiltersType, ExoplanetSorting, SortField } from '@/types/exoplanet';
import { 
  fetchAllExoplanets,
  filterExoplanets,
  sortExoplanets,
  getUniqueDiscoveryMethods,
  getUniqueFacilities,
  getYearRange,
  saveFavoriteExoplanet,
  getFavoriteExoplanets,
  removeFavoriteExoplanet
} from '@/services/exoplanetService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Satellite, Database, Newspaper, Atom } from 'lucide-react';

// Import our extracted components
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FilterSidebar from '@/components/exoplanets/FilterSidebar';
import StatsCards from '@/components/exoplanets/StatsCards';
import ExoplanetResults from '@/components/exoplanets/ExoplanetResults';
import VisualizationSection from '@/components/exoplanets/VisualizationSection';
import AstrophysicsSection from '@/components/AstrophysicsSection';
import AstrophysicsStatistics from '@/components/AstrophysicsStatistics';
import { NewsSection } from '@/components/NewsSection';

// Number of exoplanets to show per page
const ITEMS_PER_PAGE = 10;

const Index = () => {
  // Core state
  const [exoplanets, setExoplanets] = useState<Exoplanet[]>([]);
  const [filteredExoplanets, setFilteredExoplanets] = useState<Exoplanet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("exoplanets");
  
  // Filter-related state
  const [discoveryMethods, setDiscoveryMethods] = useState<string[]>([]);
  const [facilities, setFacilities] = useState<string[]>([]);
  const [yearRange, setYearRange] = useState<[number, number]>([1990, 2023]);
  const [filters, setFilters] = useState<FiltersType>({
    yearRange: [1990, 2023],
    discoveryMethods: [],
    facilities: [],
    searchTerm: '',
  });
  
  // Sorting and pagination state
  const [sorting, setSorting] = useState<ExoplanetSorting>({
    field: 'pl_disc',
    direction: 'desc',
  });
  const [currentPage, setCurrentPage] = useState(1);
  
  // User interaction state
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [selectedPlanet, setSelectedPlanet] = useState<Exoplanet | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { user } = useAuth();
  
  // Fetch exoplanet data
  useEffect(() => {
    const getExoplanets = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await fetchAllExoplanets();
        setExoplanets(data);
        
        // Get filter options
        setDiscoveryMethods(getUniqueDiscoveryMethods(data));
        setFacilities(getUniqueFacilities(data));
        const yearR = getYearRange(data);
        setYearRange(yearR);
        
        setFilters(prev => ({
          ...prev,
          yearRange: yearR,
        }));
        
      } catch (err: any) {
        setError(null); // Don't show error to user, we're using fallback data
        console.error('Error fetching exoplanet data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    getExoplanets();
  }, []);
  
  // Apply filters and sorting
  useEffect(() => {
    if (exoplanets.length === 0) return;
    
    const filtered = filterExoplanets(exoplanets, filters);
    const sorted = sortExoplanets(filtered, sorting);
    setFilteredExoplanets(sorted);
    setCurrentPage(1); // Reset to first page when filters or sorting change
  }, [exoplanets, filters, sorting]);
  
  // Fetch user favorites
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        setFavoriteIds([]);
        return;
      }
      
      try {
        const favorites = await getFavoriteExoplanets(user.id);
        setFavoriteIds(favorites);
      } catch (err) {
        console.error('Error fetching favorites:', err);
      }
    };
    
    fetchFavorites();
  }, [user]);
  
  // Calculate paginated data
  const paginatedExoplanets = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredExoplanets.slice(startIndex, endIndex);
  }, [filteredExoplanets, currentPage]);
  
  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(filteredExoplanets.length / ITEMS_PER_PAGE);
  }, [filteredExoplanets.length]);
  
  // Event handlers
  const handleSortChange = (field: SortField) => {
    setSorting(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };
  
  const handleFiltersChange = (newFilters: FiltersType) => {
    setFilters(newFilters);
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const handleToggleFavorite = async (id: string) => {
    if (!user) return;
    
    try {
      if (favoriteIds.includes(id)) {
        // Remove favorite
        await removeFavoriteExoplanet(id, user.id);
        setFavoriteIds(prev => prev.filter(fId => fId !== id));
      } else {
        // Add favorite
        await saveFavoriteExoplanet(id, user.id);
        setFavoriteIds(prev => [...prev, id]);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };
  
  const handlePlanetSelect = (planet: Exoplanet) => {
    setSelectedPlanet(planet);
    setDialogOpen(true);
  };
  
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
      />
      
      <main className="flex-grow container mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 w-full justify-start overflow-x-auto">
            <TabsTrigger value="exoplanets" className="flex items-center gap-2">
              <Satellite className="h-4 w-4" />
              <span>Exoplanets</span>
            </TabsTrigger>
            <TabsTrigger value="astrophysics" className="flex items-center gap-2">
              <Atom className="h-4 w-4" />
              <span>Astrophysics</span>
            </TabsTrigger>
            <TabsTrigger value="news" className="flex items-center gap-2">
              <Newspaper className="h-4 w-4" />
              <span>NASA News</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span>Statistics</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="exoplanets" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <FilterSidebar
                loading={loading}
                discoveryMethods={discoveryMethods}
                facilities={facilities}
                yearRange={yearRange}
                filters={filters}
                onFiltersChange={handleFiltersChange}
                sidebarOpen={sidebarOpen}
              />
              
              <div className="flex-grow space-y-6">
                <StatsCards
                  loading={loading}
                  totalExoplanets={exoplanets.length}
                  filteredCount={filteredExoplanets.length}
                  favoritesCount={favoriteIds.length}
                  isLoggedIn={!!user}
                />
                
                <ExoplanetResults
                  loading={loading}
                  error={error}
                  exoplanets={paginatedExoplanets}
                  sorting={sorting}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  favoriteIds={favoriteIds}
                  itemsPerPage={ITEMS_PER_PAGE}
                  totalFilteredCount={filteredExoplanets.length}
                  selectedPlanet={selectedPlanet}
                  dialogOpen={dialogOpen}
                  onSortChange={handleSortChange}
                  onToggleFavorite={user ? handleToggleFavorite : undefined}
                  onPageChange={handlePageChange}
                  onPlanetSelect={handlePlanetSelect}
                  onDialogOpenChange={setDialogOpen}
                />
                
                {!loading && !error && filteredExoplanets.length > 0 && (
                  <VisualizationSection exoplanets={filteredExoplanets} />
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="astrophysics" className="space-y-6">
            <AstrophysicsSection />
          </TabsContent>
          
          <TabsContent value="news" className="space-y-6">
            <NewsSection />
          </TabsContent>
          
          <TabsContent value="stats" className="space-y-6">
            <AstrophysicsStatistics exoplanets={exoplanets} loading={loading} />
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
