import { posts } from "../config/mongoCollections";
import accountsDataFunctions from "./accounts";
import validationFunctions from "../validation/validation";
import idValidationFunctions from "../validation/id_validation";
import { ObjectId } from "mongodb";

const postsDataFunctions = {
    async getPost(id) {
        id = await idValidationFunctions.validObjectId(id, "Post ID");

        const postCol = await posts();
        if(!postCol) throw 'Failed to connect to post database';
        const postFound = await postCol.findOne({_id: new ObjectId(id)});
        if (!postFound) throw 'Post not found';
        return postFound;
    },

    async getPostCard(id) {
        id = await idValidationFunctions.validObjectId(id, "Post ID");

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
        images = images.map(async (imageURL) => await validationFunctions.validURL(imageURL, 'Image URL'));

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
        postID = creationInfo.insertedId.toString();
        // add post to poster account's post array
        await accountsDataFunctions.addPostToAccount(posterID, postID)

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
        return true;
    },

    async deletePostUnstable(id){
        // deletes post from database without removing itself from poster's post array, used for deleting accounts
        id = await idValidationFunctions.validObjectId(id, "Post ID");

        const postCol = await posts();
        if(!postCol) throw 'Failed to connect to post database';
        const deletionInfo = await postCol.deleteOne({_id: new ObjectId(id)});
        if (!deletionInfo || deletionInfo.deletedCount === 0) throw 'Could not delete post';
        return true;
    },

    async updatePost(id, updateObject){
        id = await idValidationFunctions.validObjectId(id, "Post ID");
        if (updateObject.title) updateObject.title = await validationFunctions.validString(updateObject.title, "Post title");
        if (updateObject.section) updateObject.section = await validationFunctions.validSection(updateObject.section);
        if (updateObject.body) updateObject.body = await validationFunctions.validPostBody(updateObject.body);
        if (updateObject.images) updateObject.images = updateObject.images.map(async (imageURL) => await validationFunctions.validURL(imageURL, 'Image URL'));

        const postCol = await posts();
        if(!postCol) throw 'Failed to connect to post database';
        await this.getPost(id);

        let timeNow = new Date();
        updateObject.timeStamp = timeNow.toUTCString();
        const updateInfo = await postCol.updateOne({_id: new ObjectId(id)}, {$set: updateObject});
        if (!updateInfo.acknowledged  || updateInfo.modifiedCount === 0) throw 'Could not update post';
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
        const postFound = await postCol.findOne({_id: new ObjectId(id)}, {projection: {_id: 1, posterID: 1}});
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
            }
            // user has has not liked post, set status to likes
            returnStatus.status = 'likes';
        }
        // toggle liked status for post
        await accountsDataFunctions.toggleLikedPost(accountID, postID);
        return returnStatus;
    },

    async toggleDislikePost(postID, accountID){
        // checks if the account disliked the post, if so removes dislike, if not dislikes post. updates appropriate fields
        // if account liked the post, also removes like
        // returns {status: _} such that status is one of ['likes', 'dislikes', 'none']
        postID = await idValidationFunctions.validObjectId(postID, "Post ID");
        accountID = await idValidationFunctions.validObjectId(accountID, "Account ID");

        const postCol = await posts();
        if(!postCol) throw 'Failed to connect to post database';
        const postFound = await postCol.findOne({_id: new ObjectId(id)}, {projection: {_id: 1, posterID: 1}});
        if (!postFound) throw 'Post not found';

        let returnStatus = {status: null};

        const poster = await accountsDataFunctions.getAccount(postFound.posterID);
        if (poster.dislikedPosts.includes(postID)){
            // user has disliked post, set status to none
            returnStatus.status = 'none';
        } else {
            if (poster.likedPosts.includes(postID)) {
                // user has liked post, remove like
                await accountsDataFunctions.toggleLikedPost(accountID, postID);
            }
            // user has has not disliked post, set status to dislikes
            returnStatus.status = 'dislikes';
        }
        // toggle disliked status for post
        await accountsDataFunctions.toggleDislikedPost(accountID, postID);
        return returnStatus;
    },

    async getPopularPosts(n=20, section){
        // returns n posts with the highest like count
        // if section is given, only considers those with that section
        // when section is null/undefined, returns most popular posts of any section
        n = await validationFunctions.validPostitiveNumber(n, 'Number of Posts');
        let matchCase = {};
        if (section) {
            section = await validationFunctions.validSection(section);
            matchCase.section = section;
        }

        const postCol = await posts();
        if(!postCol) throw 'Failed to connect to post database';
        let postsList = await postCol.aggregate([
            { $match: matchCase },
            { $sort: {likes: -1} },
            { $limit: n },
            { $project: {_id: 1}}
        ]).toArray();

        postsList = postsList.map((post) => post._id);
        postsList = await Promise.all(postsList.map(this.getPostCard));
        return postsList;
    },

    async getRecentPosts(n=20, section){
        // returns n posts with the most recent timeStamp
        // if section is given, only considers those with that section
        // when section is null/undefined, returns most popular posts of any section
        n = await validationFunctions.validPostitiveNumber(n, 'Number of Posts');
        let matchCase = {};
        if (section) {
            section = await validationFunctions.validSection(section);
            matchCase.section = section;
        }

        const postCol = await posts();
        if(!postCol) throw 'Failed to connect to post database';
        let postsList = await postCol.find(matchCase, {projection: {_id: 1, timeStamp: 1}}).toArray();

        postsList.sort((p1, p2) => new Date(p2.timeStamp) - new Date(p1.timeStamp));
        postsList = postsList.map((post) => post._id).slice(0, n);
        postsList = await Promise.all(postsList.map(this.getPostCard));
        return postsList;
    },

    async searchPostsByTitle(section){
        // returns posts
        // if section is given, only considers those with that section
        // when section is null/undefined, returns most popular posts of any section
        if (section) section = await validationFunctions.validSection(section);
    }

}

export default postsDataFunctions;