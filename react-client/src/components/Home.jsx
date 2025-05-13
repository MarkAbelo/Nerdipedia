import React from "react";
import RecentPosts from "./RecentPosts";
import PopularPosts from "./PopularPosts";
import PopularBooks from "./PopularBooks";
import PopularMovies from "./PopularMovies";
import PopularShows from "./PopularShows";
import RecommendedBooks from "./RecommendedBooks";
import RecommendedMovies from "./RecommendedMovies";
import RecommendedShows from "./RecommendedShows";
import { useAuth } from "../contexts/authContext";

function Home() {

    const { currentUser, mongoUser } = useAuth()

    const getUsername = () => {
        if (!currentUser) return "Guest";
        if (mongoUser) return mongoUser.username;
    }

    let recommendations = null;
    if (currentUser) {
        recommendations = (
        <>
            <RecommendedBooks/>
            <RecommendedMovies/>
            <RecommendedShows/>
        </>
        );
    }

    return(
        <div>
            <h1>Hello, {getUsername()}!</h1>
            <RecentPosts/>
            <PopularPosts/>
            <PopularBooks/>
            <PopularMovies/>
            <PopularShows/>
            {recommendations}
        </div>
    )
}

export default Home