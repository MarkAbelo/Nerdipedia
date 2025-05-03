import axios from 'axios';
import idValidationFunctions from '../../../data-server/validation/id_validation.js';
import validationFunctions from '../../../data-server/validation/validation.js';
import accountsDataFunctions from '../../../data-server/data/accounts.js';
const postService = {
    async createPost(postObj) {
        // Input Validation
        try {
            postObj.title = await validationFunctions.validString(postObj.title, "Post title");
            postObj.posterID = await idValidationFunctions.validObjectId(postObj.posterID, "Poster Account ID");
            postObj.section = await validationFunctions.validSection(postObj.section);
            postObj.body = await validationFunctions.validPostBody(postObj.body);
            postObj.images = await Promise.all(postObj.images.map(async (imageURL) => await validationFunctions.validURL(imageURL, 'Image URL')));
        } catch (e) {
            console.log(e)
            throw e 
            // Not sure how this will interact with frontend, whether throwing or not throwing is better for re-renders, will test once frontend up
        }
        // Sending request to data-server
        try {
            const data = await axios.post("http://localhost:3000/posts/create", postObj)
            return data.data.postID
        } catch (e) {
            console.log(e)
            throw "Error: postService could not create post due to data-server error"
        }
    },
    async getPost(id) {
        try {
            id = await idValidationFunctions.validObjectId(id, "Post ID")
            const data = await axios.get(`http://localhost:3000/posts/data/${id}`)
            return data.data.postID
        } catch (e) {
            console.log(e)
            throw e
        }
    },
    async updatePost(id, updateObj) {
        // Input Validation
        try {
            id = await idValidationFunctions.validObjectId(id, "Post ID");
            if (updateObj.title) updateObj.title = await validationFunctions.validString(updateObj.title, "Post title");
            if (updateObj.section) updateObj.section = await validationFunctions.validSection(updateObj.section);
            if (updateObj.body) updateObj.body = await validationFunctions.validPostBody(updateObj.body);
            if (updateObj.images) updateObj.images = await Promise.all(updateObj.images.map(async (imageURL) => await validationFunctions.validURL(imageURL, 'Image URL')));
        } catch (e) {
            console.log(e)
            throw e 
            // Not sure how this will interact with frontend, whether throwing or not throwing is better for re-renders, will test once frontend up
        }
        // Sending request to data-server
        try {
            const data = await axios.patch(`http://localhost:3000/posts/data/${id}`, updateObj)
            return data.data.success
        } catch (e) {
            console.log(e)
            throw "Error: postService could not edit post due to data-server error"
        }
    },
    async deletePost(id) {
        // Input Validation
        try {
            id = await idValidationFunctions.validObjectId(id, "Post ID");
        } catch (e) {
            console.log(e)
            throw e 
            // Not sure how this will interact with frontend, whether throwing or not throwing is better for re-renders, will test once frontend up
        }
        // Sending request to data-server
        try {
            const data = await axios.delete(`http://localhost:3000/posts/data/${id}`)
            return data.data.success
        } catch (e) {
            console.log(e)
            throw "Error: postService could not delete post due to data-server error"
        }
    },
    
}

//await accountsDataFunctions.createAccount('DaMoonMan', 'asdf1234!', 'michaelmoonan131@gmail.com', 'https://sitechecker.pro/wp-content/uploads/2023/05/URL-meaning.jpg')

//const x = await postService.updatePost('681552895eb4cc6861a53a48', {
//    'title': "Thoughts on White Lotus",
//    'section': "movie",
//    'body': "Very fun and awesome to watch :)",
//    'images': ["https://sitechecker.pro/wp-content/uploads/2023/05/URL-meaning.jpg"]
//})
//console.log(x)

export default postService;