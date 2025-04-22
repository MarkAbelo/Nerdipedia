import { accounts } from "../config/mongoCollections";
import { ObjectId } from "mongodb";
import validationFunctions from "../validation/validation";
import idValidationFunctions from "../validation/id_validation";
import { auth } from "../config/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import validSections from "../validation/validSections";

const accountsDataFunctions = {
    async getAccount(id){
        id = await idValidationFunctions.validObjectId(id, "Account ID");

        const accountCol = await accounts();
        if(!accountCol) throw 'Failed to connect to post database';
        const accountFound = await accountCol.findOne({_id: new ObjectId(id)});
        if (!accountFound) throw 'Account not found';
        return accountFound;
    },

    async createAccount(username, passwordHash, email, profilePic) {
        /*
            username: string
            passwordHash: string
            email: string
            profilePic: string (url, optional)
            posts: Array<string> (empty)
            topMovies: Array<string> (empty)
            topBooks: Array<string> (empty)
            topShows: Array<string> (empty)
            likedPosts: Array<string> (empty)
            dislikedPosts: Array<string> (empty)
        */
        // needs firebase auth integration

        //validate inputs
        email = validationFunctions.validEmail;
        

        //Make user in the MongoDB
        const newUser = {
            username,
            passwordHash,
            email,
            profilePic: profilePic || null,
            posts: [],
            topMovies: [],
            topShows: [],
            likedPosts: [],
            dislikedPosts: []
        };

        const insertResult = await accounts.insertOne(newUser);
        if (!insertResult.acknowledged) throw ("Failed to create MongoDB account");

        const monogUserId = insertResult.insertedId.toString();

        //create user in firebase auth
        const firebaseUserCredential = await createUserWithEmailAndPassword(auth, email, passwordHash);
        const firebaseUser = firebaseUserCredential.user;

        //store the accountID in Firebase (I'm putting it in displayName for now until we think of a better solution)
        await updateProfile(firebaseUser, {
            displayName: monogUserId
        });

        return {
            firebaseUid: firebaseUser.uid,
            monogUserId
        };
    },

    async addPostToAccount(accountID, postID) {
        // adds the postID to the account's posts list
        accountID = idValidationFunctions.validObjectId(accountID, 'Account ID');
        postID = idValidationFunctions.validObjectId(postID, 'Post ID');

        const accountCol = await accounts();
        if (!accountCol) throw 'Failed to connect to account database';
        const accountFound = await accountCol.findOne({_id: new ObjectId(accountID)});
        if (!accountFound) throw 'No account with that ID';

        const updateInfo = await accountCol.updateOne({_id: new ObjectId(accountID)}, {$push :{posts: postID}})
        if (!updateInfo.acknowledged || updateInfo.modifiedCount === 0) {
            throw 'Failed to add post to account info';
        }
        return true;
    },

    async removePostFromAccount(accountID, postID) {
        // removes the postID from the account's posts list
        accountID = idValidationFunctions.validObjectId(accountID, 'Account ID');
        postID = idValidationFunctions.validObjectId(postID, 'Post ID');

        const accountCol = await accounts();
        if (!accountCol) throw 'Failed to connect to account database';
        const accountFound = await accountCol.findOne({_id: new ObjectId(accountID)});
        if (!accountFound) throw 'No account with that ID';

        const updateInfo = await accountCol.updateOne({_id: new ObjectId(accountID)}, {$pull :{posts: postID}})
        if (!updateInfo.acknowledged || updateInfo.modifiedCount === 0) {
            throw 'Failed to remove post from account info';
        }
        return true;
    },

    async toggleLikedPost(accountID, postID) {
        // toggles the liked status of a post for an account
        accountID = idValidationFunctions.validObjectId(accountID, 'Account ID');
        postID = idValidationFunctions.validObjectId(postID, 'Post ID');

        const accountCol = await accounts();
        if (!accountCol) throw 'Failed to connect to account database';
        const accountFound = await accountCol.findOne({_id: new ObjectId(accountID)});
        if (!accountFound) throw 'No account with that ID';

        let updateInfo = null;
        if (accountFound.likedPosts.includes(postID)){
            // if postID is in liked posts, remove it
            updateInfo = await accountCol.updateOne({_id: new ObjectId(accountID)}, {$pull :{likedPosts: postID}})
        } else {
            // if not, add it
            updateInfo = await accountCol.updateOne({_id: new ObjectId(accountID)}, {$push :{likedPosts: postID}})
        }
        if (!updateInfo || !updateInfo.acknowledged || updateInfo.modifiedCount === 0) {
            throw 'Failed to update liked posts';
        }
        return true;
    },

    async toggleDislikedPost(accountID, postID) {
        // toggles the disliked status of a post for an account
        accountID = idValidationFunctions.validObjectId(accountID, 'Account ID');
        postID = idValidationFunctions.validObjectId(postID, 'Post ID');

        const accountCol = await accounts();
        if (!accountCol) throw 'Failed to connect to account database';
        const accountFound = await accountCol.findOne({_id: new ObjectId(accountID)});
        if (!accountFound) throw 'No account with that ID';

        let updateInfo = null;
        if (accountFound.dislikedPosts.includes(postID)){
            // if postID is in disliked posts, remove it
            updateInfo = await accountCol.updateOne({_id: new ObjectId(accountID)}, {$pull :{dislikedPosts: postID}})
        } else {
            // if not, add it
            updateInfo = await accountCol.updateOne({_id: new ObjectId(accountID)}, {$push :{dislikedPosts: postID}})
        }
        if (!updateInfo || !updateInfo.acknowledged || updateInfo.modifiedCount === 0) {
            throw 'Failed to update disliked posts';
        }
        return true;
    }

}

export default accountsDataFunctions;