import { Router } from "express";
import { movieData, reviewData } from "../data/index.js";
import validationFunctions from "../validation/validation.js";
import idValidationFunctions from "../validation/id_validation.js";

const router = Router();
router.route("/getMovie/:movieId").get(async (req, res) => {
    let id= req.params.movieId;
    let movieFound;
    try{
        if(!id) throw "No movie id provided";
    }catch (e) {
        return res.status(400).json({error: e});
    }
    try{
        movieFound= await movieData.getMovie(id);
    }
    catch (e) {
        if (typeof e === 'string' && e.toLowerCase().includes('no') && e.toLowerCase().includes('found')) return res.status(404).json({error: e});
        else return res.status(500).json({error: e});
    }
    try{
        const movieReview = await reviewData.getAllReviews(id, "movie") // Errors handled by func, returns a string if no reviews
        movieFound['movieReview']=movieReview;
        return res.status(200).json(movieFound);
    }
    catch (e) {
        return res.status(500).json({error: e});
    }
});

router.route("/search").get(async (req, res) => { //the url in the search bar should be /movies/search?searchTerm=movieName&pageNum=1
    let searchTerm = req.query.searchTerm;
    let pageNum = parseInt(req.query.pageNum, 10);
    try {
        if (!searchTerm) throw "No search term provided";
        searchTerm = await validationFunctions.validString(searchTerm, "movie");
        if (!pageNum) pageNum = 1;
        if (isNaN(pageNum)) pageNum = 1;
        pageNum = await validationFunctions.validPositiveNumber(pageNum, "Page Number");
        searchTerm = await validationFunctions.validString(searchTerm, "Search term");
    } catch (e) {
        return res.status(400).json({error: e});
    }
    try {
        const movieList = await movieData.searchMovieByTitle(searchTerm, pageNum);
        return res.status(200).json(movieList);
    } catch (e) {
        if (typeof e === 'string' && e.toLowerCase().includes('no') && e.toLowerCase().includes('found')) return res.status(404).json({error: e});
        else return res.status(500).json({error: e});
    }
});
router.route("/popularMovies").get(async (req,res)=>{
    let n= parseInt(req.query.n,10);
    try{
        if(!n) n= 10;
        if (isNaN(n)) n = 10;
        n= await validationFunctions.validPositiveNumber(n, "Number of Movies")
    }catch (e) {
        return res.status(400).json({error: e});
    }
    try {
        const movieList = await reviewData.mostPopularMovies(n);
        return res.status(200).json(movieList);
    } catch (e) {
        return res.status(500).json({error: e});
    }
});

//we have not written this function yet 
router.route("/getMovieRecs").get(async (req, res) => {
    let accountId = req.query.accountId;
    let n = parseInt(req.query.n,10);
    try {
        if (!accountId) throw "No account ID provided";
        accountId = await idValidationFunctions.validObjectId(accountId, "Account ID");
        if (!n) n = 10;
        if (isNaN(n)) n = 10;
        n = await validationFunctions.validPositiveNumber(n, "Number of Movies");
    } catch (e) {
        return res.status(400).json({error: e});
    }
    try {
        const movieList = await movieData.getMovieRecs(accountId, n);
        return res.status(200).json(movieList);
    } catch (e) {
        return res.status(500).json({error: e});
    }
});
export default router;