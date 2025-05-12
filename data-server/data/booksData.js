import validationFunctions from "../validation/validation.js";
import idValidationFunctions from "../validation/id_validation.js";
import axios from "axios";
import redis from 'redis';

const redis_client = redis.createClient();
await redis_client.connect();

import { bookRec } from "../config/recRaccoon.js";

const booksDataFunctions={

    getId (workKey){
        if (!workKey) throw ('No key provided');
        if(typeof workKey!== 'string') throw ('Key must be type string');
        return workKey.split('/works/')[1] || '';
    },

    async getBook (id){
        if(!id) throw('Id must be provided!')
        //the book ids look like this: OL27448W 
        id= await validationFunctions.validString(id,"book");

        // check cache
        const cacheKey = `book/${id}`;
        const checkCache = await redis_client.exists(cacheKey);
        if (checkCache) {
            const cacheData = await redis_client.get(cacheKey);
            return JSON.parse(cacheData);
        }

        // I might just grab the info i need for the page here ngl.
        let bookInfo;
        try{
            const bookResponse = await axios.get(`https://openlibrary.org/works/${id}.json`);
            bookInfo=bookResponse.data;
        }
        catch(e){
            throw (e);
        }
        // cache data
        await redis_client.set(cacheKey, JSON.stringify(bookInfo));

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

        // check cache
        const cacheKey = `book/card/${id}`;
        const checkCache = await redis_client.exists(cacheKey);
        if (checkCache) {
            const cacheData = await redis_client.get(cacheKey);
            return JSON.parse(cacheData);
        }

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
        const returnCard = {id,title: bookInfo.title, cover: bookInfo.covers[0]? `https://covers.openlibrary.org/b/id/${bookInfo.covers[0]}-M.jpg` :null };

        // cache data
        await redis_client.set(cacheKey, JSON.stringify(returnInfo));

        return returnCard;

    },
    
    async getBookRecs(accountID, n){
        // assumes accountID exists
        accountID = await idValidationFunctions.validObjectId(accountID);
        n = await validationFunctions.validPositiveNumber(n);

        let bookList = await bookRec.recommendFor(accountID, n);
        bookList = await Promise.all(bookList.map(this.getBookCard));
        return bookList;
    }
}
export default booksDataFunctions;
