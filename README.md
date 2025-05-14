# Nerdipedia
    Neripedia Project for Web Programming II, CS 552, Spring 2025
    Created by Mark Abelo, Michael Moonan, Kendell Muldrow, Kush Parmar

# To Run
    For Docker:

    1. Build image (run in root)
        $ docker-compose build --no-cache

    2. Seed the database
        $ docker-compose run --rm backend node ./tasks/seed.js

    3. Run the container
        $ docker-compose up

    Now the application is online! Visit http://localhost:5173 to view the app!

    (Make sure your browser is on Dark Mode for the best experience! Happy browsing!)

# Tech Stack
    Course Technologies:
	    React: to make the app a single-page, component based application.
	    Redis: for data caching and quick loading of pages and frequently accessed content.
	    Tailwind: for front-end styling and consistent visual themes throughout the app.
	    Firebase Auth: for user authentication.
    Non-course Technologies:
        @maruware/raccoon: for media recommendations. This npm package utilizes redis to maintain data on users, then use that data to predict what to recommend a user based on what similar users have liked or added to their favorites.
        Google Cloud Storage: for image uploading and storage. This independent technology allows users to upload images for their profile and posts to an external google-cloud server, which can then be accessed by other users.
        Docker: for project deployment.

