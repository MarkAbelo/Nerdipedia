import React from "react";
import RecentPosts from "./RecentPosts";
import PopularPosts from "./PopularPosts";
import SearchPosts from "./SearchPosts";
import PopularMovies from "./PopularMovies";
import RecommendedMovies from "./RecommendedMovies";
import { useAuth } from "../contexts/authContext";

function Movies() {

    const { currentUser } = useAuth()

    let recommendations = null;
    if (currentUser) {
        recommendations = <RecommendedMovies/>
    }

    return(
        <div>
            <h1>Movies and Movie Posts</h1>
            <RecentPosts type='movie'/>
            <PopularPosts type='movie'/>
            <SearchPosts title='Search Movie Posts' type='movie'/>
            <PopularMovies/>
            {recommendations}
        </div>
    )
}

export default Movies