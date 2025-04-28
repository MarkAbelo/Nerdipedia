import { accounts, posts } from "../config/mongoCollections";
import { ObjectId } from "mongodb";
import validationFunctions from "../validation/validation";
import idValidationFunctions from "../validation/id_validation";
import { auth } from "../config/firebase";
import { admin } from "../config/firebaseAdmin";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import validSections from "../validation/validSections";

import redis from 'redis';
import postsDataFunctions from "./posts";
import reviewsDataFunctions from "./reviews";
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

    async createAccount(username, passwordHash, email, profilePic) {
        /*
            username: string
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
        username = validationFunctions.validString(username);
        email = validationFunctions.validEmail(email);
        passwordHash = validationFunctions.validPassword(passwordHash);
        if (profilePic) {
            profilePic = validationFunctions.validURL(profilePic);
        }
        

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

    async deleteAccount(accountID) {
        accountID = idValidationFunctions.validObjectId(accountID, 'Account ID');

        const accountCol = await accounts();
        if (!accountCol) throw 'Failed to connect to account database';
        const accountFound = await accountCol.findOne({_id: new ObjectId(accountID)});
        if (!accountFound) throw 'No account with that ID';

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

        //delete related cache entries TODO
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

        // delete related cache entries
        await redis_client.del(`account/${accountID}`);

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

        // delete related cache entries
        await redis_client.del(`account/${accountID}`);

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

        // delete related cache entries
        await redis_client.del(`account/${accountID}`);

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

        // delete related cache entries
        await redis_client.del(`account/${accountID}`);

        return true;
    }

}

export default accountsDataFunctions;