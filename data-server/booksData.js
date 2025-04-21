import validationFunctions from "./validation.js";
import { ObjectId } from "mongodb";
import { reviews as reviewsCollection, accounts as accountsCollection } from './config/mongoCollections.js'
import axios from "axios";

const booksData={

    getId (workKey){
        if (!workKey) throw ('No key provided');
        if(typeof workKey!== 'string') throw ('Key must be type string');
        return workKey.split('/works/')[1] || '';
    },

    async getBook (id){
        if(!id) throw('Id must be provided!')
        //the book ids look like this: OL27448W 
        id= await validationFunctions.validString(id,"book");
        // I might just grab the info i need for the page here ngl.
        let bookInfo;
        try{
            const bookResponse = await axios.get(`https://openlibrary.org/works/${id}.json`);
            bookInfo=bookResponse.data;
        }
        catch(e){
            throw (e);
        }
        //grab the reviews
        const reviews = await reviewsCollection()
        const bookReviewList= await reviews.find ({forID: id, section:'book'}).toArray();
        let bookReview;
        //if there are no reviews 
        if(bookReviewList.length===0){
            bookReview = 'There are no reviews';
        }
        //if there are reviews
        else{
            const posterIDs = bookReviewList.map(review => review.posterID);
            const posterObjectIDs = posterIDs.map(id => new ObjectId(id));
            //grab user names 
            const accounts = await accountsCollection
            const accountList = await accounts.find({
                _id: { $in: posterObjectIDs } 
              }, {
                projection: { username: 1 }
              }).toArray();

            const accountMap = new Map();
            accountList.forEach(account => {
                accountMap.set(account._id.toString(), account.username);
            });
            bookReview = bookReviewList.map(review => ({
                ...review,
                username: accountMap.get(review.posterID.toString()) || 'Deleted User'
            }));
        }
        //put the reviews in
        bookInfo['bookReview']=bookReview;
        return bookInfo;
    },
    async searchBookByTitle(searchTerm, pageNum=1){
        //basic params checking
        if(!searchTerm) throw ('Search Term must be provided');
        if(typeof pageNum!=='number') throw ('Page must be a number')
        searchTerm= await validationFunctions.validString(searchTerm,"book");
        //encodes the query
        const encodedSearchTerm = encodeURIComponent(searchTerm).replace('%20','+');
        //axios time baby
        let booksData;
        try{
            const searchResponse = await axios.get('https://openlibrary.org/search.json', {
                params: {
                    q: encodedSearchTerm,
                    type: 'work',
                    limit: 20,
                    page: pageNum
                }
            });
            booksData=searchResponse.data
        }
        //idk any random error
        catch(e){
            throw (e)
        }
        if(booksData.numFound ===0){
            throw ('No books found!');
        }
        // this returns suffient data for each entry
        return booksData.docs.map(book=>
            (
                {
                    id: this.getId(book.key),
                    title:book.title,
                    authors: book.author_name || [],
                    //-S, -M, -L for image size
                    cover: book.cover_i? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` :null,
                    publish_year:book.first_publish_year
                }
            )
        )
    },

    async getBookCard(id){
        if(!id) throw('Id must be provided!')
        //the book ids look like this: OL27448W 
        id= await validationFunctions.validString(id,"book");
        // might need to run this function depending how the id is given
        //id = this.getId(book.key)  
        let bookInfo;
        try{
            const bookResponse = await axios.get(`https://openlibrary.org/works/${id}.json`);
            bookInfo=bookResponse.data;
        }
        catch(e){
            throw (e);
        }
        //-S, -M, -L for image size
        return {title: bookInfo.title, cover: bookInfo.covers[0]? `https://covers.openlibrary.org/b/id/${bookInfo.covers[0]}-M.jpg` :null }

    },
    async recommendBooks(){

    },
    async popularPosts(){

    },
    async getRecentPosts(){

    },
    async searchPosts(){
        
    }

}
export default booksData