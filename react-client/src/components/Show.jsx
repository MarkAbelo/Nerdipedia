import {React, useState, useEffect} from "react";
import {useAuth} from "../contexts/authContext";
import { useParams } from "react-router-dom";
import showService from "../services/showService";
import No_image from "../assets/no_image.png";
import reviewService from "../services/reviewService";
import Reviews from "./Reviews";

function Show() {
    const { id } = useParams();
    const [show, setShow] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(null)

    const { userLoggedIn, mongoUser, currentUser } = useAuth();
    const [userReview, setUserReview] = useState(null)
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [formData, setFormData] = useState({
        body: '',
        rating: 5,
        section: 'show'
    })

    const formatUTCDate = (timestamp) => {
        const utcDate = new Date(timestamp);
        return utcDate.toLocaleString('en-GB', {
          timeZone: 'UTC',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZoneName: 'short'
        }).replace(',', '');
      };

    function stripTags(taggedHTML) {
        return taggedHTML.replace(/<[^>]+>/g, '');
    }

    useEffect(() => {
        const fetchShow = async () => {
            try {
                const show = await showService.getShow(id)
                setShow(show);
                console.log(show)
                const reviews = show.showReview === 'There are no reviews' ?
                    [] : show.showReview
                setReviews(reviews);
                const existingReview = reviews.find(review => 
                    review.posterID === currentUser.displayName
                );
                setUserReview(existingReview || null)
                setLoading(false)
            } catch(e) {
                setLoading(false)
                setError(e)
            }
        };

        fetchShow();
    }, [id]);

    const handleFormChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]:e.target.value
        });
    }

    const handleEditReview = () => {
        setShowReviewForm(true)
        //pre-populate
        setFormData({
            body: userReview.body,
            rating: userReview.rating
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            const reviewData = {
                ...formData,
                posterID: currentUser.displayName,
                forID: id
            };

            if (userReview) {
                //updates existing review
                await reviewService.updateReview(userReview._id, reviewData);
            } else {
                //should create new review
                await reviewService.createReview(reviewData);
            }
            //refresh data
            const updatedShow = await showService.getShow(id);
            const updatedReviews = updatedShow.showReview === 'There are no reviews' ?
                [] : updatedShow.showReview;

            setReviews(updatedReviews);
            setUserReview(updatedReviews.find(r => r.posterID === mongoUser._id));
            setShowReviewForm(false);
            setFormData({ body: '', rating: 5, section: 'show' });

        } catch(e) {
            console.error("Review submission failed: ", e);
            setError(e);
        }
    };

    const handleCancel = () => {
        setShowReviewForm(false);
        setFormData({ body: '', rating: 5, section: 'book' });
    };

    const handleDeleteReview = async () => {
        if (window.confirm("Are you sure you want to delete this review?")) {
            try {
                await reviewService.deleteReview(userReview._id);
                const updatedShow = await showService.getShow(id);
                const updatedReviews = updatedShow.showReview === 'There are no reviews' ? 
                    [] : updatedShow.showReview;
                
                setReviews(updatedReviews);
                setUserReview(null);
            } catch (error) {
                console.error("Delete review failed:", error);
                setError(error);
            }
        }
    };

    const renderReviewForm = () => (
        <div className="review-form mt-4 p-4 border rounded">
            <h3 className="text-lg font-semibold mb-2">
                {userReview ? "Edit Your Review" : "Write a Review"}
            </h3>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="block mb-1">Rating</label>
                    <select
                        name="rating"
                        value={formData.rating}
                        onChange={handleFormChange}
                        className="border p-2 rounded w-full"
                        required
                    >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                            <option className= "bg-gray-800 text-white hover:bg-blue-600 hover:text-white transition-colors" key={num} value={num}>{num}</option>
                        ))}
                    </select>
                </div>
                <div className="mb-3">
                    <label className="block mb-1">Review</label>
                    <textarea
                        name="body"
                        value={formData.body}
                        onChange={handleFormChange}
                        className="border p-2 rounded w-full"
                        rows="4"
                        required
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        type="submit"
                        className="bg-blue-500 text-blue-600 px-4 py-2 rounded hover:bg-blue-600"
                    >
                        {userReview ? "Update Review" : "Submit Review"}
                    </button>
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="bg-gray-500 text-blue-600 px-4 py-2 rounded hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )

    if(loading) {
        return <div className="p-4 text-gray-500">Loading...</div>
    }

    if(error){
        return <div className="p-4 text-red-500">Error: {error.message}</div>;
    }

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
                    <br />
                    <p className="text-sm text-gray-700">Language: {show.language}</p>
                    <p className="text-sm text-gray-700">Status: {show.ended ? `Ended ${show.ended}` : "Ongoing"}</p>
                    {show.genres && show.genres.length > 0 && (
                        <p className="text-sm text-gray-600">
                            Genres: {show.genres.join(", ")}
                        </p>
                    )}
                </div>
            </div>
            {/*Changing review section to match */}
            <div className="reviews-section mt-8">
                <div className="flex justify-between items-center mb-4">
                    {!userReview && userLoggedIn && (
                        <button
                            onClick={() => setShowReviewForm(true)}
                            className="bg-green-500 text-blue-600 px-4 py-2 rounded hover:bg-green-600"
                        >
                            Write a Review
                        </button>
                    )}
                </div>

                {showReviewForm && renderReviewForm()}

                {userReview && (
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold mb-4">My Review</h2>
                        <div className="user-review mb-6 p-4 bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                            <div className="flex flex-col mb-2">
                                <div className="flex justify-between items-start w-full">
                                    <div className="flex items-start gap-3">
                                        <img
                                            src={mongoUser?.profilePic || '/default-avatar.png'}
                                            alt={currentUser.displayName}
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                        <div className="text-left">
                                            <p className="font-semibold text-blue-300">{mongoUser.username}</p>
                                            <p className="text-xs text-blue-400 font-mono">
                                                {formatUTCDate(userReview.timeStamp)}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`text-sm font-medium px-2.5 py-1 rounded-full ${
                                        Number(userReview.rating) <= 5 
                                            ? 'bg-gray-300 text-gray-800' 
                                            : 'bg-amber-100 text-amber-800'
                                    }`}>
                                        ⭐ {userReview.rating}/10
                                    </span>
                                </div>
                            </div>
                            <p className="text-white leading-relaxed border-t border-amber-100 pt-3">
                                {userReview.body}
                            </p>
                            <button
                                onClick={handleEditReview}
                                className="text-blue-300 mt-2 hover:text-blue-400 text-sm font-medium"
                            >
                                Edit Review
                            </button>
                                <button
                                    onClick={handleDeleteReview}
                                    className="text-red-300 hover:text-red-400 text-sm font-medium px-3 py-1 border border-red-300 rounded"
                                >
                                    Delete Review
                                </button>
                        </div>
                    </div>
                )}
                <div className="mb-8">
                    <br/>
                  <h2 className="text-3xl font-bold mb-4">All Review</h2>
                    <Reviews reviews={reviews} />
                </div>
            </div>
        </div>
    )


}

export default Show