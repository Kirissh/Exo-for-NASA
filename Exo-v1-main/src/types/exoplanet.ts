
export interface Exoplanet {
  id: string;
  pl_name: string;
  pl_discmethod: string;
  pl_facility: string;
  pl_disc: number; // Discovery year
  pl_masse: number | null; // Mass (earth mass)
  pl_rade: number | null; // Radius (earth radius)
  pl_orbper: number | null; // Orbital period (days)
  pl_orbsmax: number | null; // Semi-major axis (AU)
  pl_orbeccen: number | null; // Eccentricity
  pl_eqt: number | null; // Equilibrium temperature
  st_dist: number | null; // Distance from Earth
  st_spectype: string | null; // Spectral type of host star
  st_mass: number | null; // Stellar mass
  st_rad: number | null; // Stellar radius
  st_teff: number | null; // Stellar effective temperature
  
  // Basic additional fields for comprehensive data
  pl_bmasse?: number | null; // Planet mass (Jupiter mass)
  pl_brade?: number | null; // Planet radius (Jupiter radius)
  pl_dens?: number | null; // Planet density
  pl_insol?: number | null; // Insolation flux
  ra?: number | null; // Right ascension
  dec?: number | null; // Declination
  pl_telescope?: string | null; // Telescope used for discovery
  st_age?: number | null; // Stellar age
  st_met?: number | null; // Stellar metallicity
  st_lum?: number | null; // Stellar luminosity
  
  // Enhanced data from NASA API
  hostname?: string | null; // Host star name
  pl_letter?: string | null; // Planet letter designation
  pl_orbincl?: number | null; // Orbital inclination
  pl_orblper?: number | null; // Argument of periastron
  pl_trandep?: number | null; // Transit depth (%)
  pl_trandur?: number | null; // Transit duration (hours)
  pl_tranmid?: string | null; // Transit midpoint
  pl_tsm?: number | null; // Transmission Spectroscopy Metric
  pl_esm?: number | null; // Emission Spectroscopy Metric
  
  // System properties
  sy_snum?: number | null; // Number of stars in system
  sy_pnum?: number | null; // Number of planets in system
  sy_mnum?: number | null; // Number of moons in system
  
  // Alternative names
  hd_name?: string | null; // HD catalog name
  hip_name?: string | null; // Hipparcos catalog name
  pl_alt_names?: string | null; // Alternative planet names
  
  rowupdate: string; // Last update date
  nasa_url: string; // Link to NASA's exoplanet archive
}

export interface ExoplanetFilters {
  yearRange: [number, number];
  discoveryMethods: string[];
  facilities: string[];
  searchTerm: string;
}

export type SortField = 'pl_name' | 'pl_disc' | 'pl_masse' | 'pl_rade' | 'st_dist';
export type SortDirection = 'asc' | 'desc';

export interface ExoplanetSorting {
  field: SortField;
  direction: SortDirection;
}
