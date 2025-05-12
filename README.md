# Nerdipedia
    Neripedia Project for Web Programming II, CS 552, Spring 2025
    Created by Mark Abelo, Michael Moonan, Kendell Muldrow, Kush Parmar

# Set Up
    For data-server:

    1. install npm packages
        $ cd ./data-server/
        $ npm i

        (note: some packages give a high vulnerability warning, but when we asked the TA's on slack, they said we wouldn't be penalized for this)
    
    2. start redis server
        $ sudo service redis-server start

        the redis server is expected on the default port 'localhost:6379'

    3. seed the database
        $ npm run seed

    4. start data server
        $ npm run start
    
    For react-client

    1. install npm packages
        $ cd ./react-client/
        $ npm i


# To Run
    Once data server is running and packages are installed, navigate to react-client directory and run

    $ npm run start
    or
    $ npm run dev


