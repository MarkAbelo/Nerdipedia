import React from "react";
import RecentPosts from "./RecentPosts";
import PopularPosts from "./PopularPosts";
import PopularShows from "./PopularShows";
import RecommendedShows from "./RecommendedShows";
import { useAuth } from "../contexts/authContext";

function Shows() {

    const { currentUser } = useAuth()

    let recommendations = null;
    if (currentUser) {
        recommendations = <RecommendedShows/>
    }

    return(
        <div>
            <h1>Shows and Show Posts</h1>
            <RecentPosts type='show'/>
            <PopularPosts type='show'/>
            <PopularShows/>
            {recommendations}
        </div>
    )
}

export default Shows