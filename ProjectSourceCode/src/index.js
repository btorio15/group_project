// *****************************************************
// <-- 1: Import Dependencies -->
// *****************************************************

const express = require('express'); // To build an application server or API
const app = express();
const handlebars = require('express-handlebars'); //to enable express to work with handlebars
const Handlebars = require('handlebars'); // to include the templating engine responsible for compiling templates
const path = require('path');
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const pgSession = require('connect-pg-simple')(session);
const bcrypt = require('bcryptjs'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part C.
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

async function generateReviewSummary(reviews) {
  if (!anthropic || !reviews || reviews.length === 0) return null;
  const reviewText = reviews
    .map(r => `Rating: ${r.rating}/5\n${r.body || '(no comment)'}`)
    .join('\n\n---\n\n');
  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 120,
    messages: [{
      role: 'user',
      content: `Summarize these reviews in ONE short sentence (max 25 words). Capture the main sentiment and one notable detail. No preamble, no "Users say", no quotes — just the summary.\n\n${reviewText}`,
    }],
  });
  const block = msg.content.find(b => b.type === 'text');
  return block ? block.text.trim() : null;
}

// *****************************************************
// <-- 2: Connect to DB -->
// *****************************************************

// create `ExpressHandlebars` instance and configure the layouts and partials dir.
const hbs = handlebars.create({
  extname: 'hbs',
  layoutsDir: __dirname + '/views/layouts',
  partialsDir: __dirname + '/views/partials',
  helpers: {
    json: (context) => JSON.stringify(context)
  }
});

// Register custom helper for equality comparison
Handlebars.registerHelper('eq', function(a, b) {
  return a === b;
});

Handlebars.registerHelper('formatDate', function(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
});

Handlebars.registerHelper('stars', function(rating) {
  const filled = '<svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
  const empty = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
  const n = parseInt(rating) || 0;
  let html = '';
  for (let i = 0; i < 5; i++) html += i < n ? filled : empty;
  return new Handlebars.SafeString(html);
});

// database configuration
let dbConfig;

if (process.env.DATABASE_URL) {
  // Remote database (e.g. Supabase)
  dbConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  };
} else {
  // Local Docker container (fallback)
  dbConfig = {
    host: process.env.DB_HOST || 'db',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
  };
}

const db = pgp(dbConfig);


// test your database
db.connect()
  .then(obj => {
    console.log('Database connection successful'); // you can view this message in the docker compose logs
    obj.done(); // success, release the connection;
  })
  .catch(error => {
    console.log('ERROR:', error.message || error);
  });
// *****************************************************
// <-- 3: App Settings -->
// *****************************************************

// Register `hbs` as our view engine using its bound `engine()` function.
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.
app.use(express.static(path.join(__dirname, 'resources')));

// Trust Render's proxy so secure cookies work behind its TLS terminator
app.set('trust proxy', 1);

