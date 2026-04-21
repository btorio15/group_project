CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(50)  UNIQUE NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- AMENITY TYPES
-- ============================================================

CREATE TABLE IF NOT EXISTS amenity_types (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

-- ============================================================
-- LOCATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS locations (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  address     TEXT,
  lat         DOUBLE PRECISION NOT NULL,
  lng         DOUBLE PRECISION NOT NULL,
  geom        GEOGRAPHY(Point, 4326),  -- PostGIS column for spatial queries
  added_by    INT REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Auto-populate the geom column from lat/lng on insert or update
CREATE OR REPLACE FUNCTION sync_location_geom()
RETURNS TRIGGER AS $$
BEGIN
  NEW.geom = ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326)::GEOGRAPHY;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_location_geom
BEFORE INSERT OR UPDATE ON locations
FOR EACH ROW EXECUTE FUNCTION sync_location_geom();

-- Spatial index ("find amenities near me")
CREATE INDEX IF NOT EXISTS idx_locations_geom ON locations USING GIST(geom);

-- ============================================================
-- LOCATION AMENITIES
-- ============================================================

CREATE TABLE IF NOT EXISTS location_amenities (
  id              SERIAL PRIMARY KEY,
  location_id     INT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  amenity_type_id INT NOT NULL REFERENCES amenity_types(id) ON DELETE CASCADE,
  is_available    BOOLEAN DEFAULT TRUE,
  notes           TEXT,                  -- e.g. "WiFi password: coffee123"
  last_verified   TIMESTAMP DEFAULT NOW(),
  UNIQUE(location_id, amenity_type_id)   -- no duplicate amenities per location
);

-- ============================================================
-- REVIEWS
-- ============================================================

CREATE TABLE IF NOT EXISTS reviews (
  id          SERIAL PRIMARY KEY,
  location_id INT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating      SMALLINT CHECK (rating BETWEEN 1 AND 5),
  body        TEXT,
  created_at  TIMESTAMP DEFAULT NOW(),
  UNIQUE(location_id, user_id)
);

ALTER TABLE locations ADD COLUMN image_url TEXT;
ALTER TABLE locations ADD COLUMN review_summary TEXT;
ALTER TABLE locations ADD COLUMN review_summary_count INT DEFAULT 0;