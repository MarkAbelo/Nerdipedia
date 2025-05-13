import React from "react";
import RecentPosts from "./RecentPosts";
import PopularPosts from "./PopularPosts";
import SearchPosts from "./SearchPosts";
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
            <SearchPosts title='Search Show Posts' type='show'/>
            <PopularShows/>
            {recommendations}
        </div>
    )
}

export default Shows