import React, { useState } from "react";
import PopularListingsHorizontal from "./PopularListingsHorizontal";
import { useAuth } from "../contexts/authContext";

function Home() {

    const { currentUser } = useAuth()

    const getUsername = () => {
        if (!currentUser) return "Guest";
        if (currentUser.displayName) return currentUser.email;
    }

    return(
        <div>
            <h1>Hi {getUsername()}!</h1>
            <PopularListingsHorizontal type="books"/>
            <PopularListingsHorizontal type="movies"/>
            <PopularListingsHorizontal type="shows"/>
        </div>
    )
}

export default Home