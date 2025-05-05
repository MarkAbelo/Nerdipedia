/* 
    "Title": "Just Add Water",
    "Year": "2008",
    "Rated": "R",
    "Released": "18 Mar 2008",
    "Runtime": "95 min",
    "Genre": "Comedy, Romance",
    "Director": "Hart Bochner",
    "Writer": "Hart Bochner",
    "Actors": "Dylan Walsh, Jonah Hill, Justin Long",
    "Plot": "Close to the entrance to Death Valley is the God-forsaken town of Trona. It's nearly empty: dry, with polluted water and poisoned soil. Dilapidated houses hold slackers and stoners. The town is virtually owned by Dirk, a heartless young meth dealer. In the midst of this lives Ray Tuckby, a naïf, unhappily married with a slothful son. The highlight of Ray's day is chatting with Nora, a clerk at the market. When Ray comes home early from work and finds his wife in bed with his brother, a few things start to change. Then he meets Merl, who's putting in a Chevron station, and Merl encourages Ray to dream. Can he? A recipe for meringue may hold one of the keys.",
    "Language": "English",
    "Country": "United States",
    "Awards": "1 win & 1 nomination",
    "Poster": "https://m.media-amazon.com/images/M/MV5BY2VmNWIyZjUtZjk3Zi00YWQyLTk5ZjktYzU3ZGQ1MTcxMWFjXkEyXkFqcGc@._V1_SX300.jpg",
    "Ratings": [
        {
            "Source": "Internet Movie Database",
            "Value": "5.6/10"
        }
    ],
    "Metascore": "N/A",
    "imdbRating": "5.6",
    "imdbVotes": "3,242",
    "imdbID": "tt0790723",
    "Type": "movie",
    "DVD": "N/A",
    "BoxOffice": "N/A",
    "Production": "N/A",
    "Website": "N/A",
    "Response": "True"
*/

import validationFunctions from "../validation/validation.js";
import axios from "axios";

import redis from 'redis';
const redis_client = redis.createClient();
await redis_client.connect();

const uri = 'http://www.omdbapi.com/?apikey=3e10e10a&plot=full&type=movie&'

const moviesDataFunctions = {
    async getMovie(id) {
        if (!id) throw "An ID must be supplied!";
        id = await validationFunctions.validString(id,"movie");

        // check cache
        const cacheKey = `movie/${id}`;
        const checkCache = await redis_client.exists(cacheKey);
        if (checkCache) {
            const cacheData = await redis_client.get(cacheKey);
            return JSON.parse(cacheData);
        }

        // Get Movie, handling bad input
        let movieInfo;
        try {
            const movieResponse = await axios.get(uri + `i=${id}`) // Bad ID still sends status 200, so handle error here
            if (movieResponse.data.Response === 'False') {
                throw movieResponse.data.Error
            }
            movieInfo = movieResponse.data
        } catch (e) {
            throw e
        }
        // cache data
        await redis_client.set(cacheKey, JSON.stringify(movieInfo));

        return movieInfo;
    },
    async searchMovieByTitle(searchTerm, pageNum=1) {

        if (!searchTerm) throw 'Search term must be provided';
        if (typeof pageNum !== 'number') throw 'Page must be a number'; 
        if (pageNum > 100 || pageNum < 1) throw 'Page must be a number between 1-100'
        searchTerm = await validationFunctions.validString(searchTerm, "show");
        //encode the query 
        const encodedSearchTerm = encodeURIComponent(searchTerm);
        //axios
        let moviesData; 
        try {
            const searchResponse = await axios.get(uri + `s=${encodedSearchTerm}&page=${pageNum}`); // Gets up to 10 results based on page #
            if (searchResponse.data.Response === 'False') {
                throw searchResponse.data.Error
            }
            moviesData = searchResponse.data.Search
        } catch(e) {
            // e == "Movie not found!" if the page # is too high 
            // e == "Too many results." if the search term is too broad
            throw e;
        }

        /* 
            Searching in OMDB limits the attributes to:
              {
                "Title": String,
                "Year": String,
                "imdbID": String,
                "Type": "movie",
                "Poster": "{url}" || "N/A"
              }
            If we want to display more in the Movies List page, we can query the API again here
        */
        
        return moviesData

    },
    async getMovieCard(id) {
        if (!id) throw "An ID must be supplied!"
        id = await validationFunctions.validString(id, "movie")

        // check cache
        const cacheKey = `movie/card/${id}`;
        const checkCache = await redis_client.exists(cacheKey);
        if (checkCache) {
            const cacheData = await redis_client.get(cacheKey);
            return JSON.parse(cacheData);
        }

        let movieInfo;
        try {
            const movieResponse = await axios.get(uri + `i=${id}`)
            if (movieResponse.data.Response == 'False') {
                throw movieResponse.data.Error
            }
            movieInfo = movieResponse.data
        } catch (e) {
            // e == "Incorrect IMDb ID." if user error
            throw e
        }

        const movieCard = {
            title: movieInfo.Title,
            image: movieInfo.Poster // Handle "N/A" poster here, or in frontend?
        }

        // cache data
        await redis_client.set(cacheKey, JSON.stringify(movieCard));

        return movieCard
    },
    async recommendMovies(){
        //to be implemented
    },
}

export default moviesDataFunctions; 
