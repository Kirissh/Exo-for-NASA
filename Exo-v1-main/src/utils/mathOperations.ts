
/**
 * A collection of astronomy and math utility functions for exoplanet calculations
 */

/**
 * Convert Earth masses to Jupiter masses
 * @param earthMasses - Mass in Earth masses
 * @returns Mass in Jupiter masses
 */
export const earthToJupiterMass = (earthMasses: number): number => {
  return earthMasses / 317.8;
};

/**
 * Convert Jupiter masses to Earth masses
 * @param jupiterMasses - Mass in Jupiter masses
 * @returns Mass in Earth masses
 */
export const jupiterToEarthMass = (jupiterMasses: number): number => {
  return jupiterMasses * 317.8;
};

/**
 * Convert Earth radii to Jupiter radii
 * @param earthRadii - Radius in Earth radii
 * @returns Radius in Jupiter radii
 */
export const earthToJupiterRadius = (earthRadii: number): number => {
  return earthRadii / 11.2;
};

/**
 * Convert Jupiter radii to Earth radii
 * @param jupiterRadii - Radius in Jupiter radii
 * @returns Radius in Earth radii
 */
export const jupiterToEarthRadius = (jupiterRadii: number): number => {
  return jupiterRadii * 11.2;
};

/**
 * Convert Kelvin to Celsius
 * @param kelvin - Temperature in Kelvin
 * @returns Temperature in Celsius
 */
export const kelvinToCelsius = (kelvin: number): number => {
  return kelvin - 273.15;
};

/**
 * Convert Celsius to Kelvin
 * @param celsius - Temperature in Celsius
 * @returns Temperature in Kelvin
 */
export const celsiusToKelvin = (celsius: number): number => {
  return celsius + 273.15;
};

/**
 * Convert Kelvin to Fahrenheit
 * @param kelvin - Temperature in Kelvin
 * @returns Temperature in Fahrenheit
 */
export const kelvinToFahrenheit = (kelvin: number): number => {
  return (kelvin - 273.15) * 9/5 + 32;
};

/**
 * Convert Astronomical Units (AU) to light years
 * @param au - Distance in Astronomical Units
 * @returns Distance in light years
 */
export const auToLightYears = (au: number): number => {
  return au * 0.000015812;
};

/**
 * Convert light years to Astronomical Units (AU)
 * @param lightYears - Distance in light years
 * @returns Distance in Astronomical Units
 */
export const lightYearsToAu = (lightYears: number): number => {
  return lightYears / 0.000015812;
};

/**
 * Convert Astronomical Units (AU) to kilometers
 * @param au - Distance in Astronomical Units
 * @returns Distance in kilometers
 */
export const auToKilometers = (au: number): number => {
  return au * 149597870.7;
};

/**
 * Calculate escape velocity for a planet
 * @param mass - Mass of the planet in Earth masses
 * @param radius - Radius of the planet in Earth radii
 * @returns Escape velocity in km/s
 */
export const calculateEscapeVelocity = (mass: number, radius: number): number => {
  // Constants
  const G = 6.67430e-11; // Gravitational constant in m^3 kg^-1 s^-2
  const earthMass = 5.972e24; // Earth mass in kg
  const earthRadius = 6371000; // Earth radius in m
  
  // Convert to SI units
  const massInKg = mass * earthMass;
  const radiusInM = radius * earthRadius;
  
  // Calculate escape velocity: v = sqrt(2GM/R)
  const escapeVelocity = Math.sqrt((2 * G * massInKg) / radiusInM);
  
  // Convert from m/s to km/s
  return escapeVelocity / 1000;
};

/**
 * Calculate surface gravity of a planet relative to Earth's
 * @param mass - Mass of the planet in Earth masses
 * @param radius - Radius of the planet in Earth radii
 * @returns Surface gravity in g (Earth = 1)
 */
export const calculateSurfaceGravity = (mass: number, radius: number): number => {
  // g ∝ M/R²
  // Since we're using Earth masses and Earth radii, we can directly calculate
  return mass / (radius * radius);
};

/**
 * Calculate orbital period using Kepler's Third Law
 * @param semiMajorAxis - Semi-major axis in AU
 * @param starMass - Star mass in Solar masses
 * @returns Orbital period in Earth days
 */
export const calculateOrbitalPeriod = (semiMajorAxis: number, starMass: number): number => {
  // P² ∝ a³/M
  // Where P is in years, a is in AU, and M is in Solar masses
  const periodInYears = Math.sqrt(Math.pow(semiMajorAxis, 3) / starMass);
  
  // Convert years to days
  return periodInYears * 365.25;
};

