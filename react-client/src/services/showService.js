import axios from 'axios';
import idValidationFunctions from '../../../data-server/validation/id_validation.js';
import validationFunctions from '../../../data-server/validation/validation.js';

const showService={
    async getShow(id){
        try{
            if(!id) throw "No show id provided";
            id= await idValidationFunctions.validObjectId(id, "Show ID");
            const data= await axios.get( `http://localhost:3000/shows/getShow/${id}`);
            if(data.status === 200){
                return data.data;
            }
            else{
                throw data.error
            }
        }
        catch(e){
            console.log(e);
            throw `Error: showService could not get show by id due to data-server error (see browser logs)`
        }
    },
    async searchShow(searchTerm, pageNum){
        try{
            if (!searchTerm) throw "No search term provided";
            searchTerm = await validationFunctions.validString(searchTerm, "show");
            if (!pageNum) pageNum = 1;
            if (isNaN(pageNum)) pageNum = 1;
            pageNum = await validationFunctions.validPositiveNumber(pageNum, "Page Number");
            searchTerm = await validationFunctions.validString(searchTerm, "Search term");
            const data= await axios.get(`http://localhost:3000/shows/search?searchTerm=${searchTerm}&pageNum=${pageNum}`);
            if(data.status === 200){
                return data.data;
            }
            else{
                throw data.error
            }
        }
        catch(e){
            console.log(e);
            throw `Error: showService could not search show by title due to data-server error (see browser logs)`
        }
    },
    async getPopularShows(n){
        try{
            if(!n) n= 10;
            if (isNaN(n)) n = 10;
            n= await validationFunctions.validPositiveNumber(n, "Number of shows");
            const data= await axios.get(`http://localhost:3000/shows/popularShows?n=${n}`);
            if(data.status === 200){
                return data.data;
            }
            else{
                throw data.error
            }
        }
        catch(e){
            console.log(e);
            throw `Error: showService could not get popular shows due to data-server error (see browser logs)`
        }
    },
    async getShowRecs(accountId, n){
        try{
            if(!accountId) throw "No account id provided";
            accountId= await idValidationFunctions.validObjectId(accountId, "Account ID");
            if(!n) n= 10;
            if (isNaN(n)) n = 10;
            n= await validationFunctions.validPositiveNumber(n, "Number of shows");
            const data= await axios.get(`http://localhost:3000/shows/getShowsRecs?accountId=${accountId}&n=${n}`);
            if(data.status === 200){
                return data.data;
            }
            else{
                throw data.error
            }
        }
        catch(e){
            console.log(e);
            throw `Error: showService could not get show recommendations due to data-server error (see browser logs)`
        }
    },
}
export default showService;