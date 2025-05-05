import { Router } from "express";
import { accountData, postData, reviewData } from "../data/index.js";
import validationFunctions from "../validation/validation.js";
import idValidationFunctions from "../validation/id_validation.js";

const router = Router();

// create post
router.route("/create").post(async (req, res) => {
    let bodyParams = req.body;
    try {
        bodyParams.username = await validationFunctions.validString(bodyParams.title, "Username");
        bodyParams.email = await validationFunctions.validEmail(email)
        bodyParams.profilePic = await validationFunctions.validSection(bodyParams.section)
        if (profilePic) bodyParams.profilePic = await validationFunctions.validURL(profilePic);
    } catch (e) {
        return res.status(400).json({error: e});
    }
    try {
        const userIDs = await accountData.createAccount(bodyParams.username, bodyParams.email, bodyParams.profilePic);
        return res.status(200).json(userIDs);
    } catch (e) {
        if (e.toLowerCase().includes('no') && e.toLowerCase().includes('found')) return res.status(404).json({error: e});
        else return res.status(500).json({error: e});
    }

});

// get account page data
router.route("/data/:id").get(async (req, res) => {
    let reqParams = req.params;
    try {
        reqParams.id = await idValidationFunctions.validObjectId(reqParams.id, 'Account ID');
    } catch (e) {
        return res.status(400).json({error: e});
    }
    try {
        // call data function and cache data
        const accountFound = await accountData.getAccount(reqParams.id);
        const postCards = await Promise.all(accountFound.posts.map(postData.getPostCard));
        const topBooks = await reviewData.getAccountTopBooks(reqParams.id);
        const topMovies = await reviewData.getAccountTopBooks(reqParams.id);
        const topShows = await reviewData.getAccountTopBooks(reqParams.id);
        const returnData = {
            username: accountFound.username,
            profilePic: accountFound.profilePic,
            postCards: postCards,
            topBooks: topBooks,
            topMovies: topMovies,
            topShows: topShows
        };
        return returnData;

    } catch (e) {
        if (e.toLowerCase().includes('no') && e.toLowerCase().includes('found')) return res.status(404).json({error: e});
        else return res.status(500).json({error: e});
    }
});

export default router;