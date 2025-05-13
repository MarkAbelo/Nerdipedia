import React, {useState, useEffect} from "react";
import {useAuth} from "../contexts/authContext";
import {Link, useNavigate, useParams } from "react-router-dom";
import movieService from "../services/movieService";
import No_image from "../assets/no_image.png";
import reviewService from "../services/reviewService";
import Reviews from "./Reviews";

export default function Movie() {

    const navigate = useNavigate();
    const { id } = useParams();

    const {userLoggedIn, mongoUser, currentUser } = useAuth(); 

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [movie, setMovie] = useState(null)

    const [reviews, setReviews] = useState([]);
    const [userReview, setUserReview] = useState(null);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [formData, setFormData] = useState({
        body: '',
        rating: 5,
        section: 'movie' // Assuming reviews are for movies
    });

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true)
                const movieResponse = await movieService.getMovie(id);
                const reviews = movieResponse.movieReview === 'There are no reviews' ? 
                    [] : movieResponse.movieReview;
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
                setMovie(movieResponse)
                setError(null)
            } catch (e) {
                setError(e)
                setMovie(null)
            } finally {
                setLoading(false)
            }
        }
        fetchData();
    }, [id])

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
            const updatedMovie = await movieService.getMovie(id);
            const updatedReviews = updatedMovie.movieReview === 'There are no reviews' ? 
                [] : updatedMovie.movieReview;
            
            setReviews(updatedReviews);
            setUserReview(updatedReviews.find(r => r.posterID === currentUser.displayName));
            setShowReviewForm(false);
            setFormData({ body: '', rating: 5, section: 'movie' });
            
        } catch (error) {
            console.error("Review submission failed:", error);
            setError(error);
        }
    };
    const handleCancel = () => {
        setShowReviewForm(false);
        setFormData({ body: '', rating: 5, section: 'movie' });
    };

    const handleDeleteReview = async () => {
        if (window.confirm("Are you sure you want to delete this review?")) {
            try {
                await reviewService.deleteReview(userReview._id);
                const updatedMovie = await movieService.getMovie(id);
                const updatedReviews = updatedMovie.movieReview === 'There are no reviews' ? 
                    [] : updatedMovie.movieReview;
                
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

    if (loading) {
        return (
            <div>Loading...</div>
        )
    }

    if (error) {
        return (
            <div>{error.message}</div>
        )
    }

    const averageRating = (reviews) => {
        if (typeof(reviews) == 'object') {
            let x = 0
            let tot = 0
            console.log(reviews)
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

    console.log(movie)
    
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 text-gray-300">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-6">
        <img
          src={movie.Poster != undefined ? movie.Poster : No_image}
          alt={movie.Title}
          className="w-full md:w-64 rounded-xl shadow-lg object-cover"
        />
        <div className="flex-1">
          <h1 className="text-3xl font-bold">
            {movie.Title}{' '}
            <span className="text-gray-500 text-xl">({movie.Year})</span>
          </h1>
          
            <p className="text-m mt-1 text-gray-400 mb-2"> 
                <strong className="text-lg font-bold">{movie.Rated}</strong> &nbsp; &nbsp; {movie.Genre} &nbsp; &nbsp;{movie.Runtime}  
            </p>
            <hr/>
            <br/>
            <div className="grid grid-cols-2 items-center">
                <p className="text-lg text-gray-300"><strong>Directed by:</strong> {movie.Director}</p>
                <p className="text-lg text-gray-300 mx-10"><strong>Awards:</strong> {movie.Awards}</p>
            </div>
            
            <div className="grid grid-cols-2">
            {movie.imdbRating && (
                <p className="mt-4 text-md text-gray-400 font-bold">
                  IMDB Rating: ⭐{movie.imdbRating} / 10  &nbsp;  ({movie.imdbVotes} votes)
                </p>
            )}
            {typeof(movie.movieReview) == 'object' ? (
                <p className="mt-4 text-m text-gray-400 font-bold">
                    Nerdipedia Rating: ⭐{averageRating(movie.movieReview)} / 10  &nbsp; ({movie.movieReview.length} votes)
                </p>
            ) : 
                <p className="mt-4 text-m text-red-400">
                    No Nerdipedia Ratings: Be the first to review this movie!
                </p>
            }
          </div>
          <br/>
          {/* Plot Section */}
          <div>
            <h2 className="text-xl font-semibold mb-1">Plot</h2>
            <p className="text-gray-400">{movie.Plot}</p>
          </div>
          
          
        </div>
      </div>

      
    <div className="flex flex-row ">
      {/* Cast Section */}
      <div className="shadow-md rounded p-5">
        <h2 className="text-xl font-semibold mb-1 w-sm">Starring</h2>
        <p className="text-gray-400">{movie.Actors}</p>
      </div>
        
      <div className="p-5 rounded shadow-md space-y-2 text-m w-sm">            
            <p><strong>Released:</strong> {movie.Released}</p>
            <p><strong>Writer:</strong> {movie.Writer}</p>
            <p><strong>Language:</strong> {movie.Language}</p>
            <p><strong>Country:</strong> {movie.Country}</p>
            
      </div>
    
    </div>
    <hr/>
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
