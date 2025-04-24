
import { Exoplanet, ExoplanetFilters, ExoplanetSorting } from "../types/exoplanet";
import { supabase } from "../lib/supabase";
import axios from 'axios';

// NASA API key for authentication
const NASA_API_KEY = 'slH4JNYNBB7IlBhUPp1LhdB8MmCmjJgm85YeRnfE';

// NASA Exoplanet Archive API URLs with direct access using API key
const NASA_API_URL = 'https://exoplanetarchive.ipac.caltech.edu/TAP/sync';

// NASA Exoplanet Archive Web API with API key
const NASA_WEB_API = 'https://exoplanetarchive.ipac.caltech.edu/cgi-bin/nstedAPI/nph-nstedAPI';

// EU Exoplanet database as backup
const EU_EXOPLANET_API = 'https://corsproxy.io/?https://exoplanet.eu/api/planets/?format=json';

// NASA Exoplanet Archive Open API as third option (without API key)
const NASA_OPEN_API = 'https://corsproxy.io/?https://exoplanetarchive.ipac.caltech.edu/cgi-bin/nstedAPI/nph-nstedAPI';

// Array of columns to request from the API - expanded for more comprehensive data
const COLUMNS = [
  // Basic planet properties
  'pl_name', 'pl_discmethod', 'pl_facility', 'pl_disc', 'pl_masse', 'pl_rade',
  'pl_orbper', 'pl_orbsmax', 'pl_orbeccen', 'pl_eqt', 
  
  // Star properties
  'st_dist', 'st_spectype', 'st_mass', 'st_rad', 'st_teff', 
  
  // Additional planet properties
  'pl_bmasse', 'pl_brade', 'pl_dens', 'pl_insol', 
  'pl_pubdate', 'pl_locale', 'pl_telescope', 
  
  // Celestial coordinates
  'dec', 'ra',
  
  // Additional star properties
  'st_age', 'st_temp', 'st_logg', 'st_dens', 'st_lum', 'st_met', 'st_metratio',
  
  // Orbital parameters
  'pl_orbincl', 'pl_orblper', 'pl_tranmid', 'pl_trandep', 'pl_trandur', 
  
  // Atmospheric properties
  'pl_atm', 'pl_atmoic', 'pl_tsm', 'pl_esm',
  
  // System properties
  'sy_snum', 'sy_pnum', 'sy_mnum', 'sy_dist', 'rowupdate',
  
  // Secondary names and identifiers
  'pl_alt_names', 'hostname', 'pl_letter', 'hd_name', 'hip_name'
].join(',');

// Cache for storing fetched data
let exoplanetCache: Exoplanet[] | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 900000; // 15 minutes to ensure more frequent updates

// Import expanded exoplanet data
import { allFallbackExoplanets } from "../data/expandedExoplanets";

// Fallback data set in case the NASA API fails
const fallbackExoplanets: Exoplanet[] = allFallbackExoplanets;

export async function fetchAllExoplanets(): Promise<Exoplanet[]> {
  // Check if we have cached data that's not expired
  const currentTime = Date.now();
  if (exoplanetCache && (currentTime - lastFetchTime) < CACHE_DURATION) {
    return exoplanetCache;
  }

  // First, try to get data from Supabase cache if we have it
  try {
    const { data: cachedData, error: cacheError } = await supabase
      .from('exoplanet_cache')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (!cacheError && cachedData && cachedData.length > 0 && cachedData[0].data) {
      const cacheAge = new Date().getTime() - new Date(cachedData[0].created_at).getTime();
      if (cacheAge < 86400000) { // Cache is less than 24 hours old
        console.log("Using cached exoplanet data from Supabase");
        const exoplanets = cachedData[0].data as Exoplanet[];
        exoplanetCache = exoplanets;
        lastFetchTime = currentTime;
        return exoplanets;
      }
    }
  } catch (error) {
    console.log("No cached exoplanet data available or error accessing cache");
  }

  // Try multiple data sources in sequence
  return await tryMultipleDataSources();
}

