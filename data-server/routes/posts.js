import { Router } from "express";
import { postData, accountData } from "../data/index.js";
import validationFunctions from "../validation/validation.js";
import idValidationFunctions from "../validation/id_validation.js";

const router = Router();

// create post
router.route("/create").post(async (req, res) => {
    let bodyParams = req.body;
    try {
        bodyParams.title = await validationFunctions.validString(bodyParams.title, "Post title");
        bodyParams.posterID = await idValidationFunctions.validObjectId(bodyParams.posterID, "Poster Account ID");
        bodyParams.section = await validationFunctions.validSection(bodyParams.section);
        bodyParams.body = await validationFunctions.validPostBody(bodyParams.body);
        bodyParams.images = await Promise.all(bodyParams.images.map(async (imageURL) => await validationFunctions.validURL(imageURL, 'Image URL')));
    } catch (e) {
        return res.status(400).json({error: e});
    }
    try {
        const postID = await postData.createPost(bodyParams.title, bodyParams.posterID, bodyParams.section, bodyParams.body, bodyParams.images);
        return res.status(200).json({postID: postID});
    } catch (e) {
        if (e.toLowerCase().includes('no') && e.toLowerCase().includes('found')) return res.status(404).json({error: e});
        else return res.status(500).json({error: e});
    }

});

// get post page data
router.route("/data/:id").get(async (req, res) => {
    let reqParams = req.params;
    try {
        reqParams.id = await idValidationFunctions.validObjectId(reqParams.id, 'Post ID');
    } catch (e) {
        return res.status(400).json({error: e});
    }
    try {
        // call data function and cache data
        const postFound = await postData.getPost(reqParams.id);
        const posterCard = await accountData.getAccountCard(postFound.posterID);
        const returnData = {
            title: postFound.title,
            posterID: postFound.posterID,
            posterUsername: posterCard.username,
            posterPic: posterCard.profilePic,
            section: postFound.section,
            body: postFound.body,
            likes: postFound.likes,
            dislikes: postFound.dislikes,
            images: postFound.images,
            timeStamp: postFound.timeStamp
        };
        return res.status(200).json(returnData);

    } catch (e) {
        if (e.toLowerCase().includes('no') && e.toLowerCase().includes('found')) return res.status(404).json({error: e});
        else return res.status(500).json({error: e});
    }
});

// update post
router.route("/data/:id").patch(async (req, res) => {
    let reqParams = req.params;
    let bodyParams = req.body;
    let postInfo = {};
    try {
        reqParams.id = await idValidationFunctions.validObjectId(reqParams.id, 'Post ID');
        if (bodyParams.title) postInfo['title'] = await validationFunctions.validString(bodyParams.title, "Post title");
        if (bodyParams.section) postInfo['section'] = await validationFunctions.validSection(bodyParams.section);
        if (bodyParams.body) postInfo['body'] = await validationFunctions.validPostBody(bodyParams.body);
        if (bodyParams.images) postInfo['images'] = await Promise.all(bodyParams.images.map(async (imageURL) => await validationFunctions.validURL(imageURL, 'Image URL')));
    } catch (e) {
        return res.status(400).json({error: e});
    }
    try {
        const success = await postData.updatePost(reqParams.id, postInfo);
        return res.status(200).json({success: success});

    } catch (e) {
        if (e.toLowerCase().includes('no') && e.toLowerCase().includes('found')) return res.status(404).json({error: e});
        else return res.status(500).json({error: e});
    }
});

// delete post
router.route("/data/:id").delete(async (req, res) => {
    let reqParams = req.params;
    try {
        reqParams.id = await idValidationFunctions.validObjectId(reqParams.id, 'Post ID');
    } catch (e) {
        return res.status(400).json({error: e});
    }
    try {
        const success = await postData.deletePost(reqParams.id);
        return res.status(200).json({success: success});

    } catch (e) {
        if (e.toLowerCase().includes('no') && e.toLowerCase().includes('found')) return res.status(404).json({error: e});
        else return res.status(500).json({error: e});
    }
});

