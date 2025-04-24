
-- Create Exoplanets Table
CREATE TABLE exoplanets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pl_name VARCHAR NOT NULL,
  pl_discmethod VARCHAR,
  pl_facility VARCHAR,
  pl_disc INTEGER,
  pl_masse DECIMAL,
  pl_rade DECIMAL,
  pl_orbper DECIMAL,
  pl_orbsmax DECIMAL,
  pl_orbeccen DECIMAL,
  pl_eqt DECIMAL,
  st_dist DECIMAL,
  st_spectype VARCHAR,
  st_mass DECIMAL,
  st_rad DECIMAL,
  st_teff DECIMAL,
  rowupdate VARCHAR,
  nasa_url VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_favorites Table
CREATE TABLE user_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exoplanet_id UUID NOT NULL REFERENCES exoplanets(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, exoplanet_id)
);

-- Create user_searches Table to store search history
CREATE TABLE user_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  search_term VARCHAR,
  filters JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS Policies
-- Enable RLS
ALTER TABLE exoplanets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_searches ENABLE ROW LEVEL SECURITY;

-- Exoplanets - Anyone can read
CREATE POLICY "Anyone can read exoplanets" ON exoplanets
  FOR SELECT USING (true);

-- User Favorites - Users can manage their own favorites
CREATE POLICY "Users can manage their own favorites" ON user_favorites
  FOR ALL USING (auth.uid() = user_id);

-- User Searches - Users can manage their own search history
CREATE POLICY "Users can manage their own search history" ON user_searches
  FOR ALL USING (auth.uid() = user_id);

-- Create Indexes for better performance
CREATE INDEX idx_exoplanets_name ON exoplanets(pl_name);
CREATE INDEX idx_exoplanets_discmethod ON exoplanets(pl_discmethod);
CREATE INDEX idx_exoplanets_facility ON exoplanets(pl_facility);
CREATE INDEX idx_exoplanets_disc_year ON exoplanets(pl_disc);
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_searches_user_id ON user_searches(user_id);
