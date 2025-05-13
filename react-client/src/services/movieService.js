import axios from 'axios';
import validationFunctions from '../validation/validation.js'

const movieService={
    async getMovie(id){
        try{
            if(!id) throw "No movie id provided";
            id = await validationFunctions.validString(id, "movie")
            const data = await axios.get( `http://localhost:3000/movies/getMovie/${id}`);
            if(data.status === 200){
                return data.data;
            }
            else{
                throw data.error
            }
        }
        catch(e){
            console.log(e);
            throw `Error: movieService could not get movie by id due to data-server error (see browser logs)`
        }
    },
    async searchMovie(searchTerm, pageNum){
        try{
            if (!searchTerm) throw "No search term provided";
            searchTerm = await validationFunctions.validString(searchTerm, "movie");
            if (!pageNum) pageNum = 1;
            if (isNaN(pageNum)) pageNum = 1;
            pageNum = await validationFunctions.validPositiveNumber(pageNum, "Page Number");
            searchTerm = await validationFunctions.validString(searchTerm, "Search term");
            const data= await axios.get(`http://localhost:3000/movies/search?searchTerm=${searchTerm}&pageNum=${pageNum}`);
            if(data.status === 200){
                return data.data;
            }
            else{
                throw data.error
            }
        }
        catch(e){
            console.log(e);
            throw `Error: movieService could not search movie by title due to data-server error (see browser logs)`
        }
    },
    async getPopularMovies(n){
        try{
            if(!n) n= 10;
            if (isNaN(n)) n = 10;
            n= await validationFunctions.validPositiveNumber(n, "Number of movies");
            const data= await axios.get(`http://localhost:3000/movies/popularMovies?n=${n}`);
            if(data.status === 200){
                return data.data;
            }
            else{
                throw data.error
            }
        }
        catch(e){
            console.log(e);
            throw `Error: movieService could not get popular movies due to data-server error (see browser logs)`
        }
    },
    async getMovieRecs(accountId, n){
        try{
            if(!accountId) throw "No account id provided";
            if(!n) n= 10;
            if (isNaN(n)) n = 10;
            n= await validationFunctions.validPositiveNumber(n, "Number of shows");
            const data= await axios.get(`http://localhost:3000/movies/getMovieRecs?accountId=${accountId}&n=${n}`);
            if(data.status === 200){
                return data.data;
            }
            else{
                throw data.error
            }
        }
        catch(e){
            console.log(e);
            throw `Error: movieService could not get movie recommendations due to data-server error (see browser logs)`
        }
    }, 
}
export default movieService;