// Try multiple data sources to maximize reliability
async function tryMultipleDataSources(): Promise<Exoplanet[]> {
  const currentTime = Date.now();
  
  try {
    // Try NASA TAP API first with API key (most comprehensive)
    const exoplanets = await tryNASATapAPI();
    exoplanetCache = exoplanets;
    lastFetchTime = currentTime;
    
    // If successful, cache the results in Supabase for other users
    try {
      if (exoplanets.length > 0) {
        const { error } = await supabase
          .from('exoplanet_cache')
          .insert({
            data: exoplanets,
            source: 'nasa_tap_with_key',
            count: exoplanets.length
          });
        
        if (error) console.error("Error caching exoplanet data:", error);
      }
    } catch (cacheError) {
      console.error("Failed to cache exoplanet data:", cacheError);
    }
    
    return exoplanets;
  } catch (error) {
    console.error("NASA TAP API failed, trying NASA Web API:", error);
    
    try {
      // Try NASA Web API with API key as second option
      const exoplanets = await tryNASAWebAPI();
      exoplanetCache = exoplanets;
      lastFetchTime = currentTime;
      
      // Cache the Web API results
      try {
        if (exoplanets.length > 0) {
          const { error } = await supabase
            .from('exoplanet_cache')
            .insert({
              data: exoplanets,
              source: 'nasa_web_api',
              count: exoplanets.length
            });
          
          if (error) console.error("Error caching exoplanet data:", error);
        }
      } catch (cacheError) {
        console.error("Failed to cache exoplanet data:", cacheError);
      }
      
      return exoplanets;
    } catch (error2) {
      console.error("NASA Web API failed, trying EU Exoplanet API:", error2);
      
      try {
        // Try EU Exoplanet database as backup
        const exoplanets = await tryEUExoplanetAPI();
        exoplanetCache = exoplanets;
        lastFetchTime = currentTime;
        return exoplanets;
      } catch (error3) {
        console.error("EU Exoplanet API failed, trying NASA Open API (without key):", error3);
        
        try {
          // Try NASA Open API as fourth option
          const exoplanets = await tryNASAOpenAPI();
          exoplanetCache = exoplanets;
          lastFetchTime = currentTime;
          return exoplanets;
        } catch (error4) {
          console.error("All online APIs failed, using fallback data:", error4);
          
          // Return fallback data if all API methods fail
          console.log(`Using fallback exoplanet data (${fallbackExoplanets.length} exoplanets available)`);
          exoplanetCache = fallbackExoplanets;
          lastFetchTime = currentTime;
          return fallbackExoplanets;
        }
      }
    }
  }
}

