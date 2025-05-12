import { accounts } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import validationFunctions from "../validation/validation.js";
import idValidationFunctions from "../validation/id_validation.js";
import { admin } from "../config/firebaseAdmin.js";

import redis from 'redis';
import postsDataFunctions from "./posts.js";
import reviewsDataFunctions from "./reviews.js";
const redis_client = redis.createClient();
await redis_client.connect();

const accountsDataFunctions = {
    async getAccount(id) {
        id = await idValidationFunctions.validObjectId(id, "Account ID");
        // check cache
        const cacheKey = `account/${id}`;
        const checkCache = await redis_client.exists(cacheKey);
        if (checkCache) {
            const cacheData = await redis_client.get(cacheKey);
            return JSON.parse(cacheData);
        }

        const accountCol = await accounts();
        if(!accountCol) throw 'Failed to connect to post database';
        const accountFound = await accountCol.findOne({_id: new ObjectId(id)});
        if (!accountFound) throw 'Account not found';
        console.log(accountFound)
        // cache data
        await redis_client.set(cacheKey, JSON.stringify(accountFound));

        return accountFound;
    },

    async getAccountCard(id) {
        id = await idValidationFunctions.validObjectId(id, "Account ID");

        // check cache
        const cacheKey = `account/card/${id}`;
        const checkCache = await redis_client.exists(cacheKey);
        if (checkCache) {
            const cacheData = await redis_client.get(cacheKey);
            return JSON.parse(cacheData);
        }

        const accountCol = await accounts();
        if(!accountCol) throw 'Failed to connect to post database';
        const accountFound = await accountCol.findOne({_id: new ObjectId(id)}, {projection: {_id: 1, username: 1, profilePic: 1}});
        if (!accountFound) throw 'Account not found';

        // cache data
        await redis_client.set(cacheKey, JSON.stringify(accountFound));

        return accountFound;
    },

    async createAccount(username, password, email, profilePic=null) {
        /*
            username: string
            email: string
            firebaseUid: string
            profilePic: string (url, optional)
            posts: Array<string> (empty)
            likedPosts: Array<string> (empty)
            dislikedPosts: Array<string> (empty)
        */
        // needs firebase auth integration

        //validate inputs
        username = await validationFunctions.validString(username);
        email = await validationFunctions.validEmail(email);
        password = await validationFunctions.validPassword(password);
        if (profilePic) {
            profilePic = await validationFunctions.validURL(profilePic);
        }

        // Try create user in firebase auth BEFORE inserting to mongodb
        let firebaseUser
        try {
            const firebaseUserCredential = await admin.auth().createUser({
                email,
                password,
                displayName: username
            });
            firebaseUser = firebaseUserCredential;
        } catch (e) {
            console.log(e)
            throw e
        }

        const firebaseUid = firebaseUser.uid;
        //Passed Firebase, Make user in the MongoDB
        const newUser = {
            username,
            email,
            firebaseUid,
            profilePic: profilePic || null,
            posts: [],
            likedPosts: [],
            dislikedPosts: []
        };

        const accountCol = await accounts()
        const insertResult = await accountCol.insertOne(newUser);
        if (!insertResult.acknowledged) {
            //delete firebase user if mongo insert fails
            await admin.auth().deleteUser(firebaseUid);
            throw new Error("Failed to insert user into MongoDB");
        }

        const mongoUserId = insertResult.insertedId.toString();

        //store the accountID in Firebase (I'm putting it in displayName for now until we think of a better solution)
        await admin.auth().updateUser(firebaseUser.uid, { // Michael: added .uid
            displayName: mongoUserId
        });

        return {
            firebaseUid: firebaseUser.uid,
            mongoUserId
        };
    },

    async editAccount(accountID, newUsername, newPassword, newEmail, newProfilePic) {
        accountID = await idValidationFunctions.validObjectId(accountID, 'Account ID');

        const accountCol = await accounts();
        if (!accountCol) throw 'Failed to connect to account database';
        const accountFound = await accountCol.findOne({_id: new ObjectId(accountID)});
        if (!accountFound) throw 'No account found with that ID';

        //validating inputs for the edit if they exist

        if (newUsername) {
            newUsername = await validationFunctions.validString(newUsername);
        } else {
            newUsername = accountFound.username;
        }
        if (newEmail) {
            newEmail = await validationFunctions.validEmail(newEmail);
        } else {
            newEmail = accountFound.email;
        }
        if (newPassword) {
            newPassword = await validationFunctions.validPassword(newPassword);
        }
        if (newProfilePic) {
            newProfilePic = await validationFunctions.validURL(newProfilePic);
        } else {
            newProfilePic = accountFound.profilePic;
        }

        const currEmail = accountFound.email;

        //update Firebase
        try {
            //finding user with email
            const user = await admin.auth().getUserByEmail(currEmail);

            const updateObj = {};
            if (newEmail && newEmail !== currEmail) updateObj.email = newEmail;
            if (newPassword) updateObj.password = newPassword;

            if (Object.keys(updateObj).length > 0) {
                await admin.auth().updateUser(user.uid, updateObj);
            }
        } catch(e) {
            throw `Failed to update Firebase account info for ${accountID}`;
        }

        //update monogoDB
        const updateInfo = await accountCol.updateOne(
            {_id: new ObjectId(accountID) },
            {$set: { username: newUsername, email: newEmail , profilePic: newProfilePic} }
        );

        if (!updateInfo.acknowledged || updateInfo.modifiedCount === 0) {
            throw `Faialed to update MongoDB account info for ${accountID}`;
        }

        //delete related cache entries
        await redis_client.del(`account/${accountID}`);
        await redis_client.del(`account/card/${accountID}`);

        return true
    },

    async deleteAccount(accountID) {
        accountID = await idValidationFunctions.validObjectId(accountID, 'Account ID');

        const accountCol = await accounts();
        if (!accountCol) throw 'Failed to connect to account database';
        const accountFound = await accountCol.findOne({_id: new ObjectId(accountID)});
        if (!accountFound) throw 'No account found with that ID';

        const userEmail = accountFound.email;
        if (!userEmail) {
            throw `No email found for account ${accountID}. This is required for acnt creation/deletion`
        }

        //looping through posts array and deleting them using deletePostUnstable
        for (const postID of accountFound.posts) {
            try {
                await postsDataFunctions.deletePostUnstable(postID);
            } catch (e) {
                console.error(`Failed to delete post ${postID}: ${e}`)
            }
        }

        //Delete reviews by getting the user's review list, looping through, and using deleteReview
        try {
            const userReviews = await reviewsDataFunctions.getReviewsForAUser(accountID);

            if (Array.isArray(userReviews)) {
                for (const review of userReviews) {
                    try {
                        await reviewsDataFunctions.deleteReview(review._id.toString());
                    } catch (e) {
                        console.error(`Failed to delete review ${review._id}: ${e}`);
                    }
                }
            }
        } catch(e) {
            console.error(`Failed to get/delete user reviews for ${accountID}: ${e}`);
        }

        //Delete from firebase
        if (userEmail) {
            try {
                const user = await admin.auth().getUserByEmail(userEmail);
                await admin.auth().deleteUser(user.uid);
            } catch(e) {
                console.error(`Failed to delete Firebase user with email ${userEmail}:`, e)
            }
        }

        //delete the account
        const deleteData = await accountCol.deleteOne({_id: new ObjectId(accountID) });
        if (!deleteData.acknowledged || deleteData.deletedCount === 0) {
            throw 'Failed to delete account';
        }

        //delete related cache entries
        await redis_client.del(`account/${accountID}`);
        await redis_client.del(`account/card/${accountID}`);

        return true
    },

    async addPostToAccount(accountID, postID) {
        // adds the postID to the account's posts list
        accountID = await idValidationFunctions.validObjectId(accountID, 'Account ID');
        postID = await idValidationFunctions.validObjectId(postID, 'Post ID');

        const accountCol = await accounts();
        if (!accountCol) throw 'Failed to connect to account database';
        const accountFound = await accountCol.findOne({_id: new ObjectId(accountID)});
        if (!accountFound) throw 'No account found with that ID';

        const updateInfo = await accountCol.updateOne({_id: new ObjectId(accountID)}, {$push :{posts: postID}})
        if (!updateInfo.acknowledged || updateInfo.modifiedCount === 0) {
            throw 'Failed to add post to account info';
        }

        // delete related cache entries
        await redis_client.del(`account/${accountID}`);

        return true;
    },

    async removePostFromAccount(accountID, postID) {
        // removes the postID from the account's posts list
        accountID = await idValidationFunctions.validObjectId(accountID, 'Account ID');
        postID = await idValidationFunctions.validObjectId(postID, 'Post ID');

        const accountCol = await accounts();
        if (!accountCol) throw 'Failed to connect to account database';
        const accountFound = await accountCol.findOne({_id: new ObjectId(accountID)});
        if (!accountFound) throw 'No account found with that ID';

        let updateInfo;
        if (accountFound.likedPosts.includes(postID)) { // Ensure post removed from likes/dislikes array, if applicable
            updateInfo = await accountCol.updateOne({_id: new ObjectId(accountID)}, {$pull :{posts: postID, likedPosts: postID}})
        }
        if (accountFound.dislikedPosts.includes(postID)) {
            updateInfo = await accountCol.updateOne({_id: new ObjectId(accountID)}, {$pull :{posts: postID, dislikedPosts: postID}})
        } else {
            updateInfo = await accountCol.updateOne({_id: new ObjectId(accountID)}, {$pull :{posts: postID}})
        }

        if (!updateInfo.acknowledged || updateInfo.modifiedCount === 0) {
            throw 'Failed to remove post from account info';
        }

        // delete related cache entries
        await redis_client.del(`account/${accountID}`);

        return true;
    },

    async toggleLikedPost(accountID, postID) {
        // toggles the liked status of a post for an account
        accountID = await idValidationFunctions.validObjectId(accountID, 'Account ID');
        postID = await idValidationFunctions.validObjectId(postID, 'Post ID');

        const accountCol = await accounts();
        if (!accountCol) throw 'Failed to connect to account database';
        const accountFound = await accountCol.findOne({_id: new ObjectId(accountID)});
        if (!accountFound) throw 'No account found with that ID';

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

        // delete related cache entries
        await redis_client.del(`account/${accountID}`);

        return true;
    },

    async toggleDislikedPost(accountID, postID) {
        // toggles the disliked status of a post for an account
        accountID = await idValidationFunctions.validObjectId(accountID, 'Account ID');
        postID = await idValidationFunctions.validObjectId(postID, 'Post ID');

        const accountCol = await accounts();
        if (!accountCol) throw 'Failed to connect to account database';
        const accountFound = await accountCol.findOne({_id: new ObjectId(accountID)});
        if (!accountFound) throw 'No account found with that ID';

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

        // delete related cache entries
        await redis_client.del(`account/${accountID}`);

        return true;
    },

    async deleteFirebaseAccountsUnstable(){
        // deletes all accounts in the account collection from firebase, ONLY USED FOR RESEEDING
        const accountCol = await accounts();
        if (!accountCol) throw 'Failed to connect to account database';
        const allAccounts = await accountCol.find().project({_id: 0, email: 1}).toArray();
        if (!allAccounts) throw 'Could not retrieve accounts';

        for (const acc of allAccounts){
            try {
                const user = await admin.auth().getUserByEmail(acc.email);
                await admin.auth().deleteUser(user.uid);
            } catch(e) {
                console.error(`Failed to delete Firebase user with email ${acc.email}:`, e)
            }
        }

        return true;
    }

}

export default accountsDataFunctions;