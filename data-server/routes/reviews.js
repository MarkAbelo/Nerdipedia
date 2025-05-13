import { Router } from "express";
import { reviewData } from "../data/index.js";
import validationFunctions from "../validation/validation.js";
import idValidationFunctions from "../validation/id_validation.js";

const router = Router();

// create review
router.route("/create").post(async (req, res) => {
    let bodyParams = req.body;
    try {
        bodyParams.posterID = await idValidationFunctions.validObjectId(bodyParams.posterID, "Poster Account ID");
        bodyParams.body = await validationFunctions.validString(bodyParams.body, "body");
        bodyParams.rating = Number(bodyParams.rating);
        if(typeof bodyParams.rating !== 'number' && bodyParams.rating<1 || bodyParams.rating>10) throw (`Rating must be a number between 1 and 10`);
        bodyParams.section = await validationFunctions.validSection(bodyParams.section);
        bodyParams.forID = await validationFunctions.validString(bodyParams.forID, "forID");
    } catch (e) {
        return res.status(400).json({error: e});
    }
    try {
        const reviewID = await reviewData.createReview(bodyParams.posterID, bodyParams.body, bodyParams.rating, bodyParams.section, bodyParams.forID);
        return res.status(200).json({reviewID: reviewID});
    } catch (e) {
        if (typeof e === 'string' && e.toLowerCase().includes('no') && e.toLowerCase().includes('found')) return res.status(404).json({error: e});
        else return res.status(500).json({error: e});
    }
});

// get review
router.route("/data/:id").get(async (req, res) => {
    let reqParams = req.params;
    try {
        reqParams.id = await idValidationFunctions.validObjectId(reqParams.id, 'Review ID');
    } catch (e) {
        return res.status(400).json({error: e});
    }
    try {
        const reviewFound = await reviewData.updateReview(reqParams.id, reviewInfo);
        const returnData = {
            id: reviewFound._id.toString(),
            posterID: reviewFound.posterID,
            body: reviewFound.body,
            rating: reviewFound.rating,
            section: reviewFound.section,
            forID: reviewFound.forID
        };
        return res.status(200).json(returnData);
    
    } catch (e) {
        if (typeof e === 'string' && e.toLowerCase().includes('no') && e.toLowerCase().includes('found')) return res.status(404).json({error: e});
        else return res.status(500).json({error: e});
    }
});
// update review
router.route("/data/:id").patch(async (req, res) => {
    let reqParams = req.params;
    let bodyParams = req.body;
    let reviewInfo = {};
    try {
        reqParams.id = await idValidationFunctions.validObjectId(reqParams.id, 'Review ID');
        if (bodyParams.body) reviewInfo['body'] = await validationFunctions.validString(bodyParams.body, "body");
        if (bodyParams.rating){
            bodyParams.rating = Number(bodyParams.rating);
            if(typeof bodyParams.rating !== 'number' && bodyParams.rating<1 || bodyParams.rating>10) throw (`Rating must be a number between 1 and 10`);
            reviewInfo['rating'] = bodyParams.rating;
        } 
        //if (bodyParams.body) reviewInfo['section'] = await validationFunctions.validSection(bodyParams.section);
    } catch (e) {
        return res.status(400).json({error: e});
    }
    try {
        const success = await reviewData.updateReview(reqParams.id, reviewInfo);
        return res.status(200).json({success: success});

    } catch (e) {
        if (typeof e === 'string' && e.toLowerCase().includes('no') && e.toLowerCase().includes('found')) return res.status(404).json({error: e});
        else return res.status(500).json({error: e});
    }
});

// delete review
router.route("/data/:id").delete(async (req, res) => {
    let reqParams = req.params;
    try {
        reqParams.id = await idValidationFunctions.validObjectId(reqParams.id, 'Review ID');
    } catch (e) {
        return res.status(400).json({error: e});
    }
    try {
        const success = await reviewData.deleteReview(reqParams.id);
        return res.status(200).json({success: success});

    } catch (e) {
        if (typeof e === 'string' && e.toLowerCase().includes('no') && e.toLowerCase().includes('found')) return res.status(404).json({error: e});
        else return res.status(500).json({error: e});
    }
});


export default router;