// NASA TAP API implementation with API key
async function tryNASATapAPI(): Promise<Exoplanet[]> {
  console.log("Trying NASA TAP API with API key...");
  // Construct comprehensive query that gets all relevant planet info
  const query = `SELECT ${COLUMNS} FROM ps WHERE pl_controv_flag = 0 ORDER BY pl_disc DESC`;
  
  const params = new URLSearchParams({
    query: query,
    format: 'json',
    api_key: NASA_API_KEY
  });
  
  try {
    const response = await fetch(`${NASA_API_URL}?${params.toString()}`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error(`NASA TAP API error: ${response.status} ${response.statusText}`);
      throw new Error(`NASA TAP API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Successfully fetched ${data.length} exoplanets from NASA TAP API using API key`);
    
    // Transform data into our Exoplanet type with enhanced properties
    const exoplanets: Exoplanet[] = data.map((item: any) => ({
      id: item.pl_name || `planet-${Math.random().toString(36).substring(2, 9)}`,
      pl_name: item.pl_name || 'Unknown',
      pl_discmethod: item.pl_discmethod || 'Unknown',
      pl_facility: item.pl_facility || 'Unknown',
      pl_disc: parseInt(item.pl_disc) || 0,
      pl_masse: item.pl_masse !== null ? parseFloat(item.pl_masse) : null,
      pl_rade: item.pl_rade !== null ? parseFloat(item.pl_rade) : null,
      pl_orbper: item.pl_orbper !== null ? parseFloat(item.pl_orbper) : null,
      pl_orbsmax: item.pl_orbsmax !== null ? parseFloat(item.pl_orbsmax) : null,
      pl_orbeccen: item.pl_orbeccen !== null ? parseFloat(item.pl_orbeccen) : null,
      pl_eqt: item.pl_eqt !== null ? parseFloat(item.pl_eqt) : null,
      st_dist: item.st_dist !== null ? parseFloat(item.st_dist) : null,
      st_spectype: item.st_spectype || null,
      st_mass: item.st_mass !== null ? parseFloat(item.st_mass) : null,
      st_rad: item.st_rad !== null ? parseFloat(item.st_rad) : null,
      st_teff: item.st_teff !== null ? parseFloat(item.st_teff) : null,
      
      // Basic additional fields
      pl_bmasse: item.pl_bmasse !== null ? parseFloat(item.pl_bmasse) : null,
      pl_brade: item.pl_brade !== null ? parseFloat(item.pl_brade) : null,
      pl_dens: item.pl_dens !== null ? parseFloat(item.pl_dens) : null,
      pl_insol: item.pl_insol !== null ? parseFloat(item.pl_insol) : null,
      ra: item.ra !== null ? parseFloat(item.ra) : null,
      dec: item.dec !== null ? parseFloat(item.dec) : null,
      pl_telescope: item.pl_telescope || null,
      st_age: item.st_age !== null ? parseFloat(item.st_age) : null,
      st_met: item.st_met !== null ? parseFloat(item.st_met) : null,
      st_lum: item.st_lum !== null ? parseFloat(item.st_lum) : null,
      
      // Enhanced data fields
      hostname: item.hostname || null,
      pl_letter: item.pl_letter || null,
      pl_orbincl: item.pl_orbincl !== null ? parseFloat(item.pl_orbincl) : null,
      pl_orblper: item.pl_orblper !== null ? parseFloat(item.pl_orblper) : null,
      pl_trandep: item.pl_trandep !== null ? parseFloat(item.pl_trandep) : null, // Transit depth (%)
      pl_trandur: item.pl_trandur !== null ? parseFloat(item.pl_trandur) : null, // Transit duration (hours)
      pl_tranmid: item.pl_tranmid || null, // Transit midpoint
      pl_tsm: item.pl_tsm !== null ? parseFloat(item.pl_tsm) : null, // Transmission Spectroscopy Metric
      pl_esm: item.pl_esm !== null ? parseFloat(item.pl_esm) : null, // Emission Spectroscopy Metric
      
      // System properties
      sy_snum: item.sy_snum !== null ? parseInt(item.sy_snum) : null, // Number of stars in system
      sy_pnum: item.sy_pnum !== null ? parseInt(item.sy_pnum) : null, // Number of planets in system
      sy_mnum: item.sy_mnum !== null ? parseInt(item.sy_mnum) : null, // Number of moons in system
      
      // Alternative names
      hd_name: item.hd_name || null,
      hip_name: item.hip_name || null,
      pl_alt_names: item.pl_alt_names || null,
      
      rowupdate: item.rowupdate || '',
      nasa_url: `https://exoplanetarchive.ipac.caltech.edu/overview/${encodeURIComponent(item.pl_name)}`
    }));
    
    return exoplanets;
  } catch (error) {
    console.error("Error in tryNASATapAPI with API key:", error);
    throw error;
  }
}

// EU Exoplanet API implementation
async function tryEUExoplanetAPI(): Promise<Exoplanet[]> {
  console.log("Trying EU Exoplanet API...");
  const response = await axios.get(EU_EXOPLANET_API);
  
  if (response.status !== 200) {
    throw new Error(`EU Exoplanet API responded with status: ${response.status}`);
  }
  
  const data = response.data;
  console.log(`Successfully fetched ${data.length} exoplanets from EU Exoplanet API`);
  
  // Transform EU exoplanet data to our format
  const exoplanets: Exoplanet[] = data.map((item: any) => ({
    id: item.name || `planet-${Math.random().toString(36).substring(2, 9)}`,
    pl_name: item.name || 'Unknown',
    pl_discmethod: item.detection_type || 'Unknown',
    pl_facility: item.discovered_by || 'Unknown',
    pl_disc: parseInt(item.discovered) || 0,
    pl_masse: item.mass ? parseFloat(item.mass) : null,
    pl_rade: item.radius ? parseFloat(item.radius) : null,
    pl_orbper: item.orbital_period ? parseFloat(item.orbital_period) : null,
    pl_orbsmax: item.semi_major_axis ? parseFloat(item.semi_major_axis) : null,
    pl_orbeccen: item.eccentricity ? parseFloat(item.eccentricity) : null,
    pl_eqt: item.temp_calculated ? parseFloat(item.temp_calculated) : null,
    st_dist: item.star_distance ? parseFloat(item.star_distance) : null,
    st_spectype: item.star_sp_type || null,
    st_mass: item.star_mass ? parseFloat(item.star_mass) : null,
    st_rad: item.star_radius ? parseFloat(item.star_radius) : null,
    st_teff: item.star_teff ? parseFloat(item.star_teff) : null,
    
    // Additional fields with EU Exoplanet mappings
    pl_bmasse: null, // Not directly available in EU data
    pl_brade: null, // Not directly available in EU data
    pl_dens: item.density ? parseFloat(item.density) : null,
    pl_insol: null, // Not directly available in EU data
    ra: item.ra ? parseFloat(item.ra) : null,
    dec: item.dec ? parseFloat(item.dec) : null,
    pl_telescope: item.instrument || null,
    st_age: item.star_age ? parseFloat(item.star_age) : null,
    st_met: item.star_metallicity ? parseFloat(item.star_metallicity) : null,
    st_lum: item.star_luminosity ? parseFloat(item.star_luminosity) : null,
    
    rowupdate: item.updated || '',
    nasa_url: `https://exoplanet.eu/catalog/${encodeURIComponent(item.name)}`
  }));
  
  return exoplanets;
}

// NASA Web API implementation with API key
async function tryNASAWebAPI(): Promise<Exoplanet[]> {
  console.log("Trying NASA Web API with API key...");
  // Construct a comprehensive query for the NASA Web API
  const params = new URLSearchParams({
    table: 'ps', // Planetary Systems
    select: COLUMNS,
    where: 'pl_controv_flag=0', // Confirmed planets only
    order: 'pl_disc desc', // Sort by discovery year
    format: 'json', // Return JSON data
    api_key: NASA_API_KEY // Use our API key
  });
  
  try {
    const response = await fetch(`${NASA_WEB_API}?${params.toString()}`);
    
    if (!response.ok) {
      console.error(`NASA Web API error: ${response.status} ${response.statusText}`);
      throw new Error(`NASA Web API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Successfully fetched ${data.length} exoplanets from NASA Web API using API key`);
    
    // Transform data into our Exoplanet type with enhanced properties
    const exoplanets: Exoplanet[] = data.map((item: any) => ({
      id: item.pl_name || `planet-${Math.random().toString(36).substring(2, 9)}`,
      pl_name: item.pl_name || 'Unknown',
      pl_discmethod: item.pl_discmethod || 'Unknown',
      pl_facility: item.pl_facility || 'Unknown',
      pl_disc: parseInt(item.pl_disc) || 0,
      pl_masse: item.pl_masse !== null ? parseFloat(item.pl_masse) : null,
      pl_rade: item.pl_rade !== null ? parseFloat(item.pl_rade) : null,
      pl_orbper: item.pl_orbper !== null ? parseFloat(item.pl_orbper) : null,
      pl_orbsmax: item.pl_orbsmax !== null ? parseFloat(item.pl_orbsmax) : null,
      pl_orbeccen: item.pl_orbeccen !== null ? parseFloat(item.pl_orbeccen) : null,
      pl_eqt: item.pl_eqt !== null ? parseFloat(item.pl_eqt) : null,
      st_dist: item.st_dist !== null ? parseFloat(item.st_dist) : null,
      st_spectype: item.st_spectype || null,
      st_mass: item.st_mass !== null ? parseFloat(item.st_mass) : null,
      st_rad: item.st_rad !== null ? parseFloat(item.st_rad) : null,
      st_teff: item.st_teff !== null ? parseFloat(item.st_teff) : null,
      
      // Basic additional fields
      pl_bmasse: item.pl_bmasse !== null ? parseFloat(item.pl_bmasse) : null,
      pl_brade: item.pl_brade !== null ? parseFloat(item.pl_brade) : null,
      pl_dens: item.pl_dens !== null ? parseFloat(item.pl_dens) : null,
      pl_insol: item.pl_insol !== null ? parseFloat(item.pl_insol) : null,
      ra: item.ra !== null ? parseFloat(item.ra) : null,
      dec: item.dec !== null ? parseFloat(item.dec) : null,
      pl_telescope: item.pl_telescope || null,
      st_age: item.st_age !== null ? parseFloat(item.st_age) : null,
      st_met: item.st_met !== null ? parseFloat(item.st_met) : null,
      st_lum: item.st_lum !== null ? parseFloat(item.st_lum) : null,
      
      // Enhanced data fields
      hostname: item.hostname || null,
      pl_letter: item.pl_letter || null,
      pl_orbincl: item.pl_orbincl !== null ? parseFloat(item.pl_orbincl) : null,
      pl_orblper: item.pl_orblper !== null ? parseFloat(item.pl_orblper) : null,
      pl_trandep: item.pl_trandep !== null ? parseFloat(item.pl_trandep) : null, // Transit depth (%)
      pl_trandur: item.pl_trandur !== null ? parseFloat(item.pl_trandur) : null, // Transit duration (hours)
      pl_tranmid: item.pl_tranmid || null, // Transit midpoint
      pl_tsm: item.pl_tsm !== null ? parseFloat(item.pl_tsm) : null, // Transmission Spectroscopy Metric
      pl_esm: item.pl_esm !== null ? parseFloat(item.pl_esm) : null, // Emission Spectroscopy Metric
      
      // System properties
      sy_snum: item.sy_snum !== null ? parseInt(item.sy_snum) : null, // Number of stars in system
      sy_pnum: item.sy_pnum !== null ? parseInt(item.sy_pnum) : null, // Number of planets in system
      sy_mnum: item.sy_mnum !== null ? parseInt(item.sy_mnum) : null, // Number of moons in system
      
      // Alternative names
      hd_name: item.hd_name || null,
      hip_name: item.hip_name || null,
      pl_alt_names: item.pl_alt_names || null,
      
      rowupdate: item.rowupdate || '',
      nasa_url: `https://exoplanetarchive.ipac.caltech.edu/overview/${encodeURIComponent(item.pl_name)}`
    }));
    
    return exoplanets;
  } catch (error) {
    console.error("Error in tryNASAWebAPI with API key:", error);
    throw error;
  }
}

// NASA Open API implementation (fallback without API key)
async function tryNASAOpenAPI(): Promise<Exoplanet[]> {
  console.log("Trying NASA Open API (fallback)...");
  // Construct the query to fetch confirmed exoplanets
  const query = `select ${COLUMNS} from ps where pl_controv_flag = 0 order by pl_disc desc`;
  
  // Encode the query for URL
  const params = new URLSearchParams({
    query: query,
    format: 'json'
  });
  
  try {
    const response = await fetch(`${NASA_OPEN_API}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`NASA Open API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Successfully fetched ${data.length} exoplanets from NASA Open API`);
    
    // Transform data into our Exoplanet type
    const exoplanets: Exoplanet[] = data.map((item: any) => ({
      id: item.pl_name || `planet-${Math.random().toString(36).substring(2, 9)}`,
      pl_name: item.pl_name || 'Unknown',
      pl_discmethod: item.pl_discmethod || 'Unknown',
      pl_facility: item.pl_facility || 'Unknown',
      pl_disc: parseInt(item.pl_disc) || 0,
      pl_masse: item.pl_masse !== null ? parseFloat(item.pl_masse) : null,
      pl_rade: item.pl_rade !== null ? parseFloat(item.pl_rade) : null,
      pl_orbper: item.pl_orbper !== null ? parseFloat(item.pl_orbper) : null,
      pl_orbsmax: item.pl_orbsmax !== null ? parseFloat(item.pl_orbsmax) : null,
      pl_orbeccen: item.pl_orbeccen !== null ? parseFloat(item.pl_orbeccen) : null,
      pl_eqt: item.pl_eqt !== null ? parseFloat(item.pl_eqt) : null,
      st_dist: item.st_dist !== null ? parseFloat(item.st_dist) : null,
      st_spectype: item.st_spectype || null,
      st_mass: item.st_mass !== null ? parseFloat(item.st_mass) : null,
      st_rad: item.st_rad !== null ? parseFloat(item.st_rad) : null,
      st_teff: item.st_teff !== null ? parseFloat(item.st_teff) : null,
      
      // Additional fields
      pl_bmasse: item.pl_bmasse !== null ? parseFloat(item.pl_bmasse) : null,
      pl_brade: item.pl_brade !== null ? parseFloat(item.pl_brade) : null,
      pl_dens: item.pl_dens !== null ? parseFloat(item.pl_dens) : null,
      pl_insol: item.pl_insol !== null ? parseFloat(item.pl_insol) : null,
      ra: item.ra !== null ? parseFloat(item.ra) : null,
      dec: item.dec !== null ? parseFloat(item.dec) : null,
      pl_telescope: item.pl_telescope || null,
      st_age: item.st_age !== null ? parseFloat(item.st_age) : null,
      st_met: item.st_met !== null ? parseFloat(item.st_met) : null,
      st_lum: item.st_lum !== null ? parseFloat(item.st_lum) : null,
      
      rowupdate: item.rowupdate || '',
      nasa_url: `https://exoplanetarchive.ipac.caltech.edu/overview/${encodeURIComponent(item.pl_name)}`
    }));
    
    return exoplanets;
  } catch (error) {
    console.error("Error in tryNASAOpenAPI:", error);
    throw error;
  }
}

