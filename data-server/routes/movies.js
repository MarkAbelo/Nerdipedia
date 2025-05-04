import { Router } from "express";
import { movieData } from "../data/index.js";
import validationFunctions from "../validation/validation.js";
import idValidationFunctions from "../validation/id_validation.js";

const router = Router();
router.route("/getMovie/:movieId").get(async (req, res) => {
    let id= req.params.movieId;
    try{
        if(!id) throw "No movie id provided";
        id= await idValidationFunctions.validObjectId(id, "Movie ID");
    }catch (e) {
        return res.status(400).json({error: e});
    }
    try{
        const movieFound= await movieData.getMovie(id);
        return res.status(200).json(movieFound);
    }
    catch (e) {
        if (e.toLowerCase().includes('no') && e.toLowerCase().includes('found')) return res.status(404).json({error: e});
        else return res.status(500).json({error: e});
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
        if (pageNum < 0) throw "Page number cannot be negative";
        if (pageNum == 0) throw "Page number cannot be zero";
        if (!Number.isInteger(pageNum)) throw "Page number must be an integer";
        searchTerm = await validationFunctions.validString(searchTerm, "Search term");
    } catch (e) {
        return res.status(400).json({error: e});
    }
    try {
        const movieList = await movieData.searchMovieByTitle(searchTerm, pageNum);
        return res.status(200).json(movieList);
    } catch (e) {
        if (e.toLowerCase().includes('no') && e.toLowerCase().includes('found')) return res.status(404).json({error: e});
        else return res.status(500).json({error: e});
    }
});

router.route("/getMovieCard/:movieId").get(async (req, res) => {
    let id= req.params.movieId;
    try{
        if(!id) throw "No movie id provided";
        id= await idValidationFunctions.validObjectId(id, "Movie ID");
    }catch (e) {
        return res.status(400).json({error: e});
    }
    try{
        const movieFound= await movieData.getMovieCard(id);
        return res.status(200).json(movieFound);
    }catch (e) {
        if (e.toLowerCase().includes('no') && e.toLowerCase().includes('found')) return res.status(404).json({error: e});
        else return res.status(500).json({error: e});
    }
});

//we have not written this function yet 
router.route("recommendMovies").get(async (req, res) => {
});
export default router;