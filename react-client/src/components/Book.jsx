import {React, useState, useEffect, } from "react";
import Reviews from "./Reviews";
import {useAuth} from "../contexts/authContext";
import {Link, useParams} from "react-router-dom";
import bookService from "../services/bookService";
import No_image from "../assets/no_image.png";
import reviewService from "../services/reviewService";

function Book(){
    const { id } = useParams();
    const [book,setBook] =useState(null);
    const [loading,setLoading] = useState(true);
    const [error,setError] = useState(null);
    const { userLoggedIn, mongoUser, currentUser } = useAuth();

    //the motherload of review States
    const [reviews, setReviews] = useState([]);
    const [userReview, setUserReview] = useState(null);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [formData, setFormData] = useState({
        body: '',
        rating: 5,
        section: 'book' // Assuming reviews are for books
    });
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

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const bookData = await bookService.getBook(id);
                setBook(bookData);
                const reviews = bookData.bookReview === 'There are no reviews' ? 
                    [] : bookData.bookReview;
                setReviews(reviews);
                const existingReview = reviews.find(review => 
                    review.posterID === currentUser.displayName
                );
                setUserReview(existingReview || null);
                setLoading(false);
            } catch (e) {
                setLoading(false);
                setError(e);
            }
        };
        fetchBook();
    }, [id,mongoUser?._id]);
    
    const handleFormChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }
    const handleEditReview = () => {
        setShowReviewForm(true);
        // Pre-populate form with existing review data
        setFormData({
          body: userReview.body,
          rating: userReview.rating,
        });
      };
    //console.log(mongoUser)
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const reviewData = {
                ...formData,
                posterID: currentUser.displayName,
                forID: id 
            };

            if (userReview) {
                //Updates the existing review
                await reviewService.updateReview(userReview._id, reviewData);
            } else {
                //This should create a new review
                await reviewService.createReview(reviewData);
            }
            // Refresh data
            const updatedBook = await bookService.getBook(id);
            const updatedReviews = updatedBook.bookReview === 'There are no reviews' ? 
                [] : updatedBook.bookReview;
            
            setReviews(updatedReviews);
            setUserReview(updatedReviews.find(r => r.posterID === mongoUser._id));
            setShowReviewForm(false);
            setFormData({ body: '', rating: 5, section: 'book' });
            
        } catch (error) {
            console.error("Review submission failed:", error);
            setError(error);
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
                const updatedBook = await bookService.getBook(id);
                const updatedReviews = updatedBook.bookReview === 'There are no reviews' ? 
                    [] : updatedBook.bookReview;
                
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
                            <option className= "text-black" key={num} value={num}>{num}</option>
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
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        {userReview ? "Update Review" : "Submit Review"}
                    </button>
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );

    if(loading){
        return <div className="p-4 text-gray-500">Loading...</div>;
    }
    if(error){
        return <div className="p-4 text-red-500">Error: {error.message}</div>;
    }
    console.log(mongoUser)
    return (
        <div className="book-page p-4">
            {/*put page stuff here*/}
            <div className="reviews-section mt-8">
                <div className="flex justify-between items-center mb-4">
                    {!userReview && userLoggedIn && (
                        <button
                            onClick={() => setShowReviewForm(true)}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
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
                            <p className="text-white-700 leading-relaxed border-t border-amber-100 pt-3">
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
                  <h2 className="text-3xl font-bold mb-4">All Review</h2>
                    <Reviews reviews={reviews} />
                </div>
            </div>
        </div>
    );
}

export default Book;


