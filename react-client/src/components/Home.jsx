import React, { useState } from "react";
import PopularListingsHorizontal from "./PopularListingsHorizontal";
import { useAuth } from "../contexts/authContext";

function Home() {

    const { currentUser, mongoUser } = useAuth()

    const getUsername = () => {
        if (!currentUser) return "Guest";
        if (mongoUser) return mongoUser.username;
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