import React from "react";
import RecentPosts from "./RecentPosts";
import PopularPosts from "./PopularPosts";
import PopularBooks from "./PopularBooks";
import PopularMovies from "./PopularMovies";
import PopularShows from "./PopularShows";
import { useAuth } from "../contexts/authContext";

function Home() {

    const { currentUser, mongoUser } = useAuth()

    const getUsername = () => {
        if (!currentUser) return "Guest";
        if (mongoUser) return mongoUser.username;
    }

    return(
        <div>
            <h1>Hello, {getUsername()}!</h1>
            <RecentPosts/>
            <PopularPosts/>
            <PopularBooks/>
            <PopularMovies/>
            <PopularShows/>
        </div>
    )
}

export default Home