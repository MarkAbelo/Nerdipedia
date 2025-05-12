import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import postService from "../services/postService";

function Post() {
    const { id } = useParams();
    const navigate = useNavigate();

    return(
        <div>
            <h1>Hi</h1>
            <PopularListingsHorizontal type="books"/>
            <PopularListingsHorizontal type="movies"/>
            <PopularListingsHorizontal type="shows"/>
        </div>
    )
}

export default Post