export function filterExoplanets(
  exoplanets: Exoplanet[],
  filters: ExoplanetFilters
): Exoplanet[] {
  return exoplanets.filter(planet => {
    // Filter by year range
    if (planet.pl_disc < filters.yearRange[0] || planet.pl_disc > filters.yearRange[1]) {
      return false;
    }
    
    // Filter by discovery method
    if (filters.discoveryMethods.length > 0 && 
        !filters.discoveryMethods.includes(planet.pl_discmethod)) {
      return false;
    }
    
    // Filter by facility
    if (filters.facilities.length > 0 && 
        !filters.facilities.includes(planet.pl_facility)) {
      return false;
    }
    
    // Filter by search term (planet name)
    if (filters.searchTerm && 
        !planet.pl_name.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });
}

export function sortExoplanets(
  exoplanets: Exoplanet[],
  sorting: ExoplanetSorting
): Exoplanet[] {
  return [...exoplanets].sort((a, b) => {
    const aValue = a[sorting.field];
    const bValue = b[sorting.field];
    
    // Handle null values
    if (aValue === null && bValue === null) return 0;
    if (aValue === null) return sorting.direction === 'asc' ? 1 : -1;
    if (bValue === null) return sorting.direction === 'asc' ? -1 : 1;
    
    // Sort strings
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sorting.direction === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    }
    
    // Sort numbers
    return sorting.direction === 'asc' 
      ? (aValue as number) - (bValue as number) 
      : (bValue as number) - (aValue as number);
  });
}

