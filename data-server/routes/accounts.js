import { Router } from "express";
import { accountData, postData, reviewData } from "../data/index.js";
import validationFunctions from "../validation/validation.js";
import idValidationFunctions from "../validation/id_validation.js";
import { admin } from "../config/firebaseAdmin.js";

const router = Router();

// create account
router.route("/create").post(async (req, res) => {
    let bodyParams = req.body;
    try {
        bodyParams.username = await validationFunctions.validString(bodyParams.username, "Username");
        bodyParams.email = await validationFunctions.validEmail(bodyParams.email);
        bodyParams.password = await validationFunctions.validPassword(bodyParams.password);
        if (bodyParams.profilePic) bodyParams.profilePic = await validationFunctions.validURL(bodyParams.profilePic);
    } catch (e) {
        return res.status(400).json({error: e});
    }
    try {
        const userIDs = await accountData.createAccount(bodyParams.username, bodyParams.password, bodyParams.email, bodyParams.profilePic);
        return res.status(200).json(userIDs);
    } catch (e) {
        return res.status(500).json({error: e});
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
        const topMovies = await reviewData.getAccountTopMovies(reqParams.id);
        const topShows = await reviewData.getAccountTopShows(reqParams.id);
        const returnData = {
            likedPosts: accountFound.likedPosts,
            dislikedPosts: accountFound.dislikedPosts,
            username: accountFound.username,
            profilePic: accountFound.profilePic,
            postCards: postCards,
            topBooks: topBooks,
            topMovies: topMovies,
            topShows: topShows
        };
        return res.status(200).json(returnData);

    } catch (e) {
        console.log(e)
        if (e.message && e.message.toLowerCase().includes('no') && e.message.toLowerCase().includes('found')) return res.status(404).json({error: e});
        if (typeof e === 'string' && e.toLowerCase().includes('no') && e.toLowerCase().includes('found')) return res.status(404).json({error: e});
        else return res.status(500).json({error: e});
    }
});

// get account form data (username, email and profile pic)
router.route("/formdata/:id").get(async (req, res) => {
    let reqParams = req.params;
    try {
        reqParams.id = await idValidationFunctions.validObjectId(reqParams.id, 'Account ID');
    } catch (e) {
        return res.status(400).json({error: e});
    }
    try {
        // call data function and cache data
        const accountFound = await accountData.getAccount(reqParams.id);
        const returnData = {
            username: accountFound.username,
            email: accountFound.email,
            profilePic: accountFound.profilePic,
        };
        return res.status(200).json(returnData);

    } catch (e) {
        if (typeof e === 'string' && e.toLowerCase().includes('no') && e.toLowerCase().includes('found')) return res.status(404).json({error: e});
        else return res.status(500).json({error: e});
    }
});

// update account
router.route("/data/:id").patch(async (req, res) => {
    let reqParams = req.params;
    let bodyParams = req.body;
    try {
        reqParams.id = await idValidationFunctions.validObjectId(reqParams.id, 'Account ID');
        if (bodyParams.username) bodyParams.username = await validationFunctions.validString(bodyParams.username, "Username");
        if (bodyParams.password) bodyParams.password = await validationFunctions.validPassword(bodyParams.password);
        if (bodyParams.email) bodyParams.email = await validationFunctions.validEmail(bodyParams.email);
        if (bodyParams.profilePic) bodyParams.profilePic = await validationFunctions.validURL(bodyParams.profilePic);
    } catch (e) {
        return res.status(400).json({error: e});
    }
    try {
        const success = await accountData.editAccount(reqParams.id, bodyParams.username, bodyParams.password, bodyParams.email, bodyParams.profilePic);
        return res.status(200).json({success: success});

    } catch (e) {
        if (typeof e === 'string' && e.toLowerCase().includes('no') && e.toLowerCase().includes('found')) return res.status(404).json({error: e});
        else return res.status(500).json({error: e});
    }
});

// delete post
router.route("/data/:id").delete(async (req, res) => {
    let reqParams = req.params;
    try {
        reqParams.id = await idValidationFunctions.validObjectId(reqParams.id, 'Account ID');
    } catch (e) {
        return res.status(400).json({error: e});
    }
    try {
        const success = await postData.deleteAccount(reqParams.id);
        return res.status(200).json({success: success});

    } catch (e) {
        if (typeof e === 'string' && e.toLowerCase().includes('no') && e.toLowerCase().includes('found')) return res.status(404).json({error: e});
        else return res.status(500).json({error: e});
    }
});

export default router;