// gets list of popular posts (url as: /popularposts?n=[]&section=[], section (optional))
router.route("/popularposts").get(async (req, res) => {
    let queryParams = req.query;
    try {
        queryParams.n = await validationFunctions.validPositiveNumber(Number(queryParams.n), 'Number of Posts');
        if (queryParams.section) queryParams.section = await validationFunctions.validSection(queryParams.section);
    } catch (e) {
        return res.status(400).json({error: e});
    }
    try {
        const postsList = await postData.getPopularPosts(queryParams.n, queryParams.section);
        return res.status(200).json(postsList);
    } catch (e) {
        return res.status(500).json({error: e});
    }
});

// gets list of recent posts (url as: /recentposts?n=[]&section=[], section (optional))
router.route("/recentposts").get(async (req, res) => {
    let queryParams = req.query;
    try {
        queryParams.n = await validationFunctions.validPositiveNumber(Number(queryParams.n), 'Number of Posts');
        if (queryParams.section) queryParams.section = await validationFunctions.validSection(queryParams.section);
    } catch (e) {
        return res.status(400).json({error: e});
    }
    try {
        const postsList = await postData.getRecentPosts(queryParams.n, queryParams.section);
        return res.status(200).json(postsList);
    } catch (e) {
        return res.status(500).json({error: e});
    }
});

// search posts by title and optional section (url as: /search?term=[]&section=[], section (optional))
router.route("/search").get(async (req, res) => {
    let queryParams = req.query;
    try {
        queryParams.term = await validationFunctions.validString(queryParams.term, 'Search term');
        if (queryParams.section) queryParams.section = await validationFunctions.validSection(queryParams.section);
    } catch (e) {
        return res.status(400).json({error: e});
    }
    try {
        const postsList = await postData.searchPostsByTitle(queryParams.term, queryParams.section);
        return res.status(200).json(postsList);
    } catch (e) {
        if (e.toLowerCase().includes('no') && e.toLowerCase().includes('found')) return res.status(404).json({error: e});
        return res.status(500).json({error: e});
    }
});

// get all the posts by an account
router.route("/byAuthor/:authorID").get(async (req, res) => {
    let reqParams = req.params;
    try {
        reqParams.accountID = await idValidationFunctions.validObjectId(reqParams.accountID, "Account ID");
    } catch (e) {
        return res.status(400).json({error: e});
    }
    try {
        const postsList = await postData.getPostsByAuthor(reqParams.accountID);
        return res.status(200).json(postsList);
    } catch (e) {
        if (e.toLowerCase().includes('no') && e.toLowerCase().includes('found')) return res.status(404).json({error: e});
        return res.status(500).json({error: e});
    }
});

// toggle the like status of a post, returns {status: [likes || dislikes || none]}
// body {postID, accountID}
router.route("/toggleLikePost").patch(async (req, res) => {
    let bodyParams = req.body;
    try {
        bodyParams.postID = await idValidationFunctions.validObjectId(bodyParams.postID, "Post ID");
        bodyParams.accountID = await idValidationFunctions.validObjectId(bodyParams.accountID, "Account ID");
    } catch (e) {
        return res.status(400).json({error: e});
    }
    try {
        const likeStatus = await accountData.toggleLikedPost(bodyParams.accountID,bodyParams.postID);
        return res.status(200).json(likeStatus);
    } catch (e) {
        if (e.toLowerCase().includes('no') && e.toLowerCase().includes('found')) return res.status(404).json({error: e});
        return res.status(500).json({error: e});
    }
});

// toggle the dislike status of a post, returns {status: [likes || dislikes || none]}
// body {postID, accountID}
router.route("/toggleDislikePost").patch(async (req, res) => {
    let bodyParams = req.body;
    try {
        bodyParams.postID = await idValidationFunctions.validObjectId(bodyParams.postID, "Post ID");
        bodyParams.accountID = await idValidationFunctions.validObjectId(bodyParams.accountID, "Account ID");
    } catch (e) {
        return res.status(400).json({error: e});
    }
    try {
        const dislikeStatus = await accountData.toggleDislikedPost(bodyParams.accountID,bodyParams.postID);
        return res.status(200).json(dislikeStatus);
    } catch (e) {
        if (e.toLowerCase().includes('no') && e.toLowerCase().includes('found')) return res.status(404).json({error: e});
        return res.status(500).json({error: e});
    }
});


export default router;