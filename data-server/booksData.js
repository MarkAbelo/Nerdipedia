import validationFunctions from "./validation.js";
import { ObjectId } from "mongodb";
import { reviews as reviewsCollection } from './config/mongoCollections.js'
import axios from "axios";

const booksData={

    getId (workKey){
        if (!workKey) throw ('No key provided');
        if(typeof workKey!== 'string') throw ('Key must be type string');
        return workKey.split('/works/')[1] || ''; // Safely handle missing keys
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
        if(bookReviewList.length===0){
            bookReview = 'There are no reviews';
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
                    cover: book.cover_i? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` :null,
                    publish_year:book.first_publish_year
                }
            )
        )
    } 
}
export default booksData