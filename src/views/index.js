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
const bcrypt = require('bcryptjs'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part C.

// *****************************************************
// <-- 2: Connect to DB -->
// *****************************************************

// create `ExpressHandlebars` instance and configure the layouts and partials dir.
const hbs = handlebars.create({
  extname: 'hbs',
  layoutsDir: __dirname + '/layouts',
  partialsDir: __dirname + '/partials',
  helpers: {
    json: (context) => JSON.stringify(context)
  }
});

// Register custom helper for equality comparison
Handlebars.registerHelper('eq', function(a, b) {
  return a === b;
});

// database configuration
const dbConfig = {
  host: 'db', // the database server
  port: 5432, // the database port
  database: process.env.POSTGRES_DB, // the database name
  user: process.env.POSTGRES_USER, // the user account to connect with
  password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

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
app.set('views', __dirname);
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.
app.use(express.static(path.join(__dirname, '../resources')));

// initialize session variables
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

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
app.get('/edit', (req, res) => {
  res.render('pages/edit', { activePage: 'edit' });
});
app.get('/locations', (req, res) => {
  res.render('pages/locations', { activePage: 'locations' });
});
app.get('/profile', (req, res) => {
  res.render('pages/profile', { activePage: 'profile' });
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

app.get('/home', async (req, res) => {
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

    // attach placeholder data not yet in DB
    const mapped = locations.map(loc => ({
      ...loc,
      rating: loc.rating || 'N/A',
      image_url: loc.image_url || 'https://placehold.co/400x200',
      distance: '—',
      isOpen: true,
      hours: null,
    }));

    res.render('pages/home', { locations: mapped, activePage: 'home' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading locations');
  }
});
// *****************************************************
// <-- 5: Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
module.exports = app.listen(3000);
console.log('Server is listening on port 3000');