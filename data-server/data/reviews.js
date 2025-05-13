import { reviews, accounts } from "../config/mongoCollections.js";
import validationFunctions from "../validation/validation.js";
import idValidationFunctions from "../validation/id_validation.js";
import booksDataFunctions from "../data/booksData.js";
import moviesDataFunctions from "../data/moviesData.js";
import showsDataFunctions from "../data/showsData.js";
import { movieRec, showRec, bookRec } from "../config/recRaccoon.js";
import { ObjectId } from "mongodb";

import redis from 'redis';
const redis_client = redis.createClient();
await redis_client.connect();
import { cacheObjectArray, getCachedObjectArray} from "../helpers/cache_helpers.js";

const reviewsDataFunctions = {
    async getReview(id){
        //check to see if the review object is valid
        if(!id) throw (`No review ID found`);
        id= await idValidationFunctions.validObjectId(id, "Review ID");

        const reviewsCollection = await reviews();
        if(!reviewsCollection) throw 'Failed to connect to review database';
        const reviewFound = await reviewsCollection.findOne({ _id: new ObjectId(id) });
        if (!reviewFound) throw 'Review not found';

        return reviewFound;
    },

    async createReview(posterID, body, rating, section, forID){
        if(!posterID) throw (`No User ID found`);
        if(!body) throw (`No review body text found`);
        if(!rating) throw (`No rating found`);
        if(!section) throw (`No section found`);
        if(!forID) throw (`No media ID found`);
        posterID= await idValidationFunctions.validObjectId(posterID, "posterID");
        body= await validationFunctions.validString(body, "body");
        section= await validationFunctions.validSection(section);
        if (section === 'dnd') throw 'Cannot write a review for D&D media'
        forID= await validationFunctions.validString(forID, "forID");
        if(typeof rating !== 'number' && rating<1 || rating>10) throw (`Rating must be a number between 1 and 10`);

        // check if user already wrote a review for this forID
        const reviewsCollection = await reviews();
        const reviewFound = await reviewsCollection.findOne({posterID: posterID, forID: forID});
        if (reviewFound) throw 'You can only write one review for this piece of media. Try editing your existing review.'

        let timeNow = new Date();
        const reviewToAdd={
            posterID: posterID,
            body: body,
            rating: rating,
            section: section,
            forID: forID,
            timeStamp: timeNow.toUTCString()
        }
        const insertInfo = await reviewsCollection.insertOne(reviewToAdd);
        if (insertInfo.insertedCount === 0) throw (`Could not add review`);
        const newId = insertInfo.insertedId.toString();

        // delete related cache entries
        await redis_client.del(`reviews/${section}/${forID}`);
        await redis_client.del(`reviews/topMoviesFor/${posterID}`)
        await redis_client.del(`reviews/topBooksFor/${posterID}`)
        await redis_client.del(`reviews/topShowsFor/${posterID}`)

        // update recommendation info
        switch (section){
            case 'movie':
                if (rating > 5) await movieRec.liked(posterID, forID);
                break;
            case 'book':
                if (rating > 5) await bookRec.liked(posterID, forID);
                break;
            case 'show':
                if (rating > 5) await showRec.liked(posterID, forID);
                break;
            default:
                throw 'Unknown section encountered, this should not be possible.';
        }

        return newId;
    },

    async updateReview(id, reviewObject){
        //check to see if the review object is valid
        if(!id) throw (`No review ID found`);
        id= await idValidationFunctions.validObjectId(id, "Review ID");

        if(!reviewObject) throw (`No review object found`);
        if(typeof reviewObject !== 'object') throw (`Review object must be an object`);
        if(Array.isArray(reviewObject)) throw (`Review object must not be an array`);

        if(reviewObject.posterID){
            throw 'Cannot update the poster of a review'
        }
        if(reviewObject.forID){
            throw 'Cannot update the subject of a review'
        }
        if(reviewObject.body){
            reviewObject.body= await validationFunctions.validString(reviewObject.body, "body");
        }
        if(reviewObject.rating){
            if(typeof reviewObject.rating !== 'number' && reviewObject.rating<1 || reviewObject.rating>10) throw (`Rating must be a number between 1 and 10`);
        }
        if(reviewObject.section){
            throw 'Cannot update the subject of a review'
        }
        //run validation checks
        //I am not sure if all these fields are required, but I am going to assume they are for now
        //grab the review to update
        let timeNow = new Date();
        reviewObject.timeStamp= timeNow.toUTCString()
        const reviewsCollection = await reviews();
        const reviewToUpdate = await reviewsCollection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set:reviewObject}, 
            { returnDocument: 'after' }
        );
        if (!reviewToUpdate) throw (`Could not update review with id of ${id}`);

        // delete related cache entries
        await redis_client.del(`reviews/${reviewToUpdate.section}/${reviewToUpdate.forID}`);
        await redis_client.del(`reviews/topMoviesFor/${reviewToUpdate.posterID}`)
        await redis_client.del(`reviews/topBooksFor/${reviewToUpdate.posterID}`)
        await redis_client.del(`reviews/topShowsFor/${reviewToUpdate.posterID}`)

        // update recommendation info
        if (reviewObject.rating && reviewObject.rating !== reviewToUpdate.rating) {
            switch (reviewToUpdate.section){
                case 'movie':
                    if (reviewObject.rating <= 5 && reviewToUpdate.rating > 5) await movieRec.liked(reviewToUpdate.posterID, reviewToUpdate.forID);
                    else if (reviewObject.rating > 5 && reviewToUpdate.rating <= 5) await movieRec.unliked(reviewToUpdate.posterID, reviewToUpdate.forID);
                    break;
                case 'book':
                    if (reviewObject.rating <= 5 && reviewToUpdate.rating > 5) await bookRec.liked(reviewToUpdate.posterID, reviewToUpdate.forID);
                    else if (reviewObject.rating > 5 && reviewToUpdate.rating <= 5) await movieRec.unliked(reviewToUpdate.posterID, reviewToUpdate.forID);
                    break;
                case 'show':
                    if (reviewObject.rating <= 5 && reviewToUpdate.rating > 5) await showRec.liked(reviewToUpdate.posterID, reviewToUpdate.forID);
                    else if (reviewObject.rating > 5 && reviewToUpdate.rating <= 5) await movieRec.unliked(reviewToUpdate.posterID, reviewToUpdate.forID);
                    break;
                default:
                    throw 'Unknown section encountered, this should not be possible.';
            }
        }

        return true;
    },
    async deleteReview(id){
        //parameter check and delete
        if(!id) throw (`No review ID found`);
        id= await idValidationFunctions.validObjectId(id, "Review ID");
        const reviewsCollection = await reviews();
        const deletedReview = await reviewsCollection.findOneAndDelete({ _id: new ObjectId(id) });
        if (!deletedReview) throw (`Could not delete review with id of ${id}`);

        // delete related cache entries
        await redis_client.del(`reviews/${deletedReview.section}/${deletedReview.forID}`);
        await redis_client.del(`reviews/topMoviesFor/${deletedReview.posterID}`)
        await redis_client.del(`reviews/topBooksFor/${deletedReview.posterID}`)
        await redis_client.del(`reviews/topShowsFor/${deletedReview.posterID}`)

        // update recommendation info
        switch (deletedReview.section){
            case 'movie':
                if (deletedReview.rating > 5) await movieRec.unliked(deletedReview.posterID, deletedReview.forID);
                break;
            case 'book':
                if (deletedReview.rating > 5) await bookRec.unliked(deletedReview.posterID, deletedReview.forID);
                break;
            case 'show':
                if (deletedReview.rating > 5) await showRec.unliked(deletedReview.posterID, deletedReview.forID);
                break;
            default:
                throw 'Unknown section encountered, this should not be possible.';
        }

        return true;
    },

    async getAccountTopMovies(posterID){
        // returns the 10 highest rated movies for an account based on their written reviews
        if(!posterID) throw (`No User ID found`);
        posterID = await idValidationFunctions.validObjectId(posterID, "posterID");

        // check cache
        const cacheKey = `reviews/topMoviesFor/${posterID}`;
        const checkCache = await redis_client.exists(cacheKey);
        if (checkCache) {
            const cacheData = await getCachedObjectArray(cacheKey);
            return cacheData;
        }

        const reviewsCollection = await reviews();
        if(!reviewsCollection) throw 'Failed to connect to post database';
        let reviewList = await reviewsCollection.aggregate([
            { $match: {posterID: posterID, section: "movie"} },
            { $sort: {rating: -1} },
            { $limit: 10 },
            { $project: {_id: 0, forID: 1}}
        ]).toArray();
        if (!reviewList) throw 'Could not get account\'s top movies';

        const movieCards = await Promise.all(reviewList.map(async (review) => await moviesDataFunctions.getMovieCard(review.forID)));

        // cache data
        await cacheObjectArray(cacheKey, movieCards);
        
        return movieCards;
    },

    async getAccountTopBooks(posterID){
        // returns the 10 highest rated books for an account based on their written reviews
        if(!posterID) throw (`No User ID found`);
        posterID = await idValidationFunctions.validObjectId(posterID, "posterID");

        // check cache
        const cacheKey = `reviews/topBooksFor/${posterID}`;
        const checkCache = await redis_client.exists(cacheKey);
        if (checkCache) {
            const cacheData = await getCachedObjectArray(cacheKey);
            return cacheData;
        }

        const reviewsCollection = await reviews();
        if(!reviewsCollection) throw 'Failed to connect to post database';
        let reviewList = await reviewsCollection.aggregate([
            { $match: {posterID: posterID, section: "book"} },
            { $sort: {rating: -1} },
            { $limit: 10 },
            { $project: {_id: 0, forID: 1}}
        ]).toArray();
        if (!reviewList) throw 'Could not get account\'s top books';

        const bookCards = await Promise.all(reviewList.map(async (review) => await booksDataFunctions.getBookCard(review.forID)));

        // cache data
        await cacheObjectArray(cacheKey, bookCards);
        
        return bookCards;
    },

    async getAccountTopShows(posterID){
        // returns the 10 highest rated shows for an account based on their written reviews
        if(!posterID) throw (`No User ID found`);
        posterID = await idValidationFunctions.validObjectId(posterID, "posterID");

        // check cache
        const cacheKey = `reviews/topShowsFor/${posterID}`;
        const checkCache = await redis_client.exists(cacheKey);
        if (checkCache) {
            const cacheData = await getCachedObjectArray(cacheKey);
            return cacheData;
        }

        const reviewsCollection = await reviews();
        if(!reviewsCollection) throw 'Failed to connect to post database';
        let reviewList = await reviewsCollection.aggregate([
            { $match: {posterID: posterID, section: "show"} },
            { $sort: {rating: -1} },
            { $limit: 10 },
            { $project: {_id: 0, forID: 1}}
        ]).toArray();
        if (!reviewList) throw 'Could not get account\'s top shows';

        const showCards = await Promise.all(reviewList.map(async (review) => await showsDataFunctions.getShowCard(review.forID)));

        // cache data
        await cacheObjectArray(cacheKey, showCards);
        
        return showCards;
    },

    async getAllReviews(forID, section){
        //basic checks like we must do in life
        if(!forID) throw (`No media ID found`);
        if(!section) throw (`No section found`);
        forID= await validationFunctions.validString(forID, "forID");
        section= await validationFunctions.validString(section, "section");
        section= section.toLowerCase();
        if(section !== 'show' && section !== 'movie' && section !== 'book' && section !== 'd&d') throw (`Section must be one of the following: show, movie, book, d&d`); // Michael - fixed logic from || to &&
        
        // check cache
        const cacheKey = `reviews/${section}/${forID}`;
        const checkCache = await redis_client.exists(cacheKey);
        if (checkCache) {
            const cacheData = await getCachedObjectArray(cacheKey);
            return cacheData;
        }
        
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
            projection: { username: 1, profilePic: 1 }
          }).toArray();
        if(accountList.length===0){
            return `Not sure how there were no usernames, but there are no usernames`;
        }
        const accountMap = new Map();
        // When populating the accountMap, store an object with both username and profilePic
        accountList.forEach(account => {
            accountMap.set(account._id.toString(), {
                username: account.username,
                profilePic: account.profilePic
            });
        });

        // When creating reviewListWithUsernames, include both username and profilePic
        const reviewListWithUsernames = reviewList.map(review => {
            const accountInfo = accountMap.get(review.posterID.toString()) || { 
                username: 'Deleted User', 
                profilePic: null
            };
            return {
                ...review,
                username: accountInfo.username,
                profilePic: accountInfo.profilePic
            };
});

        // cache data
        await cacheObjectArray(cacheKey, reviewListWithUsernames);

        return reviewListWithUsernames;
    },
    //also don't know if this is useful but ge all reviews for a user
    async getReviewsForAUser(posterID){
        if(!posterID) throw (`No poster ID found`);
        posterID= await idValidationFunctions.validObjectId(posterID, "posterID");
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
        const ratedMovies  = await reviewsCollection.aggregate([
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
        const ratedShows  = await reviewsCollection.aggregate([
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
        const ratedBooks  = await reviewsCollection.aggregate([
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