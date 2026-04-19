<h1 align="center">
  <a href="https://github.com/GITHUB_USERNAME/REPO_SLUG">
    <!-- Please provide path to your logo here -->
    <img src="ProjectSourceCode/src/resources/img/logo.png" alt="Logo" width="500" height="500">
  </a>
</h1>


## Amenity Finder

<details open="open">
<summary>Table of Contents</summary>

- [Application Description](#ApplicationDescription)
- [Contributors](#Contributors)
- [Technology Stack](#TechnologyStack)
- [Prerequisites](#prerequisites)
- [Instructions](#instructions)
- [Tests](#tests)
- [Deployed Application](#DeployedApplication)

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

See the [open issues](https://github.com/GITHUB_USERNAME/REPO_SLUG/issues) for a list of proposed features (and known issues).

- [Top Feature Requests](https://github.com/GITHUB_USERNAME/REPO_SLUG/issues?q=label%3Aenhancement+is%3Aopen+sort%3Areactions-%2B1-desc) (Add your votes using the 👍 reaction)
- [Top Bugs](https://github.com/GITHUB_USERNAME/REPO_SLUG/issues?q=is%3Aissue+is%3Aopen+label%3Abug+sort%3Areactions-%2B1-desc) (Add your votes using the 👍 reaction)
- [Newest Bugs](https://github.com/GITHUB_USERNAME/REPO_SLUG/issues?q=is%3Aopen+is%3Aissue+label%3Abug)

## Support

> **[?]**
> Provide additional ways to contact the project maintainer/maintainers.

Reach out to the maintainer at one of the following places:

- [GitHub issues](https://github.com/GITHUB_USERNAME/REPO_SLUG/issues/new?assignees=&labels=question&template=04_SUPPORT_QUESTION.md&title=support%3A+)
- Contact options listed on [this GitHub profile](https://github.com/GITHUB_USERNAME)

## Project assistance

If you want to say **thank you** or/and support active development of PROJECT_NAME:

- Add a [GitHub Star](https://github.com/GITHUB_USERNAME/REPO_SLUG) to the project.
- Tweet about the PROJECT_NAME.
- Write interesting articles about the project on [Dev.to](https://dev.to/), [Medium](https://medium.com/) or your personal blog.

Together, we can make PROJECT_NAME **better**!

## Contributing

First off, thanks for taking the time to contribute! Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make will benefit everybody else and are **greatly appreciated**.


Please read [our contribution guidelines](docs/CONTRIBUTING.md), and thank you for being involved!

## Authors & contributors

The original setup of this repository is by [FULL_NAME](https://github.com/GITHUB_USERNAME).

For a full list of all authors and contributors, see [the contributors page](https://github.com/GITHUB_USERNAME/REPO_SLUG/contributors).

## Security

PROJECT_NAME follows good practices of security, but 100% security cannot be assured.
PROJECT_NAME is provided **"as is"** without any **warranty**. Use at your own risk.

_For more information and to report security issues, please refer to our [security documentation](docs/SECURITY.md)._

## License

This project is licensed under the **MIT license**.

See [LICENSE](LICENSE) for more information.

## Acknowledgements

> **[?]**
> If your work was funded by any organization or institution, acknowledge their support here.
> In addition, if your work relies on other software libraries, or was inspired by looking at other work, it is appropriate to acknowledge this intellectual debt too.
