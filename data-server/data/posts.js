import { posts } from "../config/mongoCollections";
import accountsDataFunctions from "./accounts";
import validationFunctions from "../validation/validation";
import idValidationFunctions from "../validation/id_validation";
import { ObjectId } from "mongodb";

const postsDataFunctions = {
    async createPost(title, posterID, section, body, images) {
        /*
            title: string
            posterID: string
            section: string
            body: string (url, optional)
            likes: int (0)
            dislikes: int (0)
            images: Array<string> (urls, optional)
        */
        title = await validationFunctions.validString(title, "Post title");
        posterID = await idValidationFunctions.validObjectId(posterID, "Poster Account ID");
        section = await validationFunctions.validSection(section);
        body = await validationFunctions.validPostBody(body);
        images = images.map(async (imageURL) => await validationFunctions.validURL(imageURL, 'Image URL'));

        const postCol = await posts();
        if(!postCol) throw 'Failed to connect to post database';

        const newPost = {
            title: title,
            posterID: posterID,
            section: section,
            body: body,
            likes: 0,
            dislikes: 0,
            images: images
        }

        const creationInfo = await postCol.insertOne(newPost);
        if (!creationInfo.acknowledged || !creationInfo.insertedId) throw 'Could not create post';
        postID = creationInfo.insertedId.toString();

        // add post to poster account's post array
        await accountsDataFunctions.addPostToAccount(posterID, postID)

        return postID;
    },

    async deletePost(id){
        id = await idValidationFunctions(id, "Post ID");

        const postCol = await posts();
        if(!postCol) throw 'Failed to connect to post database';
        const deletedPost = await postCol.findOneAndDelete({_id: new ObjectId(id)});
        if (!deletedPost) throw 'Could not delete post';
        // remove post from poster account's post array
        await accountsDataFunctions.removePostFromAccount(deletedPost.posterID, id);
    },

    async deletePostUnstable(id){
        // deletes post from database without removing itself from poster's post array, used for deleting accounts
        id = await idValidationFunctions(id, "Post ID");
        const postCol = await posts();
        if(!postCol) throw 'Failed to connect to post database';
        const deletionInfo = await postCol.deleteOne({_id: new ObjectId(id)});
        if (!deletionInfo.deletedCount === 0) throw 'Could not delete post';
        return id;
    }
}

export default postsDataFunctions;