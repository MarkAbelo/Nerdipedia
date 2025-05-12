import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import postService from "../services/postService";

function Post() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [ loading, setLoading ] = useState(true);
    const [ postData, setPostData ] = useState(undefined);

    useEffect(() => {
        async function fetchData() {
            await postService.getPost(id);
        }
        fetchData();
    }, [id]);

    return(
        <div>
            <h1>Hi</h1>
        </div>
    )
}

export default Post