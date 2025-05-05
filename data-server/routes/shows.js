import { Router } from "express";
import { showData, reviewData } from "../data/index.js";
import validationFunctions from "../validation/validation.js";
import idValidationFunctions from "../validation/id_validation.js";

const router = Router();

router.route("/getShow/:showId").get(async (req, res) => {
    let id= req.params.showId;
    try{
        if(!id) throw "No show id provided";
        id= await idValidationFunctions.validObjectId(id, "Show ID");
    }catch (e) {
        return res.status(400).json({error: e});
    }
    try{
        const showFound= await showData.getShow(id);
    }
    catch (e) {
        if (e.toLowerCase().includes('no') && e.toLowerCase().includes('found')) return res.status(404).json({error: e});
        else return res.status(500).json({error: e});
    }
    try{
        const showReview = await reviewData.getAllReviews(id, "show") // Errors handled by func, returns a string if no reviews
        showFound['showReview']=showReview;
        return res.status(200).json(showFound);
    }
    catch (e) {
        return res.status(500).json({error: e});
    }
});

router.route("/search").get(async (req, res) => { //the url in the search bar should be /shows/search?searchTerm=showName&pageNum=1
    let searchTerm = req.query.searchTerm;
    let pageNum = parseInt(req.query.pageNum, 10);
    try {
        if (!searchTerm) throw "No search term provided";
        searchTerm = await validationFunctions.validString(searchTerm, "show");
        if (!pageNum) pageNum = 1;
        if (isNaN(pageNum)) pageNum = 1;
        pageNum = await validationFunctions.validPositiveNumber(pageNum, "Page Number");
        searchTerm = await validationFunctions.validString(searchTerm, "Search term");
    } catch (e) {
        return res.status(400).json({error: e});
    }
    try {
        const showList = await showData.searchShowByTitle(searchTerm, pageNum);
        return res.status(200).json(showList);
    } catch (e) {
        if (e.toLowerCase().includes('no') && e.toLowerCase().includes('found')) return res.status(404).json({error: e});
        else return res.status(500).json({error: e});
    }
});
router.route("/popularShows").get(async (req,res)=>{
    let n= req.query.n;
    try{
        if(!n) n= 10;
        if (isNaN(n)) n = 10;
        n= await validationFunctions.validPositiveNumber(n, "Number of Shows")
    }catch (e) {
        return res.status(400).json({error: e});
    }
    try {
        const showList = await reviewData.mostPopularShows(n);
        return res.status(200).json(showList);
    } catch (e) {
        return res.status(500).json({error: e});
    }
});
//we have not written this function yet 
router.route("/recommendShows").get(async (req, res) => {
});
export default router;