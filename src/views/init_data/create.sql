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

-- Spatial index for fast proximity queries ("find amenities near me")
CREATE INDEX IF NOT EXISTS idx_locations_geom ON locations USING GIST(geom);