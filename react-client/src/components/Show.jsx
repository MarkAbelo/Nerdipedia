import {React, useState, useEffect} from "react";
import {useAuth} from "../contexts/authContext";
import { useParams } from "react-router-dom";
import showService from "../services/bookService";
import No_image from "../assets/no_image.png";
import axios from "axios";

function Show() {
    const { id } = useParams();
    const [show, setShow] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [error, setError] = useState("");

    function stripTags(taggedHTML) {
        return taggedHTML.replace(/<[^>]+>/g, '');
    }

    useEffect(() => {
        const fetchShow = async () => {
            try {
                const show = await axios.get(`http://localhost:3000/shows/getShow/${id}`);
                setShow(show.data);
                setReviews(show.reviews)
                console.log(show.data)
            } catch(e) {
                setError("Failed to load show or reviews.");
                console.log(e);
            }
        };

        fetchShow();
    }, [id]);

    if (error) return <p className="errorText">{error}</p>
    if (!show) return <p>Loading show...</p>

    return (
        <div>
            <h1>{show.name}</h1>

            {show.image && (
                <img src={show.image.medium}/>
            )}

            <p>{stripTags(show.summary)}</p>

            {!reviews && (
                <p>No reviews found</p>
            )}
        </div>
    )



}

export default Show