import React from "react";
import RecentPosts from "./RecentPosts";
import PopularPosts from "./PopularPosts";
import SearchPosts from "./SearchPosts";
import PopularBooks from "./PopularBooks";
import RecommendedBooks from "./RecommendedBooks";
import SearchBooks from "./SearchBooks";

import { useAuth } from "../contexts/authContext";

function Books() {

    const { currentUser } = useAuth();

    let recommendations = null;
    if (currentUser) {
        recommendations = <RecommendedBooks/>
    }

    return(
        <div>
            <h1>Books and Book Posts</h1>
            <RecentPosts type='book'/>
            <PopularPosts type='book'/>
            <SearchPosts title='Search Book Posts' type='book'/>
            <PopularBooks/>
            {recommendations}
            <SearchBooks/>
        </div>
    )
}

export default Books