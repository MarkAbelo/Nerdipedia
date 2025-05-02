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
        if (e.toLowerCase().includes('not found')) return res.status(404).json({error: e});
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
        return returnData;

    } catch (e) {
        if (e.toLowerCase().includes('not found')) return res.status(404).json({error: e});
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
        if (e.toLowerCase().includes('not found')) return res.status(404).json({error: e});
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
        if (e.toLowerCase().includes('not found')) return res.status(404).json({error: e});
        else return res.status(500).json({error: e});
    }
});

// gets list of popular posts (reqBody: n, section (optional))
router.route("/popularposts/:n/:section").get(async (req, res) => {
    let reqParams = req.params;
    try {
        reqParams.n = await validationFunctions.validPostitiveNumber(reqParams.n, 'Number of Posts');
        if (reqParams.section) reqParams.section = await validationFunctions.validSection(bodyParams.section);
    } catch (e) {
        console.log(e)
        return res.status(400).json({error: e});
    }
    try {
        const postsList = await postData.getPopularPosts(n, bodyParams.section);
        return res.status(200).json(postsList);
    } catch (e) {
        return res.status(500).json({error: e});
    }
});

// gets list of recent posts (reqBody: n, section (optional))
router.route("/recentposts/:n/:section").get(async (req, res) => {
    let reqParams = req.params;
    try {
        reqParams.n = await validationFunctions.validPostitiveNumber(bodyParams.n, 'Number of Posts');
        if (reqParams.section) reqParams.section = await validationFunctions.validSection(reqParams.section);
    } catch (e) {
        return res.status(400).json({error: e});
    }
    try {
        return res.status(200).json({n: reqParams.n, section: reqParams.section}); 
        // const postsList = await postData.getRecentPosts(reqParamsn, reqParams.section);
        // return res.status(200).json(postsList);
    } catch (e) {
        return res.status(500).json({error: e});
    }
});


export default router;