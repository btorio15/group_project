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
  layoutsDir: __dirname + 'views/layouts',
  partialsDir: __dirname + 'views/partials',
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
//Redirect
app.get('/', (req, res) => { 
  res.redirect('/load'); 
});
//Renders
app.get('/register', (req, res) => {
  res.render('pages/register');
});
app.get('/login', (req, res) => {
  res.render('pages/login');
});
app.get('/home', (req, res) => {
  res.render('pages/home', { locations: mapped });
});
// TODO: Include API Routes(Refer to Lab 7)
app.get('/load', async (req, res) => {
  try {
    const locations = await db.any(`
      SELECT
        l.id,
        l.name,
        l.address,
        ROUND(AVG(r.rating)::numeric, 1) AS rating,
        COUNT(DISTINCT r.id) AS "reviewCount",
        ARRAY_AGG(DISTINCT at.name) FILTER (WHERE at.name IS NOT NULL) AS amenities
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
      image: 'https://placehold.co/400x200',
      distance: '—',
      isOpen: true,
      hours: null,
    }));

    res.render('pages/home', { locations: mapped });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading locations');
  }
});
// *****************************************************
// <-- 5: Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
app.listen(3000);
console.log('Server is listening on port 3000');