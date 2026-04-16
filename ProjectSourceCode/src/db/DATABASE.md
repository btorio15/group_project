# Database Schema Documentation

This document describes the database schema for the amenities app. The database is PostgreSQL with the PostGIS extension enabled for geospatial queries.

---

## `users`
Stores registered user accounts.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | SERIAL | PRIMARY KEY | Auto-incrementing unique identifier |
| `username` | VARCHAR(50) | UNIQUE, NOT NULL | Display name chosen by the user |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User's email address |
| `password_hash` | VARCHAR(255) | NOT NULL | Bcrypt hash of the user's password — never store plain text |
| `created_at` | TIMESTAMP | DEFAULT NOW() | When the account was created |

**Notes:**
- Passwords must be hashed somehow, we can figure that out later.
- `email` and `username` are both unique — either can be used for login.

---

## `amenity_types`
A lookup table defining the categories of amenities that can be tagged to a location.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | SERIAL | PRIMARY KEY | Auto-incrementing unique identifier |
| `name` | VARCHAR(100) | UNIQUE, NOT NULL | Name of the amenity e.g. "WiFi", "Bathroom", "Water Fountain" |

**Notes:**
- To add a new amenity category, just insert a new row here — no schema changes needed.
- Example seed values: `WiFi`, `Bathroom`, `Water Fountain`, `EV Charger`, `Outdoor Seating`, `Parking`.

---

## `locations`
The core table. Represents a physical place that can have amenities (e.g. a café, park, or library).

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | SERIAL | PRIMARY KEY | Auto-incrementing unique identifier |
| `name` | VARCHAR(255) | NOT NULL | Name of the location e.g. "Norlin Library" |
| `address` | TEXT | | Street address |
| `lat` | DOUBLE PRECISION | NOT NULL | Latitude coordinate |
| `lng` | DOUBLE PRECISION | NOT NULL | Longitude coordinate |
| `geom` | GEOGRAPHY(Point, 4326) | | PostGIS spatial column — auto-populated from `lat`/`lng`, do not set manually |
| `added_by` | INT | FK → users(id) | The user who added this location |
| `created_at` | TIMESTAMP | DEFAULT NOW() | When the location was added |

**Notes:**
- **Do not manually set `geom`** — a database trigger (`trg_sync_location_geom`) automatically populates it from `lat` and `lng` on every insert or update.
- `geom` uses SRID 4326, the standard GPS coordinate system (WGS 84).


---

## `location_amenities`
A join table linking locations to the amenities they offer. Also tracks availability and notes.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | SERIAL | PRIMARY KEY | Auto-incrementing unique identifier |
| `location_id` | INT | NOT NULL, FK → locations(id) | The location this amenity belongs to |
| `amenity_type_id` | INT | NOT NULL, FK → amenity_types(id) | The type of amenity |
| `is_available` | BOOLEAN | DEFAULT TRUE | Whether this amenity is currently working/available |
| `notes` | TEXT | | Optional extra info e.g. "WiFi password: coffee123" |
| `last_verified` | TIMESTAMP | DEFAULT NOW() | When availability was last confirmed |

**Notes:**


---

## `reviews`
Stores user reviews and star ratings for locations.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | SERIAL | PRIMARY KEY | Auto-incrementing unique identifier |
| `location_id` | INT | NOT NULL, FK → locations(id) | The location being reviewed |
| `user_id` | INT | NOT NULL, FK → users(id) | The user who wrote the review |
| `rating` | SMALLINT | CHECK 1–5 | Star rating between 1 and 5 |
| `body` | TEXT | | Written review content |
| `created_at` | TIMESTAMP | DEFAULT NOW() | When the review was submitted |

**Notes:**


---

## Relationships

```
users ──────────────────< locations          (one user can add many locations)
users ──────────────────< reviews            (one user can write many reviews)
locations ──────────────< location_amenities (one location can have many amenities)
locations ──────────────< reviews            (one location can have many reviews)
amenity_types ──────────< location_amenities (one amenity type can appear at many locations)
```