/**
 * Format a number with appropriate units and precision
 * @param value - The number to format
 * @param precision - Number of decimal places (default: 2)
 * @returns Formatted string with appropriate precision
 */
export const formatNumber = (value: number | null | undefined, precision: number = 2): string => {
  if (value === null || value === undefined) return 'Unknown';
  return value.toFixed(precision);
};

/**
 * Calculate habitability score based on planet properties
 * @param equilibriumTemp - Planet's equilibrium temperature in Kelvin
 * @param orbitalPeriod - Orbital period in Earth days
 * @param mass - Planet mass in Earth masses (if available)
 * @returns Habitability score between 0-100
 */
export const calculateHabitabilityScore = (
  equilibriumTemp: number | null | undefined,
  orbitalPeriod: number | null | undefined,
  mass: number | null | undefined
): number => {
  // Start with 0 score
  let score = 0;
  
  // Temperature score - Earth-like temperatures (260-310K) are ideal
  if (equilibriumTemp !== null && equilibriumTemp !== undefined) {
    // Ideal temperature range (260-310K)
    const tempDiff = Math.abs(equilibriumTemp - 285);
    if (tempDiff < 25) {
      score += 40 * (1 - tempDiff/25);
    }
  }
  
  // Orbital period score - Earth-like periods (200-500 days) are good
  if (orbitalPeriod !== null && orbitalPeriod !== undefined) {
    // Ideal orbital period range
    if (orbitalPeriod > 100 && orbitalPeriod < 700) {
      const periodScore = 30 * (1 - Math.min(Math.abs(orbitalPeriod - 365) / 300, 1));
      score += periodScore;
    }
  }
  
  // Mass score - Earth-like masses (0.5-2 Earth masses) are potentially habitable
  if (mass !== null && mass !== undefined) {
    // Ideal mass range
    if (mass > 0.1 && mass < 10) {
      const massScore = 30 * (1 - Math.min(Math.abs(Math.log10(mass) / Math.log10(5)), 1));
      score += massScore;
    }
  }
  
  return Math.min(Math.max(Math.round(score), 0), 100);
};

/**
 * Convert a value between astronomical units
 * @param value - The value to convert
 * @param fromUnit - The unit to convert from
 * @param toUnit - The unit to convert to
 * @returns The converted value
 */
export const convertAstronomicalUnits = (
  value: number,
  fromUnit: 'au' | 'km' | 'ly' | 'pc' | 'earth_mass' | 'jupiter_mass' | 'earth_radius' | 'jupiter_radius' | 'kelvin' | 'celsius' | 'fahrenheit',
  toUnit: 'au' | 'km' | 'ly' | 'pc' | 'earth_mass' | 'jupiter_mass' | 'earth_radius' | 'jupiter_radius' | 'kelvin' | 'celsius' | 'fahrenheit'
): number => {
  // Distance conversions
  const auToKm = 149597870.7;
  const lyToAu = 63241.1;
  const pcToAu = 206265;
  
  // First convert to a common unit
  let standardValue: number;
  
  // Convert input to standard form
  switch (fromUnit) {
    // Distance
    case 'au': standardValue = value; break;
    case 'km': standardValue = value / auToKm; break;
    case 'ly': standardValue = value * lyToAu; break;
    case 'pc': standardValue = value * pcToAu; break;
    
    // Mass
    case 'earth_mass': standardValue = value; break;
    case 'jupiter_mass': standardValue = value * 317.8; break;
    
    // Radius
    case 'earth_radius': standardValue = value; break;
    case 'jupiter_radius': standardValue = value * 11.2; break;
    
    // Temperature
    case 'kelvin': standardValue = value; break;
    case 'celsius': standardValue = value + 273.15; break;
    case 'fahrenheit': standardValue = (value - 32) * 5/9 + 273.15; break;
    
    default: return value;
  }
  
  // Convert from standard form to output unit
  switch (toUnit) {
    // Distance
    case 'au': return standardValue;
    case 'km': return standardValue * auToKm;
    case 'ly': return standardValue / lyToAu;
    case 'pc': return standardValue / pcToAu;
    
    // Mass
    case 'earth_mass': return standardValue;
    case 'jupiter_mass': return standardValue / 317.8;
    
    // Radius
    case 'earth_radius': return standardValue;
    case 'jupiter_radius': return standardValue / 11.2;
    
    // Temperature
    case 'kelvin': return standardValue;
    case 'celsius': return standardValue - 273.15;
    case 'fahrenheit': return (standardValue - 273.15) * 9/5 + 32;
    
    default: return value;
  }
};
