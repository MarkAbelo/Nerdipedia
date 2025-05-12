import {React, useState, useEffect} from "react";
import {useAuth} from "../contexts/authContext";
import { useParams } from "react-router-dom";
import showService from "../services/showService";
import No_image from "../assets/no_image.png";
import reviewService from "../services/reviewService";

function Show() {
    const { id } = useParams();
    const [show, setShow] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [error, setError] = useState("");

    const { userLoggedIn, mongoUser } = useAuth();
    const [newReview, setNewReview] = useState({ rating: '', body: ''})
    const [reviewError, setReviewError] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    function stripTags(taggedHTML) {
        return taggedHTML.replace(/<[^>]+>/g, '');
    }

    const handleReviewChange = (e) => {
        const {name, value} = e.target;
        setNewReview((prev) => ({ ...prev, [name]: value }));
        setReviewError('');
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();

        const rating = parseInt(newReview.rating);
        if(!newReview.body.trim()) {
            setReviewError('Review body cannot be empty');
            return;
        }
        if (isNaN(rating) || rating < 1 || rating > 10) {
            setReviewError('Rating must be between 1 and 10.');
            return
        }

        const reviewObject = {
            posterID: mongoUser._id,
            body: newReview.body.trim(),
            rating,
            section: 'show',
            forID: id
        };

        setSubmittingReview(true);
        try {
            //service still needs to be completed 
            const review = await reviewService.createReview(reviewObject);
            setReviews((prev) => [...prev, { ...review, username: mongoUser.username }]);
            setNewReview({ rating: '', body: '' });
        } catch(e) {
            setReviewError('Failed to submit review.');
            console.log(e);
        } finally {
            setSubmittingReview(false);
        }
    }

    useEffect(() => {
        const fetchShow = async () => {
            try {
                const show = await showService.getShow(id)
                setShow(show);
                setReviews(show.showReview)
                console.log(show)
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

            {reviews === 'There are no reviews' ? (
                <p className="text-gray-600">No reviews found</p>
            ) : (
                <ul className="space-y-4">
                    {reviews.map((review) => (
                        <li key={review._id} className="bg-gray-100 rounded-md shadow">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-800">{review.username || "Anon"}</span>
                                <span className="text-sm text-yellow-600 font-semibold">{review.rating}/10</span>
                            </div>
                            <p className="text-gray-700">{review.body}</p>
                        </li>
                    ))}
                </ul>
            )}

            {/*Leave a review */}
            {userLoggedIn && mongoUser && (
                <form onSubmit={handleReviewSubmit} className="mt-8 bg-white p-4 rounded shadow space-y-4">
                    <h3 className="text-lg font-semibold">Leave a Review</h3>

                    <div>
                        <label className="mb-1 font-medium">Rating (1-10):</label>
                        <input type="number" name="rating" value={newReview.rating} onChange={handleReviewChange} min="1" max="10" className="w-full border border-gray-300 rounded px-2 py-1"/>
                    </div>

                    <div>
                        <label className="mb-1 font-medium">Review:</label>
                        <textarea name="body" value={newReview.body} onChange={handleReviewChange} rows="4" className="w-full border border-gray-300 rounded px-2 py-1"></textarea>
                    </div>

                    <button type="submit" disabled={submittingReview} className="px-4 py-2 rounded disabled:opacity-50">
                        {submittingReview ? "Submitting..." : "Submit Review"}
                    </button>
                </form>
            )}
        </div>
    )


}

export default Show