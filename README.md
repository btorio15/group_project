<h1 align="center">
  <a href="https://github.com/btorio15/group_project">
    <!-- Please provide path to your logo here -->
    <img src="ProjectSourceCode/src/resources/img/logo.png" alt="Logo" width="500" height="500">
  </a>
</h1>


## Amenity Finder

<details open="open">
<summary>Table of Contents</summary>

- [Application Description](#Application-Description)
- [Contributors](#Contributors)
- [Technology Stack](#Technology-Stack)
- [Prerequisites](#prerequisites)
- [Instructions](#instructions)
- [Tests](#tests)
- [Deployed Application](#Deployed-Application)

</details>

---

## Application Description

The application shows a map with pins on locations with amenities in Boulder, CO. Users are prompted to log in or register upon accessing the application, and then they are able to see the map with default amenity locations added to it by the developers and locations added by other users. Beyond that, any user can submit a location of their own to appear on the site, with information about the type of amenity, location, and image. Users can update the information listed on locations that others have posted or that comes default when initializing the application.
The map is be pulled from Google Maps API to load the map of Boulder and the pins are placed over the map for users to see.


## Contributors

Developed by Lucas Velyvis, Benjamin Torio, Wylie Knapek, and John Bass.

## Technology Stack

Postgres and PostGIS were used to store data and geographical data. The database was originally made in SQL and initialized upon docker creation. Now, the database is done by Supabase via remote hosting, to ensure data is preserved when the application is closed/opened. The UI was created with Handlebars and CSS, utilizing pages and partials to create a constistently styled interface. Javascript was used to connect to the db, configure application settings, implement API routes, start the server, and run automated tests. Google Maps external API was used to render the map and location pins for the user to see. NodeJS and ExpressJS were used as a javascript runtime environment and web application framework. Docker is used for containerization and defining services. Mocha and Chai are used to run backend tests and validate outcomes.

## Prerequisites

To run the application locally, the user must download docker have access to the Google Maps API key from a developer.

To run the application on the deployed version, no prerequisites are needed.

## Instructions

To run the application locally, download docker, create a .env file, copy everything from .example.env into it, and paste the Google Maps API key into the .env file given to the user by a developer. Then run docker compose up --build in the ProjectSourceCode directory and the application will be accessible at http://localhost:3000.

To run the application on the deployed version, access it at https://group-project-l9op.onrender.com/home.

## Tests

To run the user acceptance tests, do the following:

UAT 1:

- 

UAT 2:

- 

UAT 3:

- 

## Deployed Application

Here is the link to access the deployed application: https://group-project-l9op.onrender.com/home.
