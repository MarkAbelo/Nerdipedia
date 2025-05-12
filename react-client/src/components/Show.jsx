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

    if (error) return <p className="text-red-500 text-center mt-8">{error}</p>
    if (!show) return <p className="text-center mt-8">Loading show...</p>

    return (
        <div className="max-w-5x1 mx-auto p-4">
            {/* Poster and Title */}
            <div className="flex flex-col items-center md:flex-row md:items-start gap-6 mb-10">
                <img
                    src={show.image?.medium || No_image}
                    alt={show.name}
                    className="rounded-lg shadow-md max-w-sm md:max-w-xs object-cover"
                />
                <div className="flex-1">
                    <h1 className="text-3x1 font-bold mb-3">{show.name}</h1>
                    <p className="text-gray-700">{stripTags(show.summary)}</p>
                </div>
            </div>

            {/*Reviews if they exist */}
            <h2 className="text-2x1 font-semibold mb-4">Reviews</h2>

            {!reviews && (
                <p className="text-gray-600">No reviews found</p>
            )}
        </div>
    )



}

export default Show