import { posts } from "../config/mongoCollections.js";
import accountsDataFunctions from "./accounts.js";
import validationFunctions from "../validation/validation.js";
import idValidationFunctions from "../validation/id_validation.js";
import { ObjectId } from "mongodb";

import redis from 'redis';
const redis_client = redis.createClient();
await redis_client.connect();
import { cacheObjectArray, getCachedObjectArray} from "../helpers/cache_helpers.js";

const recentPostsAllCacheKey = 'recentPostCardsAll';
const recentPostsSectionCacheKeys = {
    'show': 'recentPostCardsBooks',
    'book': 'recentPostCardsShows',
    'movie': 'recentPostCardsMovies',
    'dnd': 'recentPostCardsDnD'
}

const postsDataFunctions = {
    async getPost(id) {
        id = await idValidationFunctions.validObjectId(id, "Post ID");

        // check cache
        const cacheKey = `post/${id}`;
        const checkCache = await redis_client.exists(cacheKey);
        if (checkCache) {
            const cacheData = await redis_client.get(cacheKey);
            return JSON.parse(cacheData);
        }

        const postCol = await posts();
        if(!postCol) throw 'Failed to connect to post database';
        const postFound = await postCol.findOne({_id: new ObjectId(id)});
        if (!postFound) throw 'Post not found';

        // cache data
        await redis_client.set(cacheKey, JSON.stringify(postFound));

        return postFound;
    },

    async getPostCard(id) {
        id = await idValidationFunctions.validObjectId(id, "Post ID");

        // check cache
        const cacheKey = `post/card/${id}`;
        const checkCache = await redis_client.exists(cacheKey);
        if (checkCache) {
            const cacheData = await redis_client.get(cacheKey);
            return JSON.parse(cacheData);
        }

        const postCol = await posts();
        if(!postCol) throw 'Failed to connect to post database';
        const postFound = await postCol.findOne({_id: new ObjectId(id)}, {projection: {_id: 1, title: 1, posterID: 1, likes: 1}});
        if (!postFound) throw 'Post not found';

        const poster = await accountsDataFunctions.getAccount(postFound.posterID);
        const returnInfo = {
            _id: postFound._id,
            title: postFound.title,
            posterUsername: poster.username,
            posterProfilePic: poster.profilePic,
            likes: postFound.likes
        };

        // cache data
        await redis_client.set(cacheKey, JSON.stringify(returnInfo));

        return returnInfo;
    },

    async createPost(title, posterID, section, body, images) {
        /*
            title: string
            posterID: string
            section: string
            body: string (url, optional)
            likes: int (0)
            dislikes: int (0)
            images: Array<string> (urls, optional)
            timeStamp: string (Date.toUTCString)
        */
        title = await validationFunctions.validString(title, "Post title");
        posterID = await idValidationFunctions.validObjectId(posterID, "Poster Account ID");
        section = await validationFunctions.validSection(section);
        body = await validationFunctions.validPostBody(body);
        images = await Promise.all(images.map(async (imageURL) => await validationFunctions.validURL(imageURL, 'Image URL')));

        // check if the poster account exists
        await accountsDataFunctions.getAccountCard(posterID);

        const postCol = await posts();
        if(!postCol) throw 'Failed to connect to post database';

        let timeNow = new Date();
        const newPost = {
            title: title,
            posterID: posterID,
            section: section,
            body: body,
            likes: 0,
            dislikes: 0,
            images: images,
            timeStamp: timeNow.toUTCString()
        }

        const creationInfo = await postCol.insertOne(newPost);
        if (!creationInfo.acknowledged || !creationInfo.insertedId) throw 'Could not create post';
        let postID = creationInfo.insertedId.toString()
        // add post to poster account's post array
        await accountsDataFunctions.addPostToAccount(posterID, postID)

        // delete related cache entries
        await redis_client.del(`post/by/${posterID}`);
        await redis_client.del(recentPostsAllCacheKey);
        await redis_client.del(recentPostsSectionCacheKeys[section]);

        return postID;
    },

    async deletePost(id){
        id = await idValidationFunctions.validObjectId(id, "Post ID");

        const postCol = await posts();
        if(!postCol) throw 'Failed to connect to post database';
        const deletedPost = await postCol.findOneAndDelete({_id: new ObjectId(id)});
        if (!deletedPost) throw 'Could not delete post';
        // remove post from poster account's post array
        await accountsDataFunctions.removePostFromAccount(deletedPost.posterID, id);

        // delete related cache entries
        await redis_client.del(`post/${id}`);
        await redis_client.del(`post/card/${id}`);
        await redis_client.del(`post/by/${deletedPost.posterID}`);
        await redis_client.del(recentPostsAllCacheKey);
        await redis_client.del(recentPostsSectionCacheKeys[deletedPost.section]);

        return true;
    },

    async deletePostUnstable(id){
        // deletes post from database without removing itself from poster's post array, used for deleting accounts
        id = await idValidationFunctions.validObjectId(id, "Post ID");

        const postCol = await posts();
        if(!postCol) throw 'Failed to connect to post database';
        const deletedPost = await postCol.findOneAndDelete({_id: new ObjectId(id)});
        if (!deletedPost) throw 'Could not delete post';

        // delete related cache entries
        await redis_client.del(`post/${id}`);
        await redis_client.del(`post/card/${id}`);
        await redis_client.del(`post/by/${deletedPost.posterID}`);
        await redis_client.del(recentPostsAllCacheKey);
        await redis_client.del(recentPostsSectionCacheKeys[deletedPost.section]);

        return true;
    },

    async updatePost(id, updateObject){
        id = await idValidationFunctions.validObjectId(id, "Post ID");
        if (updateObject.title) updateObject.title = await validationFunctions.validString(updateObject.title, "Post title");
        if (updateObject.section) updateObject.section = await validationFunctions.validSection(updateObject.section);
        if (updateObject.body) updateObject.body = await validationFunctions.validPostBody(updateObject.body);
        if (updateObject.images) updateObject.images = await Promise.all(updateObject.images.map(async (imageURL) => await validationFunctions.validURL(imageURL, 'Image URL')));

        const postCol = await posts();
        if(!postCol) throw 'Failed to connect to post database';
        const postFound = await this.getPost(id);

        let timeNow = new Date();
        updateObject.timeStamp = timeNow.toUTCString();
        const updateInfo = await postCol.updateOne({_id: new ObjectId(id)}, {$set: updateObject});
        if (!updateInfo.acknowledged  || updateInfo.modifiedCount === 0) throw 'Could not update post';

        // delete related cache entries
        await redis_client.del(`post/${id}`);
        await redis_client.del(`post/card/${id}`);
        await redis_client.del(`post/by/${postFound.posterID}`);
        await redis_client.del(recentPostsAllCacheKey);
        await redis_client.del(recentPostsSectionCacheKeys[postFound.section]);

        return true;
    },

    async toggleLikePost(postID, accountID){
        // checks if the account liked the post, if so removes like, if not likes post. updates appropriate fields
        // if account disliked the post, also removes dislike
        // returns {status: _} such that status is one of ['likes', 'dislikes', 'none']
        postID = await idValidationFunctions.validObjectId(postID, "Post ID");
        accountID = await idValidationFunctions.validObjectId(accountID, "Account ID");

        const postCol = await posts();
        if(!postCol) throw 'Failed to connect to post database';
        const postFound = await postCol.findOne({_id: new ObjectId(postID)}, {projection: {_id: 1, posterID: 1, likes: 1}});
        if (!postFound) throw 'Post not found';

        let returnStatus = {status: null};

        const poster = await accountsDataFunctions.getAccount(postFound.posterID);
        if (poster.likedPosts.includes(postID)){
            // user has liked post, set status to none
            returnStatus.status = 'none';
        } else {
            if (poster.dislikedPosts.includes(postID)) {
                // user has disliked post, remove dislike
                await accountsDataFunctions.toggleDislikedPost(accountID, postID);
                await postCol.findOneAndUpdate({_id: new ObjectId(postID)}, {$inc: {dislikes: -1}})
            }
            // user has has not liked post, set status to likes
            returnStatus.status = 'likes';
        }

        let updateLike;
        if (returnStatus.status == 'none') { // decrease likes
            if (postFound.likes == 0) { // Prevent negative likes
                updateLike = 0
            } else {
                updateLike = -1
            }
        } else if (returnStatus.status == 'likes') { // increase likes
            updateLike = 1
        }
        await postCol.findOneAndUpdate({_id: new ObjectId(postID)}, {$inc: {likes: updateLike}})

        // toggle liked status for post
        await accountsDataFunctions.toggleLikedPost(accountID, postID);

        // delete related cache entries
        await redis_client.del(`post/${postID}`);
        await redis_client.del(`post/card/${postID}`);
        await redis_client.del(`post/by/${postFound.posterID}`);
        await redis_client.del(recentPostsAllCacheKey);
        //if (await redis_client.exists(recentPostsSectionCacheKeys[postFound.section])) await redis_client.del(recentPostsSectionCacheKeys[postFound.section]);
        

        return returnStatus.status;
    },

    async toggleDislikePost(postID, accountID){
        // checks if the account disliked the post, if so removes dislike, if not dislikes post. updates appropriate fields
        // if account liked the post, also removes like
        // returns {status: _} such that status is one of ['likes', 'dislikes', 'none']
        postID = await idValidationFunctions.validObjectId(postID, "Post ID");
        accountID = await idValidationFunctions.validObjectId(accountID, "Account ID");

        const postCol = await posts();
        if(!postCol) throw 'Failed to connect to post database';
        const postFound = await postCol.findOne({_id: new ObjectId(postID)}, {projection: {_id: 1, posterID: 1, dislikes: 1}});
        if (!postFound) throw 'Post not found';

        let returnStatus = {status: null};
        const poster = await accountsDataFunctions.getAccount(postFound.posterID);
        if (poster.dislikedPosts.includes(postID)) {
            // user has disliked post, set status to none
            returnStatus.status = 'none';
        } else {
            if (poster.likedPosts.includes(postID)) {
                // user has liked post, remove like
                await accountsDataFunctions.toggleLikedPost(accountID, postID);
                await postCol.findOneAndUpdate({_id: new ObjectId(postID)}, {$inc: {likes: -1}})
            }
            // user has has not disliked post, set status to dislikes
            returnStatus.status = 'dislikes';
        }
        let updateDislike;
        if (returnStatus.status == 'none') { // decrease dislikes
            if (postFound.dislikes == 0) { // Prevent negative dislikes
                updateDislike = 0
            } else {
                updateDislike = -1
            }
        } else if (returnStatus.status == 'dislikes') { // increase dislikes
            updateDislike = 1
        }
        await postCol.findOneAndUpdate({_id: new ObjectId(postID)}, {$inc: {dislikes: updateDislike}})


        // toggle disliked status for post
        await accountsDataFunctions.toggleDislikedPost(accountID, postID);

        // delete related cache entries
        await redis_client.del(`post/${postID}`);
        await redis_client.del(`post/card/${postID}`);
        await redis_client.del(`post/by/${postFound.posterID}`);
        await redis_client.del(recentPostsAllCacheKey);
        //await redis_client.del(recentPostsSectionCacheKeys[postFound.section]);

        return returnStatus.status;
    },

    async getPopularPosts(n=20, section){
        // returns n posts with the highest like count
        // if section is given, only considers those with that section
        // when section is null/undefined, returns most popular posts of any section
        n = await validationFunctions.validPositiveNumber(n, 'Number of Posts');
        let matchCase = {};
        if (section) {
            matchCase.section = await validationFunctions.validSection(section);
        }

        const postCol = await posts();
        if(!postCol) throw 'Failed to connect to post database';
        let postsList = await postCol.aggregate([
            { $match: matchCase },
            { $sort: {likes: -1} },
            { $limit: n },
            { $project: {_id: 1}}
        ]).toArray();
        if (!postsList) throw 'Could not get popular posts';

        postsList = postsList.map((post) => post._id);
        postsList = await Promise.all(postsList.map(this.getPostCard));
        return postsList;
    },

    async getRecentPosts(n=20, section){
        // returns n posts with the most recent timeStamp
        // if section is given, only considers those with that section
        // when section is null/undefined, returns most popular posts of any section
        n = await validationFunctions.validPositiveNumber(n, 'Number of Posts');
        let cacheKey = recentPostsAllCacheKey;
        let matchCase = {};
        if (section) {
            matchCase.section = await validationFunctions.validSection(section);
            cacheKey = recentPostsSectionCacheKeys[matchCase.section];
        }

        // check cache
        const checkCache = await redis_client.exists(cacheKey);
        if (checkCache) {
            const cacheData = await getCachedObjectArray(cacheKey);
            return cacheData;
        }

        const postCol = await posts();
        if(!postCol) throw 'Failed to connect to post database';
        let postsList = await postCol.find(matchCase, {projection: {_id: 1, timeStamp: 1}}).toArray();
        if (!postsList) throw 'Could not get recent posts';

        postsList.sort((p1, p2) => new Date(p2.timeStamp) - new Date(p1.timeStamp));
        postsList = postsList.map((post) => post._id).slice(0, n);
        postsList = await Promise.all(postsList.map(this.getPostCard));

        // cache data
        await cacheObjectArray(cacheKey, postsList);

        return postsList;
    },

    async searchPostsByTitle(searchTerm, section){
        // returns posts
        // if section is given, only considers those with that section
        // when section is null/undefined, returns most popular posts of any section
        searchTerm = await validationFunctions.validString(searchTerm, 'Search term');
        let matchCase = {};
        if (section) {
            matchCase.section = await validationFunctions.validSection(section);
        }
        
        const postCol = await posts();
        if(!postCol) throw 'Failed to connect to post database';
        matchCase.title = {$regex: searchTerm, $options: "i"};
        let postsList = await postCol.find(matchCase, {projection: {_id: 1}}).toArray();
        if (!postsList) throw 'Could not search posts';
        if (postsList.length === 0) throw 'No posts found';

        postsList = postsList.map((post) => post._id);
        postsList = await Promise.all(postsList.map(this.getPostCard));
        return postsList;
    },
    
    async getPostsByAuthor(accountID){
        accountID = await idValidationFunctions.validObjectId(accountID, "Account ID");

        // check cache
        const cacheKey = `post/by/${accountID}`;
        const checkCache = await redis_client.exists(cacheKey);
        if (checkCache) {
            const cacheData = await getCachedObjectArray(cacheKey);
            return cacheData;
        }

        const postCol = await posts();
        if(!postCol) throw 'Failed to connect to post database';
        const postsList = await postCol.find({posterID: accountID}, {projection: {_id: 1, title: 1, section: 1}}).toArray();
        if (!postsList) throw 'Could not get posts by author';
        if (postsList.length === 0) throw 'No posts found';

        // cache data
        await cacheObjectArray(cacheKey, postsList);

        return postsList;
    }

}

export default postsDataFunctions;