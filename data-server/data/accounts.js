import { accounts } from "../config/mongoCollections";

const accountsDataFunctions = {
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

        
    }

}

export default accountsDataFunctions;