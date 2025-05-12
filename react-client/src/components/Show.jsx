import {React, useState, useEffect} from "react";
import {useAuth} from "../contexts/authContext";
import { useParams } from "react-router-dom";
import showService from "../services/showService";
import No_image from "../assets/no_image.png";

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
                const show = await showService.getShow(id)
                setShow(show);
                setReviews(show.showReview)
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

            {reviews.length === 0 ? (
                <p className="text-gray-600">No reviews found</p>
            ) : (
                <ul className="space-y-4">
                    {reviews.map((review) => (
                        <li key={review._id} className="bg-gray-100 rounded-md">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-800">{review.username || "Anon"}</span>
                                <span className="text-sm text-yellow-600 font-semibold">{review.rating}/10</span>
                            </div>
                            <p className="text-gray-700">{review.body}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )


}

export default Show