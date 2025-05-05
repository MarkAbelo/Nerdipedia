import idValidationFunctions from "../validation/id_validation.js";
import axios from "axios";

import redis from 'redis';
const redis_client = redis.createClient();
await redis_client.connect();

//root for TVMaze API: https://www.tvmaze.com/


const showsDataFunctions = {

    async getShow(id) {
        /*
            returns show info given their show id. The ids are numerical 
        */
        if (!id) throw ('Id must be provided!');
        //show ids are numbers like: 139 for the show "Girls"
        id = await idValidationFunctions.validPositiveNumber(id, "Show ID");

        // check cache
        const cacheKey = `show/${id}`;
        const checkCache = await redis_client.exists(cacheKey);
        if (checkCache) {
            const cacheData = await redis_client.get(cacheKey);
            return JSON.parse(cacheData);
        }

        let showInfo; 
        try {
            const showResponse = await axios.get(`https://www.tvmaze.com/shows/${id}`)
            showInfo = showResponse.data;
        } catch(e) {
            throw (e);
        }
        // cache data
        await redis_client.set(cacheKey, JSON.stringify(showInfo));

        return showInfo;
    },

    async searchShowByTitle(searchTerm, pageNum=1) {

        const itemsPerPage = 20;
        //will give a page of responses from a given input search term
        //paramter checking
        if (!searchTerm) throw ('Search term must be provided');
        if (typeof pageNum !== 'number') throw ('Page must be a number'); 
        searchTerm = await idValidationFunctions.validString(searchTerm, "show");
        //encodes the query 
        const encodedSearchTerm = encodeURIComponent(searchTerm);
        //sets the start-end indexes for pagination
        const startIndex = (pageNum - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        //axios
        let showsData; 
        try {
            const searchResponse = await axios.get(`https://api.tvmaze.com/search/shows?q=${encodedSearchTerm}`);
            showsData = searchResponse.data
        } catch(e) {
            throw(e);
        }
        if (showsData == []) {
            throw ('No shows found!');
        }

        const showsOnPage = showsData.slice(startIndex, endIndex);
        if (showsOnPage.length === 0) {
            throw (`No results found for this page number ${pageNum}`);
        }

        return showsOnPage.map(elem => {
            const show = elem.show;
            return {
                id: show.id,
                title: show.name,
                url: show.url, //the url is an alternative way of running the api call if it can be passed
                premiered: show.premiered, //YYYY-MM-DD format
                image: show.image?.medium || null
            }
        })
    },

    async getShowCard(id) {
        //given a show id, returns the title and image of the show 
        if (!id) throw ('Id must be provided!');
        id = await idValidationFunctions.validPositiveNumber(id, "show ID");

        // check cache
        const cacheKey = `show/card/${id}`;
        const checkCache = await redis_client.exists(cacheKey);
        if (checkCache) {
            const cacheData = await redis_client.get(cacheKey);
            return JSON.parse(cacheData);
        }

        let showInfo;
        try {
            const showResponse = await axios.get(`https://www.tvmaze.com/shows/${id}`)
            showInfo = showResponse.data;
        } catch(e) {
            throw (e);
        }
        const returnCard =  {title: showInfo.show.name, image: show.image?.medium || null};

        // cache data
        await redis_client.set(cacheKey, JSON.stringify(returnInfo));

        return returnCard;
    },
    async recommendShows(){
        //to be implemented
    },
    
}

export default showsDataFunctions; 