import React from "react";
import RecentPosts from "./RecentPosts";
import PopularPosts from "./PopularPosts";

function DnD() {

    return(
        <div>
            <h1>Dungeons & Dragons Posts</h1>
            <RecentPosts type='dnd'/>
            <PopularPosts type='dnd'/>
        </div>
    )
}

export default DnD