import {React, useState, useEffect, } from "react";
import Reviews from "./Reviews";
import {useAuth} from "../contexts/authContext";
import {useParams} from "react-router-dom";
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
                if(currentUser===null){
                    setUserReview(null);
                }
                else{
                    const existingReview = reviews.find(review => 
                        review.posterID === currentUser.displayName
                    );
                    setUserReview(existingReview || null);
                }
                setLoading(false);
            } catch (e) {
                setLoading(false);
                setError(e);
            }
        };
        fetchBook();
    }, [id]);
    
    const handleFormChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }
    const handleEditReview = () => {
        setShowReviewForm(true);
        // Set fields to orginal entry
        setFormData({
          body: userReview.body,
          rating: userReview.rating,
        });
      };

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
            setUserReview(updatedReviews.find(r => r.posterID === currentUser.displayName));
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

    const averageRating = (reviews) => {
        if (typeof(reviews) == 'object') {
            let x = 0
            let tot = 0
            reviews.map((review) => {
                x += review.rating
                tot += 1
            })
            const y = x / tot
            return y.toFixed(1)
        } else {
            return 0
        }
        
    }

    if(loading){
        return <div className="p-4 text-gray-500">Loading...</div>;
    }
    if(error){
        return <div className="p-4 text-red-500">Error: {error.message}</div>;
    }
    return (
        <div className="book-page p-4">
             {book && (
                <div className="book-details">
                    {/*Title & Author*/}
                    <h1 className="text-4xl font-bold mb-2">{book.title}</h1>
                    <p className="text-xl text-gray-400 mb-6">
                        by {book.authors?.join(', ') || 'Unknown Author'}
                    </p>

                    {/*Cover Gallery*/}
                    {book.covers?.length > 0 && (
                        <div className="flex justify-center mb-8">
                            <img 
                                src={book.covers[0].includes('-1-M.jpg') ? No_image : book.covers[0]}
                                alt="Main Cover"
                                className="max-w-xs max-h-128 object-contain bg-gray-900 rounded-lg p-2"
                                onError={(e) => e.target.src = No_image}
                            />
                        </div>
                    )}

                    {/*ratings*/}
                    <div className="flex justify-end">
                        {typeof(book.bookReview) == 'object' ? (
                            <p className="mt-4 text-m text-gray-400 font-bold">
                                Nerdipedia Rating: ⭐{averageRating(book.bookReview)} / 10  &nbsp; ({book.bookReview.length} votes)
                            </p>
                        ) : 
                            <p className="mt-4 text-m text-red-400">
                                No Nerdipedia Ratings: Be the first to review this book!
                            </p>
                        }
                    </div>

                    {/*Description*/}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-amber-700 dark:text-amber-400">Description</h2>
                        <p className="dark:text-gray-300 whitespace-pre-line leading-relaxed">
                        {typeof book.description === 'object' ? book.description.value : book.description}
                        </p>
                    </div>

                    {/*The Metadata Grid*/}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/*Subjects*/}
                        <div>
                            <h3 className="text-xl font-semibold mb-3 text-blue-400">Subjects</h3>
                            <div className="flex flex-wrap gap-2">
                                {book.subjects?.slice(0, Math.max((book.subjects.length/4),10)).map((subject, index) => (
                                    <span 
                                        key={index}
                                        className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm"
                                    >
                                        {subject}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/*Characters*/}
                        <div>
                            <h3 className="text-xl font-semibold mb-3 text-green-400">Key People</h3>
                            <ul className="space-y-1">
                                {book.subject_people?.slice(0, 5).map((person, index) => (
                                    <li key={index} className="text-gray-400">• {person}</li>
                                ))}
                            </ul>
                        </div>

                        {/*Locations*/}
                        <div>
                            <h3 className="text-xl font-semibold mb-3 text-purple-400">Locations</h3>
                            <ul className="space-y-1">
                                {book.subject_places?.map((place, index) => (
                                    <li key={index} className="text-gray-400">• {place}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/*External Links*/}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold mb-4 text-amber-700 dark:text-amber-400">Related Links</h2>
                        <div className="space-y-2">
                            {book.links?.map((link, index) => (
                                <a
                                    key={index}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block py-2 px-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-blue-400 hover:text-blue-300"
                                >
                                    ➤ {link.title}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/*Gallery*/}
                    {book.covers?.length > 0 && (
                        <div className="expandable-gallery mb-8">
                            <h2 className="text-2xl font-bold mb-4 text-amber-700 dark:text-amber-400">Gallery</h2>
                            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {book.covers.map((cover, index) => (
                                    <div 
                                        key={index}
                                        onClick={() => setExpandedImageIndex(index)}
                                    >
                                        <img
                                            src={cover.includes('-1-M.jpg') ? No_image : cover}
                                            alt={`Cover ${index + 1}`}
                                            className="w-full h-24 object-cover rounded-lg"
                                            onError={(e) => e.target.src = No_image}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
            {/*--------------------------------- Review Stuff-------------------------------*/}
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
                            <div className="flex justify-end gap-2 mt-2">
                                <button
                                    onClick={handleEditReview}
                                    className="text-blue-300 hover:text-blue-400 text-sm font-medium"
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
                    </div>
                )}
                <div className="mb-8">
                    <br/>
                  <h2 className="text-3xl font-bold mb-4">All Review</h2>
                    <Reviews reviews={reviews} />
                </div>
            </div>
        </div>
    );
}

export default Book;


