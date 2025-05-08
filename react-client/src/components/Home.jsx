import React, { useState } from "react";
import PopularListingsHorizontal from "./PopularListingsHorizontal";
import { useAuth } from "../contexts/authContext";

function Home() {
    return(
        <div>
            <h1>Hi</h1>
            <PopularListingsHorizontal type="books"/>
            <PopularListingsHorizontal type="movies"/>
            <PopularListingsHorizontal type="shows"/>
        </div>
    )
}

export default Home