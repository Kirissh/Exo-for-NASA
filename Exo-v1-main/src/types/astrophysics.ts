
export interface CosmicObject {
  id: string;
  name: string;
  type: string; // black_hole, nebula, galaxy, etc.
  description: string;
  image_url?: string;
  distance_ly?: number; // Distance in light years
  size_ly?: number; // Size in light years
  discovery_year?: number;
  constellation?: string;
  coordinates?: {
    ra: number; // Right Ascension
    dec: number; // Declination
  };
  metadata?: Record<string, any>; // Additional scientific data
  created_at: string;
}

export interface AstronomicalEvent {
  id: string;
  name: string;
  event_type: string; // supernova, merger, eclipse, etc.
  description: string;
  image_url?: string;
  event_date: string;
  discovery_date?: string;
  affected_objects?: {
    id: string;
    name: string;
    type: string;
  }[];
  metadata?: Record<string, any>; // Additional scientific data
  created_at: string;
}

export interface MetaphysicalConcept {
  id: string;
  name: string;
  concept_type: string; // theory, principle, hypothesis
  description: string;
  image_url?: string;
  related_physics?: string[];
  proposed_by?: string;
  proposed_year?: number;
  citations?: {
    title: string;
    authors: string[];
    year: number;
    journal?: string;
    url?: string;
  }[];
  metadata?: Record<string, any>; // Additional data
  created_at: string;
}

export interface UserCosmicNote {
  id: string;
  user_id: string;
  object_id?: string;
  exoplanet_id?: string;
  note_text: string;
  created_at: string;
  updated_at: string;
}
