import { Router } from "express";
import { bookData } from "../data/index.js";
import validationFunctions from "../validation/validation.js";
import idValidationFunctions from "../validation/id_validation.js";

const router = Router();

router.route("/getBook/:bookId").get(async (req, res) => {
    let id= req.params.bookId;
    try{
        if(!id) throw "No book id provided";
        id= await idValidationFunctions.validObjectId(id, "Book ID");
    }catch (e) {
        return res.status(400).json({error: e});
    }
    try{
        const bookFound= await bookData.getBook(id);
        return res.status(200).json(bookFound);
    }
    catch (e) {
        //not really sure why the error is written like this, but i am sticking with it
        if (e.toLowerCase().includes('no') && e.toLowerCase().includes('found')) return res.status(404).json({error: e});
        else return res.status(500).json({error: e});
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
        if (pageNum < 0) throw "Page number cannot be negative";
        if (pageNum == 0) throw "Page number cannot be zero";
        if (!Number.isInteger(pageNum)) throw "Page number must be an integer";
        searchTerm = await validationFunctions.validString(searchTerm, "Search term");
    } catch (e) {
        return res.status(400).json({error: e});
    }
    try {
        const bookList = await bookData.searchBooks(searchTerm, pageNum);
        return res.status(200).json(bookList);
    } catch (e) {
        if (e.toLowerCase().includes('no') && e.toLowerCase().includes('found')) return res.status(404).json({error: e});
        else return res.status(500).json({error: e});
    }
});
//not exactly sure why we need this function, but it is in the original code so I am keeping it, it was a really simple copy paste thing
router.route("/getBookCard/:bookId").get(async (req, res) => {
    let id= req.params.bookId;
    try{
        if(!id) throw "No book id provided";
        id= await idValidationFunctions.validObjectId(id, "Book ID");
    }catch (e) {
        return res.status(400).json({error: e});
    }
    try{
        const bookFound= await bookData.getBookCard(id);
        return res.status(200).json(bookFound);
    }
    catch (e) {
        //not really sure why the error is written like this, but i am sticking with it
        if (e.toLowerCase().includes('no') && e.toLowerCase().includes('found')) return res.status(404).json({error: e});
        else return res.status(500).json({error: e});
    }
});

//we have not written this function yet 
router.route("recommendBooks").get(async (req, res) => {
});
export default router; 