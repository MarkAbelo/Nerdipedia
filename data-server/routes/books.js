import { Router } from "express";
import { bookData, reviewData } from "../data/index.js";
import validationFunctions from "../validation/validation.js";
import idValidationFunctions from "../validation/id_validation.js";

const router = Router();

router.route("/getBook/:bookId").get(async (req, res) => {
    let id= req.params.bookId;
    let bookFound;
    try{
        if(!id) throw "No book id provided";
    }catch (e) {
        return res.status(400).json({error: e});
    }
    try{
        bookFound= await bookData.getBook(id);
    }
    catch (e) {
        //not really sure why the error is written like this, but i am sticking with it
        if (e.toLowerCase().includes('no') && e.toLowerCase().includes('found')) return res.status(404).json({error: e});
        else return res.status(500).json({error: e});
    }
    try{
        const bookReview = await reviewData.getAllReviews(id, "book") // Errors handled by func, returns a string if no reviews
        bookFound['bookReview']=bookReview;
        return res.status(200).json(bookFound);
    }
    catch (e) {
        return res.status(500).json({error: e});
    }

});

router.route("/search").get(async (req, res) => { //the url in the search bar should be /books/search?searchTerm=bookName&pageNum=1
    let searchTerm = req.query.searchTerm;
    let pageNum = parseInt(req.query.pageNum, 10);
    try {
        if (!searchTerm) throw "No search term provided";
        searchTerm = await validationFunctions.validString(searchTerm, "book");
        if (!pageNum) pageNum = 1;
        if (isNaN(pageNum)) pageNum = 1;
        pageNum = await validationFunctions.validPositiveNumber(pageNum, "Page Number");
        searchTerm = await validationFunctions.validString(searchTerm, "Search term");
    } catch (e) {
        return res.status(400).json({error: e});
    }
    try {
        const bookList = await bookData.searchBookByTitle(searchTerm, pageNum);
        return res.status(200).json(bookList);
    } catch (e) {
        if (e.toLowerCase().includes('no') && e.toLowerCase().includes('found')) return res.status(404).json({error: e});
        else return res.status(500).json({error: e});
    }
});
router.route("/popularBooks").get(async (req,res)=>{
    let n= parseInt(req.query.n,10);
    try{
        if(!n) n= 10;
        if (isNaN(n)) n = 10;
        n= await validationFunctions.validPositiveNumber(n, "Number of Books")
    }catch (e) {
        return res.status(400).json({error: e});
    }
    try{
        const bookList = await reviewData.mostPopularBooks(n);
        return res.status(200).json(bookList);
    }catch (e) {
        console.log(e)
        return res.status(500).json({error: e});
    }
})  
//we have not written this function yet 
router.route("/getBooksRecs").get(async (req, res) => {
    let accountId= req.query.accountId
    let n = parseInt(req.query.n,10);
    try{
        if(!accountId) throw "No account id provided";
        accountId= await idValidationFunctions.validObjectId(accountId, "Account ID");
        if(!n) n= 10;
        if (isNaN(n)) n = 10;
        n= await validationFunctions.validPositiveNumber(n, "Number of Books")
    }catch (e) {
        return res.status(400).json({error: e});
    }
    try{
        const bookList = await bookData.getBookRecs(accountId, n);
        return res.status(200).json(bookList);
    }catch (e) {
        return res.status(500).json({error: e});
    }
});
export default router; 