import axios from 'axios';
import validationFunctions from '../validation/validation.js'
const bookService={
    async getBook(id){
        try{
            if(!id) throw "No book id provided";
            const data= await axios.get( `http://localhost:3000/books/getBook/${id}`);
            if(data.status === 200){
                return data.data;
            }
            else{
                throw data.error
            }
        }
        catch(e){
            console.log(e);
            throw `Error: bookService could not get book by id due to data-server error (see browser logs)`
        }
    },
    async searchBook(searchTerm, pageNum){
        try{
            if (!searchTerm) throw "No search term provided";
            searchTerm = await validationFunctions.validString(searchTerm, "book");
            if (!pageNum) pageNum = 1;
            if (isNaN(pageNum)) pageNum = 1;
            pageNum = await validationFunctions.validPositiveNumber(pageNum, "Page Number");
            searchTerm = await validationFunctions.validString(searchTerm, "Search term");
            const data= await axios.get(`http://localhost:3000/books/search?searchTerm=${searchTerm}&pageNum=${pageNum}`);
            if(data.status === 200){
                return data.data;
            }
            else{
                throw data.error
            }
        }
        catch(e){
            console.log(e);
            throw `Error: bookService could not search book by title due to data-server error (see browser logs)`
        }
    },
    async getPopularBooks(n){
        try{
            if(!n) n= 10;
            if (isNaN(n)) n = 10;
            n= await validationFunctions.validPositiveNumber(n, "Number of books");
            const data= await axios.get(`http://localhost:3000/books/popularBooks?n=${n}`);
            if(data.status === 200){
                return data.data;
            }
            else{
                throw data.error
            }
        }
        catch(e){
            console.log(e);
            throw `Error: bookService could not get popular books due to data-server error (see browser logs)`
        }
    },
    async getBooksRecs(accountId,n){
        try{
            if(!accountId) throw "No account id provided";
            if(!n) n= 10;
            if (isNaN(n)) n = 10;
            n= await validationFunctions.validPositiveNumber(n, "Number of Books")
            const data= await axios.get(`http://localhost:3000/books/getBooksRecs?accountId=${accountId}&n=${n}`);
            if(data.status === 200){
                return data.data;
            }
            else{
                throw data.error
            }
        }
        catch(e){
            console.log(e);
            throw `Error: bookService could not get book recommendations due to data-server error (see browser logs)`
        }
    }

}
export default bookService