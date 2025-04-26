import { reviews, accounts } from "../config/mongoCollections.js";
import validationFunctions from "../validation/validation.js";
import booksDataFunctions from "../data/booksData.js";
import moviesDataFunctions from "../data/moviesData.js";
import showsDataFunctions from "../data/showsData.js";
const reviewsDataFunctions = {
    async createReview(posterID, body, rating, section, forID){
        if(!posterID) throw (`No User ID found`);
        if(!body) throw (`No review body text found`);
        if(!rating) throw (`No rating found`);
        if(!section) throw (`No section found`);
        if(!forID) throw (`No media ID found`);
        posterID= await validationFunctions.validObjectId(posterID, "posterID");
        body= await validationFunctions.validString(body, "body");
        section= await validationFunctions.validSection(reviewObject.section);
        forID= await validationFunctions.validString(forID, "forID");
        if(typeof rating !== 'number' && rating<1 || rating>10) throw (`Rating must be a number between 1 and 10`);
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

    async updateReview(id, reviewObject){
        //check to see if the review object is valid
        if(!id) throw (`No review ID found`);
        id= await validationFunctions.validObjectId(id, "Review ID");

        if(!reviewObject) throw (`No review object found`);
        if(typeof reviewObject !== 'object') throw (`Review object must be an object`);
        if(Array.isArray(reviewObject)) throw (`Review object must not be an array`);

        if(reviewObject.posterID){
            reviewObject.posterID= await validationFunctions.validObjectId(reviewObject.posterID, "posterID");
        }
        if(reviewObject.forID){
            reviewObject.forID= await validationFunctions.validString(reviewObject.forID, "forID");
        }
        if(reviewObject.body){
            reviewObject.body= await validationFunctions.validString(reviewObject.body, "body");
        }
        if(reviewObject.rating){
            if(typeof reviewObject.rating !== 'number' && reviewObject.rating<1 || reviewObject.rating>10) throw (`Rating must be a number between 1 and 10`);
        }
        if(reviewObject.section){
            reviewObject.section= await validationFunctions.validSection(reviewObject.section);
        }
        //run validation checks
        //I am not sure if all these fields are required, but I am going to assume they are for now
        //grab the review to update
        let timeNow = new Date();
        reviewObject.timeStamp= timeNow.toString();
        const reviewsCollection = await reviews();
        const reviewToUpdate = await reviewsCollection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set:reviewObject}, 
            { returnDocument: 'after' }
        );
        if (!reviewToUpdate.modifiedCount ) throw (`Could not update review with id of ${id}`);
        return true;
    },
    async deleteReview(id){
        //parameter check and delete
        if(!id) throw (`No review ID found`);
        id= await validationFunctions.validObjectId(id, "Review ID");
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
        if(section !== 'show' && section !== 'movie' && section !== 'book' && section !== 'd&d') throw (`Section must be one of the following: show, movie, book, d&d`); // Michael - fixed logic from || to &&
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
    },
    async mostPopularMovies(n=20){
        //grab all the reviews for movies
        
        const reviewsCollection = await reviews();
        const ratedMovies  = await reviewsCollection().aggregate([
            {
              $match: {
                section: "movie" // Only include movie
              }
            },
            {
              $group: {
                _id: "$forID", // Group by the ID
                averageRating: { $avg: "$rating" }, // Calculate average rating
                reviewCount: { $sum: 1 } // Count the number of reviews
              }
            },
            {
              $sort: {                 
                averageRating: -1, // Sort by highest average rating
                reviewCount: -1 // Secondary sort by number of reviews
                }            
            },
            {
                $limit:n
            }
          ]).toArray();
          const movieCards = await Promise.all(
            ratedMovies.map(async (movie) => {
                try {
                    const movieCard = await moviesDataFunctions.getMovieCard(movie._id);
                    return {
                        ...movieCard,
                        //we can get rid of the forID field i am just keeping it there in case
                        forID: movie._id,
                        averageRating: movie.averageRating.toFixed(1), // Round the averageRating to the first decimal
                        reviewCount: movie.reviewCount
                    };
                } catch (e) {
                    throw (`Failed to fetch movie ${movie._id}:`, e);
                }
            })
        );
        // In case there are any bad movie cards, filter them out
        return movieCards.filter(card => card !== null);
    },
    async mostPopularShows(n=20){
        const reviewsCollection = await reviews();
        const ratedShows  = await reviewsCollection().aggregate([
            {
              $match: {
                section: "show" // Only include movie
              }
            },
            {
              $group: {
                _id: "$forID", // Group by the ID
                averageRating: { $avg: "$rating" }, // Calculate average rating
                reviewCount: { $sum: 1 } // Count the number of reviews
              }
            },
            {
              $sort: {                 
                averageRating: -1, // Sort by highest average rating
                reviewCount: -1 // Secondary sort by number of reviews
                }            
            },
            {
                $limit:n
            }
          ]).toArray();
          const showCards = await Promise.all(
            ratedShows.map(async (show) => {
                try {
                    const showCard = await showsDataFunctions.getShowCard(show._id);
                    return {
                        ...showCard,
                        //we can get rid of the forID field i am just keeping it there in case
                        forID: show._id,
                        averageRating: show.averageRating.toFixed(1), // Round the averageRating to the first decimal
                        reviewCount: show.reviewCount
                    };
                } catch (e) {
                    throw(`Failed to fetch show ${show._id}:`, e);
                }
            })
        );
        // In case there are any bad show cards, filter them out
        return showCards.filter(card => card !== null);
    },
    async mostPopularBooks(n=20){
        const reviewsCollection = await reviews();
        const ratedBooks  = await reviewsCollection().aggregate([
            {
              $match: {
                section: "book" // Only include movie
              }
            },
            {
              $group: {
                _id: "$forID", // Group by the ID
                averageRating: { $avg: "$rating" }, // Calculate average rating
                reviewCount: { $sum: 1 } // Count the number of reviews
              }
            },
            {
              $sort: {                 
                averageRating: -1, // Sort by highest average rating
                reviewCount: -1 // Secondary sort by number of reviews
                }            
            },
            {
                $limit:n
            }
          ]).toArray();
          const bookCards = await Promise.all(
            ratedBooks.map(async (book) => {
                try {
                    const bookCard = await booksDataFunctions.getBookCard(book._id);
                    return {
                        ...bookCard,
                        //we can get rid of the forID field i am just keeping it there in case
                        forID: book._id,
                        averageRating: book.averageRating.toFixed(1), // Round the averageRating to the first decimal
                        reviewCount: book.reviewCount
                    };
                } catch (e) {
                    throw(`Failed to fetch book ${book._id}:`, e);
                }
            })
        );
        // In case there are any bad show cards, filter them out
        return bookCards.filter(card => card !== null);
    },
}

export default reviewsDataFunctions;