// initialize session variables
app.use(
  session({
    store: new pgSession({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  })
);

// Expose session user to all templates so partials (e.g. navbar) can render conditionally.
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Normalize image URLs that came from scraped data without a leading slash.
// e.g. "img/foo.jpg" works on /locations but breaks on /location/5 (relative path).
function normalizeImageUrl(url) {
  if (!url) return null;
  if (/^(https?:|data:|\/)/.test(url)) return url;
  return '/' + url;
}

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// *****************************************************
// <-- 4: API Routes -->
// *****************************************************
app.get('/welcome', (req, res) => {
  res.json({status: 'success', message: 'Welcome!'});
});
//Redirect
app.get('/', (req, res) => { 
  res.redirect('/login'); 
});
//Renders
app.get('/register', (req, res) => {
  res.render('pages/register');
});
app.get('/login', (req, res) => {
  res.render('pages/login');
});
app.get('/edit', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  try {
    const amenityTypes = await db.any('SELECT id, name FROM amenity_types ORDER BY name');
    res.render('pages/edit', { activePage: 'edit', amenityTypes });
  } catch (err) {
    console.error(err);
    res.render('pages/edit', { activePage: 'edit', amenityTypes: [] });
  }
});
app.post('/addlocation', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const { name, image_url } = req.body;
  let { address, lat, lng } = req.body;
  const amenities = Array.isArray(req.body.amenities)
    ? req.body.amenities
    : req.body.amenities ? [req.body.amenities] : [];

  // Require at least an address or both lat+lng
  const hasAddress = address && address.trim();
  const hasCoords  = lat && lng;
  if (!hasAddress && !hasCoords) {
    const amenityTypes = await db.any('SELECT id, name FROM amenity_types ORDER BY name').catch(() => []);
    return res.render('pages/edit', {
      activePage: 'edit', amenityTypes,
      error: 'Please provide an address or latitude and longitude.'
    });
  }

  try {
    // Geocode address to get coordinates when not provided
    if (!hasCoords && hasAddress) {
      const geoRes = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: { address, key: process.env.API_KEY }
      });
      if (geoRes.data.status === 'OK' && geoRes.data.results.length > 0) {
        const coords = geoRes.data.results[0].geometry.location;
        lat = coords.lat;
        lng = coords.lng;
      } else {
        const amenityTypes = await db.any('SELECT id, name FROM amenity_types ORDER BY name').catch(() => []);
        return res.render('pages/edit', {
          activePage: 'edit', amenityTypes,
          error: 'Could not determine coordinates from the address. Please enter latitude and longitude manually.'
        });
      }
    }

    // Reverse-geocode coordinates to get address when not provided
    if (!hasAddress && hasCoords) {
      const geoRes = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: { latlng: `${lat},${lng}`, key: process.env.API_KEY }
      });
      if (geoRes.data.status === 'OK' && geoRes.data.results.length > 0) {
        address = geoRes.data.results[0].formatted_address;
      } else {
        address = `${parseFloat(lat).toFixed(6)}, ${parseFloat(lng).toFixed(6)}`;
      }
    }

    const location = await db.one(
      'INSERT INTO locations (name, address, lat, lng, added_by, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [name, address, parseFloat(lat), parseFloat(lng), req.session.user.id, image_url || null]
    );
    for (const amenityId of amenities) {
      await db.none(
        'INSERT INTO location_amenities (location_id, amenity_type_id) VALUES ($1, $2)',
        [location.id, parseInt(amenityId)]
      );
    }
    res.redirect('/home');
  } catch (err) {
    console.error(err);
    const amenityTypes = await db.any('SELECT id, name FROM amenity_types ORDER BY name').catch(() => []);
    res.render('pages/edit', { activePage: 'edit', amenityTypes, error: 'Failed to add location. Please try again.' });
  }
});