// Get unique values for filter options
export function getUniqueDiscoveryMethods(exoplanets: Exoplanet[]): string[] {
  const methods = new Set<string>();
  exoplanets.forEach(planet => {
    if (planet.pl_discmethod) methods.add(planet.pl_discmethod);
  });
  return Array.from(methods).sort();
}

export function getUniqueFacilities(exoplanets: Exoplanet[]): string[] {
  const facilities = new Set<string>();
  exoplanets.forEach(planet => {
    if (planet.pl_facility) facilities.add(planet.pl_facility);
  });
  return Array.from(facilities).sort();
}

export function getYearRange(exoplanets: Exoplanet[]): [number, number] {
  let minYear = 3000;
  let maxYear = 0;
  
  exoplanets.forEach(planet => {
    if (planet.pl_disc) {
      minYear = Math.min(minYear, planet.pl_disc);
      maxYear = Math.max(maxYear, planet.pl_disc);
    }
  });
  
  return [minYear, maxYear];
}

// Save favorite exoplanets to Supabase (requires authentication)
export async function saveFavoriteExoplanet(
  exoplanetId: string,
  userId: string
): Promise<void> {
  try {
    console.log("Saving favorite exoplanet:", exoplanetId, "for user:", userId);
    
    // Generate a unique, stable ID that's compatible with UUID format
    const stableId = generateStableUuid(exoplanetId);
    
    // Insert into user_favorites table
    const { data, error } = await supabase
      .from('user_favorites')
      .insert({ 
        user_id: userId,
        exoplanet_id: stableId,
        original_id: exoplanetId,
        created_at: new Date().toISOString()
      });
    
    if (error) {
      console.error("Error in saveFavoriteExoplanet:", error);
      throw error;
    }
    
    console.log("Successfully saved favorite:", data);
  } catch (error) {
    console.error("Error saving favorite exoplanet:", error);
    throw error;
  }
}

