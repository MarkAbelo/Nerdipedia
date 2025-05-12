import axios from 'axios';
import validationFunctions from '../../../data-server/validation/validation.js';

const reviewService = {
    async createReview(reviewObj) {
        try {
            reviewObj.body = await validationFunctions.validString(reviewObj.body, "Review body");
            reviewObj.rating = Number(reviewObj.rating);
            if (isNaN(reviewObj.rating) || reviewObj.rating < 1 || reviewObj.rating > 10) {
                throw 'Rating must be a number between 1 and 10';
            }
            reviewObj.section = await validationFunctions.validSection(reviewObj.section);
            reviewObj.forID = await validationFunctions.validString(reviewObj.forID, "forID");
        } catch (e) {
            console.log(e);
            throw e;
        }
        try {
            const response = await axios.post("http://localhost:3000/reviews/create", reviewObj);
            if (response.status === 200) {
                return response.data.reviewID;
            } else {
                throw response.error;
            }
        } catch (e) {
            console.log(e);
            throw "Error: Failed to create review (check data-server logs)";
        }
    },

    async getReview(id) {
        try {
            const response = await axios.get(`http://localhost:3000/reviews/data/${id}`);
            if (response.status === 200) {
                return response.data;
            } else {
                throw response.error;
            }
        } catch (e) {
            console.log(e);
            if (e.response?.status === 404) throw "Review not found";
            throw "Error: Failed to fetch review";
        }
    },

    async updateReview(id, updateObj) {
        try {
            const validatedUpdate = {};
            if (updateObj.body) {
                validatedUpdate.body = await validationFunctions.validString(updateObj.body, "body");
            }
            if (updateObj.rating) {
                validatedUpdate.rating = Number(updateObj.rating);
                if (isNaN(validatedUpdate.rating)) throw "Rating must be a number";
                if (validatedUpdate.rating < 1 || validatedUpdate.rating > 10) {
                    throw "Rating must be between 1 and 10";
                }
            }
            if (updateObj.section) {
                validatedUpdate.section = await validationFunctions.validSection(updateObj.section);
            }
            const response = await axios.patch(`http://localhost:3000/reviews/data/${id}`, validatedUpdate);
            return response.data.success;
        } catch (e) {
            console.log(e);
            throw "Error: Failed to update review";
        }
    },

    async deleteReview(id) {
        try {
            const response = await axios.delete(`http://localhost:3000/reviews/data/${id}`);
            return response.data.success;
        } catch (e) {
            console.log(e);
            if (e.response?.status === 404) throw "Review not found";
            throw "Error: Failed to delete review";
        }
    }
};

export default reviewService;