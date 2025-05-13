import React, {useState, useEffect} from "react";
import {useAuth} from "../contexts/authContext";
import {Link, useNavigate, useParams } from "react-router-dom";
import movieService from "../services/movieService";
import No_image from "../assets/no_image.png";

export default function Movie() {

    const navigate = useNavigate();
    const { id } = useParams();

    const {userLoggedIn, mongoUser, currentUser } = useAuth(); 

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [movie, setMovie] = useState(null)

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true)
                const movieResponse = await movieService.getMovie(id);
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
            <p className="text-m mt-1 text-gray-500 mb-2"> 
                {movie.Genre} &nbsp; &nbsp;{movie.Runtime} &nbsp; &nbsp; <strong className="text-lg font-bold">{movie.Rated}</strong>
            </p>
            <p className="text-lg font-bold text-gray-300 mb-2">Directed by: {movie.Director}</p>
            <p><strong>Awards:</strong> {movie.Awards}</p>
            <hr/>
            <div className="grid grid-cols-2">
            {movie.imdbRating && (
                <p className="mt-4 text-md text-gray-400 font-bold">
                  IMDB Rating: ⭐{movie.imdbRating} / 10  ({movie.imdbVotes} votes)
                </p>
            )}
            {typeof(movie.movieReview) == 'object' ? (
                <p className="mt-4 text-m text-gray-400 font-bold">
                    Nerdipedia Rating: ⭐{averageRating(movie.movieReview)} / 10 ({movie.movieReview.length} votes)
                </p>
            ) : 
                <p className="mt-4 text-m text-red-400">
                    No Nerdipedia Rating: Be the first to review this movie!
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

      
    <div className="grid grid-cols-2 gap-1">
      {/* Cast Section */}
      <div>
        <h2 className="text-xl font-semibold mb-1">Starring</h2>
        <p className="text-gray-400">{movie.Actors}</p>
      </div>

      <div className="space-y-2 text-m">            
            <p><strong>Released:</strong> {movie.Released}</p>
            <p><strong>Writer:</strong> {movie.Writer}</p>
            <p><strong>Language:</strong> {movie.Language}</p>
            <p><strong>Country:</strong> {movie.Country}</p>
            
          </div>

    
    </div>
    </div>
  );
}