// Generate a stable UUID v5 from a string
function generateStableUuid(input: string): string {
  // This is a simplified version just for demonstration
  // In production, you'd use a proper UUID v5 implementation
  const hash = cyrb53(input).toString(16).padStart(32, '0');
  return [
    hash.substr(0, 8),
    hash.substr(8, 4),
    '5' + hash.substr(13, 3), // Version 5
    '8' + hash.substr(17, 3), // Variant 8
    hash.substr(20, 12)
  ].join('-');
}

// Simple hash function for generating deterministic IDs
function cyrb53(str: string, seed = 0): number {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

// Get user's favorite exoplanets
export async function getFavoriteExoplanets(
  userId: string
): Promise<string[]> {
  try {
    console.log("Getting favorite exoplanets for user:", userId);
    
    const { data, error } = await supabase
      .from('user_favorites')
      .select('original_id, exoplanet_id')
      .eq('user_id', userId);
    
    if (error) {
      console.error("Error in getFavoriteExoplanets:", error);
      throw error;
    }
    
    // Return original IDs if available, otherwise return exoplanet_id
    return data.map(item => item.original_id || item.exoplanet_id);
  } catch (error) {
    console.error("Error getting favorite exoplanets:", error);
    return [];
  }
}

// Remove favorite exoplanet
export async function removeFavoriteExoplanet(
  exoplanetId: string,
  userId: string
): Promise<void> {
  try {
    console.log("Removing favorite exoplanet:", exoplanetId, "for user:", userId);
    
    // First, try to remove by original_id
    const { error: originalIdError, count } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('original_id', exoplanetId);
    
    if (originalIdError) {
      console.error("Error removing by original_id:", originalIdError);
    }
    
    // If not found or error, try with the generated stable UUID
    if (!count || count === 0) {
      const stableId = generateStableUuid(exoplanetId);
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('exoplanet_id', stableId);
      
      if (error) {
        console.error("Error removing by exoplanet_id:", error);
        throw error;
      }
    }
  } catch (error) {
    console.error("Error removing favorite exoplanet:", error);
    throw error;
  }
}

// ASTROPHYSICS AND METAPHYSICS FEATURES

// Get cosmic objects like black holes, nebulae, etc.
export async function getCosmicObjects(type?: string): Promise<any[]> {
  try {
    let query = supabase.from('cosmic_objects').select('*');
    
    if (type) {
      query = query.eq('type', type);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching cosmic objects:", error);
    return [];
  }
}

// Get astronomical events (supernovae, mergers, etc.)
export async function getAstronomicalEvents(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('astronomical_events')
      .select('*')
      .order('event_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching astronomical events:", error);
    return [];
  }
}

// Get metaphysical concepts
export async function getMetaphysicalConcepts(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('metaphysical_concepts')
      .select('*');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching metaphysical concepts:", error);
    return [];
  }
}

// Save user notes on cosmic objects or exoplanets
export async function saveUserNote(
  userId: string, 
  noteText: string, 
  objectId?: string,
  exoplanetId?: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_cosmic_notes')
      .insert({ 
        user_id: userId, 
        object_id: objectId || null, 
        exoplanet_id: exoplanetId || null,
        note_text: noteText,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (error) throw error;
  } catch (error) {
    console.error("Error saving user note:", error);
    throw error;
  }
}

// Get user notes
export async function getUserNotes(userId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('user_cosmic_notes')
      .select(`
        *,
        cosmic_objects(*),
        exoplanet_id
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching user notes:", error);
    return [];
  }
}

// Create new cosmic object (for admin users)
export async function createCosmicObject(objectData: Omit<any, 'id' | 'created_at'>): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('cosmic_objects')
      .insert({
        ...objectData,
        created_at: new Date().toISOString()
      })
      .select();
    
    if (error) throw error;
    return data![0];
  } catch (error) {
    console.error("Error creating cosmic object:", error);
    throw error;
  }
}

// Get statistics about exoplanets
export function getExoplanetStatistics(exoplanets: Exoplanet[]): Record<string, any> {
  // Calculate various statistics
  const totalCount = exoplanets.length;
  
  // Group by discovery method
  const methodCounts: Record<string, number> = {};
  exoplanets.forEach(planet => {
    const method = planet.pl_discmethod || 'Unknown';
    methodCounts[method] = (methodCounts[method] || 0) + 1;
  });
  
  // Calculate average mass and radius
  let totalMass = 0;
  let massCount = 0;
  let totalRadius = 0;
  let radiusCount = 0;
  
  exoplanets.forEach(planet => {
    if (planet.pl_masse !== null) {
      totalMass += planet.pl_masse;
      massCount++;
    }
    if (planet.pl_rade !== null) {
      totalRadius += planet.pl_rade;
      radiusCount++;
    }
  });
  
  const avgMass = massCount > 0 ? totalMass / massCount : 0;
  const avgRadius = radiusCount > 0 ? totalRadius / radiusCount : 0;
  
  // Find potentially habitable planets (simplified criteria)
  const habitablePlanets = exoplanets.filter(planet => {
    // Planet is rocky (less than 2 Earth radii) and receives appropriate insolation
    return (
      planet.pl_rade !== null &&
      planet.pl_rade < 2.0 &&
      planet.pl_insol !== null &&
      planet.pl_insol > 0.3 &&
      planet.pl_insol < 2.0
    );
  });
  
  // Group by discovery decade
  const decadeCounts: Record<string, number> = {};
  exoplanets.forEach(planet => {
    if (planet.pl_disc) {
      const decade = `${Math.floor(planet.pl_disc / 10) * 10}s`;
      decadeCounts[decade] = (decadeCounts[decade] || 0) + 1;
    }
  });
  
  return {
    totalCount,
    methodCounts,
    avgMass,
    avgRadius,
    habitablePlanetsCount: habitablePlanets.length,
    habitablePlanets,
    decadeCounts,
    earliestDiscovery: exoplanets.reduce((earliest: number | null, planet) => 
      planet.pl_disc && (!earliest || planet.pl_disc < earliest) ? planet.pl_disc : earliest, null),
    latestDiscovery: exoplanets.reduce((latest: number | null, planet) => 
      planet.pl_disc && (!latest || planet.pl_disc > latest) ? planet.pl_disc : latest, null)
  };
}
