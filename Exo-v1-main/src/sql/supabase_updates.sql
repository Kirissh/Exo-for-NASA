
-- Add original_id column to user_favorites
ALTER TABLE user_favorites ADD COLUMN original_id VARCHAR;

-- Create table for anonymous favorites (no login required)
CREATE TABLE anonymous_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id VARCHAR NOT NULL,
  exoplanet_id VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(device_id, exoplanet_id)
);

-- Create table for cosmic objects like black holes, nebulae, etc.
CREATE TABLE cosmic_objects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  type VARCHAR NOT NULL, -- black_hole, nebula, galaxy, etc.
  description TEXT,
  image_url VARCHAR,
  distance_ly DECIMAL, -- Distance in light years
  size_ly DECIMAL, -- Size in light years
  discovery_year INTEGER,
  constellation VARCHAR,
  coordinates JSONB, -- RA/DEC coordinates
  metadata JSONB, -- Additional scientific data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for astronomical events
CREATE TABLE astronomical_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  event_type VARCHAR NOT NULL, -- supernova, merger, eclipse, etc.
  description TEXT,
  image_url VARCHAR,
  event_date TIMESTAMP WITH TIME ZONE,
  discovery_date TIMESTAMP WITH TIME ZONE,
  affected_objects JSONB, -- Array of affected cosmic objects
  metadata JSONB, -- Additional scientific data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for metaphysical concepts
CREATE TABLE metaphysical_concepts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  concept_type VARCHAR NOT NULL, -- theory, principle, hypothesis
  description TEXT,
  image_url VARCHAR,
  related_physics JSONB, -- Related physics concepts
  proposed_by VARCHAR,
  proposed_year INTEGER,
  citations JSONB, -- Scientific papers that cite this concept
  metadata JSONB, -- Additional data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for user notes on cosmic objects
CREATE TABLE user_cosmic_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  object_id UUID REFERENCES cosmic_objects(id) ON DELETE CASCADE,
  exoplanet_id VARCHAR, -- Can be linked to exoplanet by name
  note_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for anonymous notes (no login required)
CREATE TABLE anonymous_cosmic_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id VARCHAR NOT NULL,
  object_id UUID REFERENCES cosmic_objects(id) ON DELETE CASCADE,
  exoplanet_id VARCHAR, -- Can be linked to exoplanet by name
  note_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create NASA News Cache Table
CREATE TABLE nasa_news_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  data JSONB NOT NULL,
  source VARCHAR,
  count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE anonymous_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE cosmic_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE astronomical_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE metaphysical_concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cosmic_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE anonymous_cosmic_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE nasa_news_cache ENABLE ROW LEVEL SECURITY;

-- Set RLS policies
-- Allow anyone to manage anonymous favorites
CREATE POLICY "Anyone can manage anonymous favorites" ON anonymous_favorites
  FOR ALL USING (true);

-- Anyone can read cosmic objects
CREATE POLICY "Anyone can read cosmic objects" ON cosmic_objects
  FOR SELECT USING (true);

-- Anyone can read astronomical events
CREATE POLICY "Anyone can read astronomical events" ON astronomical_events
  FOR SELECT USING (true);

-- Anyone can read metaphysical concepts
CREATE POLICY "Anyone can read metaphysical concepts" ON metaphysical_concepts
  FOR SELECT USING (true);

-- Users can manage their own cosmic notes
CREATE POLICY "Users can manage their own cosmic notes" ON user_cosmic_notes
  FOR ALL USING (auth.uid() = user_id);

-- Allow anyone to manage anonymous notes
CREATE POLICY "Anyone can manage anonymous notes" ON anonymous_cosmic_notes
  FOR ALL USING (true);

-- Allow public read access to NASA news cache
CREATE POLICY "Anyone can read NASA news cache" ON nasa_news_cache
  FOR SELECT USING (true);

-- Only service accounts or authenticated users can insert/update NASA news cache
CREATE POLICY "Only authorized users can update NASA news cache" ON nasa_news_cache
  FOR INSERT USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX idx_anonymous_favorites_device_id ON anonymous_favorites(device_id);
CREATE INDEX idx_anonymous_favorites_exoplanet_id ON anonymous_favorites(exoplanet_id);
CREATE INDEX idx_cosmic_objects_type ON cosmic_objects(type);
CREATE INDEX idx_astronomical_events_type ON astronomical_events(event_type);
CREATE INDEX idx_metaphysical_concepts_type ON metaphysical_concepts(concept_type);
CREATE INDEX idx_user_cosmic_notes_user_id ON user_cosmic_notes(user_id);
CREATE INDEX idx_user_cosmic_notes_object_id ON user_cosmic_notes(object_id);
CREATE INDEX idx_anonymous_cosmic_notes_device_id ON anonymous_cosmic_notes(device_id);
CREATE INDEX idx_anonymous_cosmic_notes_object_id ON anonymous_cosmic_notes(object_id);
CREATE INDEX idx_nasa_news_cache_created_at ON nasa_news_cache(created_at);
