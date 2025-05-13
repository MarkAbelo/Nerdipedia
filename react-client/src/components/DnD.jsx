import React from "react";
import RecentPosts from "./RecentPosts";
import PopularPosts from "./PopularPosts";
import SearchPosts from "./SearchPosts";

function DnD() {

    return(
        <div>
            <h1>Dungeons & Dragons Posts</h1>
            <RecentPosts type='dnd'/>
            <PopularPosts type='dnd'/>
            <SearchPosts title='Search D&D Posts' type='dnd'/>
        </div>
    )
}

export default DnD