app.get('/locations', async (req, res) => {
  try {
    const locations = await db.any(`
      SELECT
        l.id,
        l.name,
        l.address,
        l.lat,
        l.lng,
        ROUND(AVG(r.rating)::numeric, 1) AS rating,
        COUNT(DISTINCT r.id) AS "reviewCount",
        ARRAY_AGG(DISTINCT at.name) FILTER (WHERE at.name IS NOT NULL) AS amenities,
        l.image_url
      FROM locations l
      LEFT JOIN reviews r ON r.location_id = l.id
      LEFT JOIN location_amenities la ON la.location_id = l.id
      LEFT JOIN amenity_types at ON at.id = la.amenity_type_id
      GROUP BY l.id
    `);

    const mapped = locations.map(loc => ({
      ...loc,
      rating: loc.rating || 'N/A',
      image_url: normalizeImageUrl(loc.image_url) || 'https://placehold.co/400x200',
      distance: '—',
      isOpen: true,
      hours: null,
    }));

    res.render('pages/locations', {
      activePage: 'locations',
      locations: mapped
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading locations');
  }
});

app.get('/location/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).send('Invalid location id');

    const [location, reviews, myReview] = await Promise.all([
      db.oneOrNone(`
        SELECT l.id, l.name, l.address, l.lat, l.lng, l.image_url, l.added_by, l.created_at,
          l.review_summary, l.review_summary_count,
          ROUND(AVG(r.rating)::numeric, 1) AS rating,
          COUNT(DISTINCT r.id) AS "reviewCount",
          ARRAY_AGG(DISTINCT at.name) FILTER (WHERE at.name IS NOT NULL) AS amenities
        FROM locations l
        LEFT JOIN reviews r ON r.location_id = l.id
        LEFT JOIN location_amenities la ON la.location_id = l.id
        LEFT JOIN amenity_types at ON at.id = la.amenity_type_id
        WHERE l.id = $1
        GROUP BY l.id
      `, [id]),
      db.any(`
        SELECT r.id, r.rating, r.body, r.created_at, r.user_id, u.username
        FROM reviews r JOIN users u ON u.id = r.user_id
        WHERE r.location_id = $1
        ORDER BY r.created_at DESC
      `, [id]),
      req.session.user
        ? db.oneOrNone(
            'SELECT id, rating, body FROM reviews WHERE location_id = $1 AND user_id = $2',
            [id, req.session.user.id])
        : null,
    ]);

    if (!location) return res.status(404).send('Location not found');

    // Lazy regenerate AI summary when review count grows (and we have at least 3).
    let reviewSummary = location.review_summary;
    if (reviews.length >= 3 && reviews.length > (location.review_summary_count || 0)) {
      try {
        const fresh = await generateReviewSummary(reviews);
        if (fresh) {
          await db.none(
            'UPDATE locations SET review_summary = $1, review_summary_count = $2 WHERE id = $3',
            [fresh, reviews.length, id]
          );
          reviewSummary = fresh;
        }
      } catch (aiErr) {
        console.error('Review summary generation failed:', aiErr.message || aiErr);
      }
    }

    res.render('pages/location-detail', {
      activePage: 'locations',
      location: {
        ...location,
        rating: location.rating || 'N/A',
        image_url: normalizeImageUrl(location.image_url) || 'https://placehold.co/800x400',
        amenities: location.amenities || [],
        review_summary: reviewSummary,
      },
      reviews,
      myReview,
      isLoggedIn: !!req.session.user,
      isOwner: req.session.user && location.added_by === req.session.user.id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading location');
  }
});

app.post('/location/:id/review', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  try {
    const id = parseInt(req.params.id, 10);
    const rating = parseInt(req.body.rating, 10);
    const body = (req.body.body || '').trim();
    if (Number.isNaN(id) || rating < 1 || rating > 5) {
      return res.status(400).send('Invalid input');
    }
    await db.none(`
      INSERT INTO reviews (location_id, user_id, rating, body)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (location_id, user_id)
      DO UPDATE SET rating = EXCLUDED.rating, body = EXCLUDED.body, created_at = NOW()
    `, [id, req.session.user.id, rating, body]);
    res.redirect(`/location/${id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving review');
  }
});

app.get('/profile', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  try {
    const [user, locations, reviews] = await Promise.all([
      db.one('SELECT id, username, email, created_at FROM users WHERE id = $1', [req.session.user.id]),
      db.any(`
        SELECT l.id, l.name, l.address, l.lat, l.lng,
          ROUND(AVG(r.rating)::numeric, 1) AS rating,
          COUNT(DISTINCT r.id) AS "reviewCount",
          ARRAY_AGG(DISTINCT at.name) FILTER (WHERE at.name IS NOT NULL) AS amenities,
          l.image_url
        FROM locations l
        LEFT JOIN reviews r ON r.location_id = l.id
        LEFT JOIN location_amenities la ON la.location_id = l.id
        LEFT JOIN amenity_types at ON at.id = la.amenity_type_id
        WHERE l.added_by = $1
        GROUP BY l.id
      `, [req.session.user.id]),
      db.any(`
        SELECT r.id, r.rating, r.body, r.created_at, r.location_id, l.name AS location_name
        FROM reviews r
        JOIN locations l ON l.id = r.location_id
        WHERE r.user_id = $1
        ORDER BY r.created_at DESC
      `, [req.session.user.id])
    ]);

    const mapped = locations.map(loc => ({
      ...loc,
      rating: loc.rating || 'N/A',
      image_url: normalizeImageUrl(loc.image_url) || 'https://placehold.co/400x200',
      distance: '—',
      isOpen: true,
      hours: null,
    }));

    res.render('pages/profile', {
      activePage: 'profile',
      user,
      locations: mapped,
      reviews,
      locationCount: mapped.length,
      reviewCount: reviews.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading profile');
  }
});
//API KEY
app.get('/maps-api-key', (req, res) => {
  res.json({key:process.env.API_KEY});
});
//Register
app.post('/registeruser', async (req, res) => {
  //hash the password using bcrypt library
  const hash = await bcrypt.hash(req.body.password, 10);
  const username = req.body.username;
  const email = req.body.email;

  if (!username || !hash || !email){
    return res.redirect('/register');
  }
  try {
    await db.none('INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)', [username, email, hash]);
    res.redirect('/login');
  } catch (err){
    console.error('Error',err);
    res.redirect('/register');
  }
});
//Login
app.post('/loginuser', async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.render('pages/login', {
      username,
      usernameError: !username ? 'Username is required.' : null,
      passwordError: !password ? 'Password is required.' : null,
    });
  }

  try {
    const user = await db.oneOrNone('SELECT * FROM users WHERE username = $1', [username]);

    if (!user) {
      return res.render('pages/login', {
        username,
        usernameError: 'No account found with that username.',
      });
    }

    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.render('pages/login', {
        username,
        passwordError: 'Incorrect password.',
      });
    }

    req.session.user = user;
    req.session.save(() => {
      res.redirect('/home');
    });
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    return res.render('pages/login', {
      username,
      usernameError: 'An error occurred. Please try again.',
    });
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
});

app.get('/home', async (req, res) => {
  try {
    const [locations, amenityCategories] = await Promise.all([
      db.any(`
        SELECT
          l.id,
          l.name,
          l.address,
          l.lat,
          l.lng,
          ROUND(AVG(r.rating)::numeric, 1) AS rating,
          COUNT(DISTINCT r.id) AS "reviewCount",
          ARRAY_AGG(DISTINCT at.name) FILTER (WHERE at.name IS NOT NULL) AS amenities,
          l.image_url
        FROM locations l
        LEFT JOIN reviews r ON r.location_id = l.id
        LEFT JOIN location_amenities la ON la.location_id = l.id
        LEFT JOIN amenity_types at ON at.id = la.amenity_type_id
        GROUP BY l.id
      `),
      db.any(`
        SELECT at.name, COUNT(DISTINCT la.location_id) AS count
        FROM amenity_types at
        LEFT JOIN location_amenities la ON la.amenity_type_id = at.id
        GROUP BY at.id, at.name
        ORDER BY at.name
      `)
    ]);

    // attach placeholder data not yet in DB
    const mapped = locations.map(loc => ({
      ...loc,
      rating: loc.rating || 'N/A',
      image_url: normalizeImageUrl(loc.image_url) || 'https://placehold.co/400x200',
      distance: '—',
      isOpen: true,
      hours: null,
    }));

    res.render('pages/home', { locations: mapped, amenityCategories, activePage: 'home' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading locations');
  }
});

// Edit location
app.post('/edit', async (req, res) => {
  const { id, name, address, image_url, amenities } = req.body;

  if (!id || !name || !address) {
    return res.status(400).send('Missing required fields');
  }

  try {
    // Geocode the address so lat/lng stay in sync on edits.
    // If geocoding fails, fall back to updating other fields only.
    let lat = null, lng = null;
    try {
      const geoRes = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: { address, key: process.env.API_KEY }
      });
      if (geoRes.data.status === 'OK' && geoRes.data.results.length > 0) {
        const coords = geoRes.data.results[0].geometry.location;
        lat = coords.lat;
        lng = coords.lng;
      }
    } catch (geoErr) {
      console.error('Geocoding failed during edit:', geoErr);
    }

    if (lat !== null && lng !== null) {
      await db.none(
        'UPDATE locations SET name = $1, address = $2, image_url = $3, lat = $4, lng = $5 WHERE id = $6',
        [name, address, image_url || null, lat, lng, id]
      );
    } else {
      await db.none('UPDATE locations SET name = $1, address = $2, image_url = $3 WHERE id = $4', [name, address, image_url || null, id]);
    }

    // Update amenities
    // delete existing
    await db.none('DELETE FROM location_amenities WHERE location_id = $1', [id]);

    // Then insert new ones
    if (amenities && Array.isArray(amenities)) {
      for (const amenity of amenities) {
        // Get amenity_type_id
        const amenityType = await db.oneOrNone('SELECT id FROM amenity_types WHERE name = $1', [amenity]);
        if (amenityType) {
          await db.none('INSERT INTO location_amenities (location_id, amenity_type_id) VALUES ($1, $2)', [id, amenityType.id]);
        } else {
          // If amenity not found, insert it
          const newAmenity = await db.one('INSERT INTO amenity_types (name) VALUES ($1) RETURNING id', [amenity]);
          await db.none('INSERT INTO location_amenities (location_id, amenity_type_id) VALUES ($1, $2)', [id, newAmenity.id]);
        }
      }
    }

    res.redirect('/home');
  } catch (err) {
    console.error('Error updating location:', err);
    res.status(500).send('Error updating location');
  }
});


//AI

// *****************************************************
// <-- 5: Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
module.exports = app.listen(3000);
console.log('Server is listening on port 3000');