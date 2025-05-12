import axios from 'axios';
import idValidationFunctions from '../../../data-server/validation/id_validation.js';
import validationFunctions from '../../../data-server/validation/validation.js';

const postService = {
    async createPost(postObj) { // POST to create post
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
            if (data.status == 200) {
                return data.data.postID
            } else {
                throw data.error
            }
        } catch (e) {
            console.log(e)
            throw "Error: postService could not create post due to data-server error (see browser logs)"
        }
    },
    async getPost(id) { // GET post by id
        try {
            id = await idValidationFunctions.validObjectId(id, "Post ID")
            const data = await axios.get(`http://localhost:3000/posts/data/${id}`)
            if (data.status == 200) {
                return data.data.postID
            } else {
                throw data.error
            }
        } catch (e) {
            console.log(e)
            throw e
        }
    },
    async updatePost(id, updateObj) { // PATCH post to update post
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
            if (data.status == 200) {
                return data.data.success
            } else {
                throw data.error
            }
        } catch (e) {
            console.log(e)
            throw "Error: postService could not edit post due to data-server error (see browser logs)"
        }
    },
    async deletePost(id) { // DELETE post to delete post
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
            if (data.status == 200) {
                return data.data.success
            } else {
                throw data.error
            }
        } catch (e) {
            console.log(e)
            throw "Error: postService could not delete post due to data-server error (see browser logs)"
        }
    },
    async getPopularPosts(n, section=null) { // GET getPostCard data
        // Input Validation
        try {
            n = await validationFunctions.validPositiveNumber(Number(n), 'Number of Posts');
            if (section) section = await validationFunctions.validSection(section);
        } catch (e) {
            console.log(e)
            throw e
        }
        // Sending request to data-server
        try {
            let data;
            if (section) { // Use different URIs depending on presence of 'section'
                data = await axios.get(`http://localhost:3000/posts/popularposts?n=${n}&section=${section}`)
            } else {
                data = await axios.get(`http://localhost:3000/posts/popularposts?n=${n}`)
            }
            if (data.status == 200) {
                return data.data // List of postCards, up to n
            } else {
                throw data.error
            } 
        } catch (e) {
            console.log(e)
            throw "Error: postService could not get popular posts due to data-server error (see browser logs)"
        }
    },
    async getRecentPosts(n, section=null) { // GET getPostCard data
        // Input Validation
        try {
            n = await validationFunctions.validPositiveNumber(Number(n), 'Number of Posts');
            if (section) section = await validationFunctions.validSection(section);
        } catch (e) {
            console.log(e)
            throw e
        }
        // Sending request to data-server
        try {
            let data;
            if (section) { // Use different URIs depending on presence of 'section'
                data = await axios.get(`http://localhost:3000/posts/recentposts?n=${n}&section=${section}`)
            } else {
                data = await axios.get(`http://localhost:3000/posts/recentposts?n=${n}`)
            }
            if (data.status == 200) {
                return data.data // List of postCards, up to n
            } else {
                throw data.error
            } 
        } catch (e) {
            console.log(e)
            throw "Error: postService could not get recent posts due to data-server error (see browser logs)"
        }
    },
    async searchPosts(term, section=null) {
        // Input Validation
        try {
            term = await validationFunctions.validString(term, 'Search term');
            if (section) section = await validationFunctions.validSection(section);
        } catch (e) {
            console.log(e)
            throw e
        }
        // Sending request to data-server
        try {
            let data;
            if (section) { // Use different URIs depending on presence of 'section'
                data = await axios.get(`http://localhost:3000/posts/search?term=${term}&section=${section}`)
            } else {
                data = await axios.get(`http://localhost:3000/posts/search?term=${term}`)
            }
            if (data.status == 200) {
                return data.data // List of postCards by search term
            } else {
                throw data.error
            }
        } catch (e) {
            console.log(e)
            throw "Error: postService could not get recent posts due to data-server error (see browser logs)"
        }
    }, 
    async getPostsByAuthor(authorID) { // GET all posts by authorID
        // Input Validation
        try {
            authorID = await idValidationFunctions.validObjectId(authorID, "Account ID");
        } catch (e) {
            console.log(e)
            throw e
        }
        // Sending request to data-server
        try {
            const data = await axios.get(`http://localhost:3000/posts/byAuthor/${authorID}`)
            if (data.status == 200) {
                return data.data // List of posts made by account/user with authorID
            } else {
                throw data.error
            } 
        } catch (e) {
            console.log(e)
            throw `Error: postService could not get posts from author with ID: ${authorID} due to data-server error (see browser logs)`
        }
    },
    

    /* 
        Problems with disliking a liked post
    */
    async toggleLikedPost(postID, accountID) { // PATCH to like/unlike post
        // Input Validation
        try {
            postID = await idValidationFunctions.validObjectId(postID, "Post ID");
            accountID = await idValidationFunctions.validObjectId(accountID, "Account ID");
        } catch (e) {
            console.log(e)
            throw e
        }
        // Sending request to data-server
        try {
            const data = await axios.patch(`http://localhost:3000/posts/toggleLikePost`, {postID, accountID})
            if (data.status == 200) {
                return data.data // True if operation success
            } else {
                throw data.error
            }
        } catch (e) {
            console.log(e)
            throw e
        }
    },
    async toggleDislikedPost(postID, accountID) { // PATCH to dislike/undislike post
        // Input Validation
        try {
            postID = await idValidationFunctions.validObjectId(postID, "Post ID");
            accountID = await idValidationFunctions.validObjectId(accountID, "Account ID");
        } catch (e) {
            console.log(e)
            throw e
        }
        // Sending request to data-server
        try {
            const data = await axios.patch(`http://localhost:3000/posts/toggleDislikePost`, {postID, accountID})
            if (data.status == 200) {
                return data.data // True if operation success
            } else {
                throw data.error
            }
        } catch (e) {
            console.log(e)
            throw "Error: data-server"
        }
    }
    
}

//await accountsDataFunctions.createAccount('DaMoonMan', 'asdf1234!', 'michaelmoonan131@gmail.com', 'https://sitechecker.pro/wp-content/uploads/2023/05/URL-meaning.jpg')

//const x = await postService.updatePost('681552895eb4cc6861a53a48', {
//    'title': "Thoughts on White Lotus",
//    'section': "show",
//    'body': "Very fun and awesome to watch :)",
//    'images': ["https://sitechecker.pro/wp-content/uploads/2023/05/URL-meaning.jpg"]
//})
//console.log(x)
try {
    const y = await postService.deletePost("6815529a5eb4cc6861a53a49")
    //const x = await postService.createPost({
    //        'posterID': '68154dc228f4196771248e88', 
    //        'title': "Thoughts on White Lotus",
    //        'section': "show",
    //        'body': "Very fun and awesome to watch :)",
    //        'images': ["https://sitechecker.pro/wp-content/uploads/2023/05/URL-meaning.jpg"]
    //    })
    console.log(y)
} catch (e) {
    console.log(e)
}


export default postService;