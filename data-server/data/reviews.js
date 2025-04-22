import { reviews, accounts } from "../config/mongoCollections";
import validationFunctions from "../validation";
const reviewsDataFunctions = {
    async createReview(posterID, body, rating, section, forID){
        if(!posterID) throw (`No User ID found`);
        if(!body) throw (`No review body text found`);
        if(!rating) throw (`No rating found`);
        if(!section) throw (`No section found`);
        if(!forID) throw (`No media ID found`);
        posterID= await validationFunctions.validObjectId(posterID, "posterID");
        body= await validationFunctions.validString(body, "body");
        section= await validationFunctions.validString(section, "section");
        section= section.toLowerCase();
        forID= await validationFunctions.validString(forID, "forID");
        if(typeof rating !== 'number' && rating<1 && rating>10) throw (`Rating must be a number between 1 and 10`);
        if(section !== 'show' || section !== 'movie' || section !== 'book' || section !== 'd&d') throw (`Section must be one of the following: show, movie, book, d&d`);
        let timeNow = new Date();
        const reviewToAdd={
            posterID: posterID,
            body: body,
            rating: rating,
            section: section,
            forID: forID,
            timeStamp: timeNow
        }
        const reviewsCollection = await reviews();
        const insertInfo = await reviewsCollection.insertOne(reviewToAdd);
        if (insertInfo.insertedCount === 0) throw (`Could not add review`);
        const newId = insertInfo.insertedId.toString();
        return newId;
    },

    async updateReview(reviewObject){
        //check to see if the review object is valid
        if(!reviewObject) throw (`No review object found`);
        if(typeof reviewObject !== 'object') throw (`Review object must be an object`);
        if(Array.isArray(reviewObject)) throw (`Review object must not be an array`);
        if(!reviewObject._id) throw (`No review ID found`);
        if(!reviewObject.posterID) throw (`No poster ID found`)
        if(!reviewObject.forID) throw (`No media ID found`);
        if(!reviewObject.body) throw (`No review body text found`);
        if(!reviewObject.rating) throw (`No rating found`);
        if(!reviewObject.section) throw (`No section found`);
        //run validation checks
        //I am not sure if all these fields are required, but I am going to assume they are for now
        reviewObject._id= await validationFunctions.validObjectId(reviewObject._id, "reviewID");
        reviewObject.posterID= await validationFunctions.validObjectId(reviewObject.posterID, "posterID");
        reviewObject.body= await validationFunctions.validString(reviewObject.body, "body");
        reviewObject.section= await validationFunctions.validString(reviewObject.section, "section");
        reviewObject.section= reviewObject.section.toLowerCase();
        reviewObject.forID= await validationFunctions.validString(reviewObject.forID, "forID");
        if(typeof reviewObject.rating !== 'number' && reviewObject.rating<1 && reviewObject.rating>10) throw (`Rating must be a number between 1 and 10`);
        if(reviewObject.section !== 'show' || reviewObject.section !== 'movie' || reviewObject.section !== 'book' || reviewObject.section !== 'd&d') throw (`Section must be one of the following: show, movie, book, d&d`);
        //grab the review to update
        let timeNow = new Date();
        const reviewsCollection = await reviews();
        const reviewToUpdate = await reviewsCollection.findOneAndUpdate(
            { _id: new ObjectId(reviewObject._id) },
            { $set: { 
                body: reviewObject.body,
                rating: reviewObject.rating,
                section: reviewObject.section,
                forID: reviewObject.forID,
                timeStamp: timeNow
            } },
            { returnDocument: 'after' }
        );
        if (!reviewToUpdate.modifiedCount ) throw (`Could not update review with id of ${reviewObject._id}`);
        return true;
    },
    async deleteReview(id){
        //parameter check and delete
        if(!id) throw (`No review ID found`);
        id= await validationFunctions.validObjectId(id, "reviewID");
        const reviewsCollection = await reviews();
        const deletionInfo = await reviewsCollection.deleteOne({ _id: new ObjectId(id) });
        if (deletionInfo.deletedCount === 0) throw (`Could not delete review with id of ${id}`);
        return true;
    },
    async getAllReviews(forID, section){
        //basic checks like we must do in life
        if(!forID) throw (`No media ID found`);
        if(!section) throw (`No section found`);
        forID= await validationFunctions.validString(forID, "forID");
        section= await validationFunctions.validString(section, "section");
        section= section.toLowerCase();
        if(section !== 'show' || section !== 'movie' || section !== 'book' || section !== 'd&d') throw (`Section must be one of the following: show, movie, book, d&d`);
        //grab the reviews for a particular piece of media
        const reviewsCollection = await reviews();
        const reviewList = await reviewsCollection.find({forID: forID, section: section}).toArray();
        if (reviewList.length===0){
            return `There are no reviews`;
        }
        //well there are no usernames, and who should we flame for such a poor review
        const posterIDs = reviewList.map(review => review.posterID);
        const posterObjectIDs = posterIDs.map(id => new ObjectId(id));
        //grab user names
        const accountsCollection = await accounts();
        const accountList = await accountsCollection.find({
            _id: { $in: posterObjectIDs } 
          }, {
            projection: { username: 1 }
          }).toArray();
        if(accountList.length===0){
            return `Not sure how there were no usernames, but there are no usernames`;
        }
        const accountMap = new Map();
        accountList.forEach(account => {
            accountMap.set(account._id.toString(), account.username);
        });
        //adding usernames to the reviews
        const reviewListWithUsernames = reviewList.map(review => ({
            ...review,
            username: accountMap.get(review.posterID.toString()) || 'Deleted User'
        }));
        return reviewListWithUsernames;
    },
    //also don't know if this is useful but ge all reviews for a user
    async getReviewsForAUser(posterID){
        if(!posterID) throw (`No poster ID found`);
        posterID= await validationFunctions.validObjectId(posterID, "posterID");
        //grab all the user's reviews
        const reviewsCollection = await reviews();
        const reviewList = await reviewsCollection.find({posterID: posterID}).toArray();
        if (reviewList.length===0){
            return `There are no reviews`;
        }
        //grab this user's username
        const accountsCollection = await accounts();
        const accountInfo= await accountsCollection.findOne({
            _id: new ObjectId(posterID) 
          }, {
            projection: { username: 1 }})
        if(!accountInfo){
            return 'Not really sure how there is no username, but there is no username';
        }
        const accountName= accountInfo.username;
        //adding usernames to the reviews
        const reviewListWithUsernames = reviewList.map(review => ({
            ...review,
            username: accountName
        }));
        return reviewListWithUsernames;
    }
}

export default reviewsDataFunctions;