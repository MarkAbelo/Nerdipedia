import axios from 'axios';
//import idValidationFunctions from '../../../data-server/validation/id_validation.js';
import validationFunctions from '../../../data-server/validation/validation.js';

const accountService = {
    async getAccount(id) {
        // Sending request to data-server
        try {
            const data = await axios.get(`http://localhost:3000/accounts/data/${id}`)
            return data.data
        } catch (e) {
            console.log(e)
            throw "Error: accountService could not get account due to data-server error (see browser logs)"
        }
    },

    async getAccountCard(id) {
        // Sending request to data-server
        try {
            const data = await axios.get(`http://localhost:3000/accounts/formdata/${id}`)
            return data.data
        } catch (e) {
            console.log(e)
            throw "Error: accountService could not get account card due to data-server error (see browser logs)"
        }
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
        
        // Input Validation
        try {
            username = await validationFunctions.validString(username);
            email = await validationFunctions.validEmail(email);
            password = await validationFunctions.validPassword(password);
            if (profilePic) {
                profilePic = await validationFunctions.validURL(profilePic);
            }
        } catch (e) {
            console.log(e)
            throw e 
            // Not sure how this will interact with frontend, whether throwing or not throwing is better for re-renders, will test once frontend up
        }
        // Sending request to data-server
        try {
            const accountObj = {
                username,
                email,
                password,
                profilePic
            }
            const data = await axios.post(`http://localhost:3000/accounts/create`, accountObj)
            return data.data
        } catch (e) {
            console.log(e.response.data)
            if(e.response.data.error && e.response.data.error.message) throw e.response.data.error.message;
            else throw "Error: accountService could not create account due to data-server error (see browser logs)";
        }
    },

    async editAccount(accountID, newUsername, newPassword, newEmail, newProfilePic) {
        // Input Validation
        const editObj = {}
        try {
            if (newUsername) {
                editObj.username = await validationFunctions.validString(newUsername);
            }
            if (newEmail) {
                editObj.email = await validationFunctions.validEmail(newEmail);
            }
            if (newPassword) { // Hash before sending to backend for security
                editObj.password = await validationFunctions.validPassword(newPassword);
            }
            if (newProfilePic) {
                editObj.profilePic = await validationFunctions.validURL(newProfilePic);
            }
        } catch (e) {
            console.log(e)
            throw e 
            // Not sure how this will interact with frontend, whether throwing or not throwing is better for re-renders, will test once frontend up
        }
        // Sending request to data-server
        try {
            const data = await axios.patch(`http://localhost:3000/accounts/data/${accountID}`, editObj)
            return data.data
        } catch (e) {
            console.log(e)
            throw "Error: accountService could not update account due to data-server error (see browser logs)"
        }
    },

    async deleteAccount(accountID) {
        // Sending request to data-server
        try {
            const data = await axios.delete(`http://localhost:3000/accounts/data/${accountID}`)
            return data.data.success
        } catch (e) {
            console.log(e)
            throw "Error: accountService could not delete account due to data-server error (see browser logs)"
        }
    }
    // addPostToAccount, removePostFromAccount, and toggle like/dislike post all handled in postService.js 

}

export default accountService;