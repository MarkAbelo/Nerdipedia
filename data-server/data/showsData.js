import validationFunctions from "../validation";
import { ObjectId } from "mongodb";
import { reviews as reviewsCollection, accounts as accountsCollection } from "../config/mongoCollections";
import axios from "axios";

//root for TVMaze API: https://www.tvmaze.com/


const showsDataFunctions = {

    async getShow(id) {
        /*
            returns show info given their show id. The ids are numerical 
        */
        if (!id) throw ('Id must be provided!');
        //show ids are numbers like: 139 for the show "Girls"
        id = await validationFunctions.validPositiveNumber(id, "Show ID");

        let showInfo; 
        try {
            const showResponse = await axios.get(`https://www.tvmaze.com/shows/${id}`)
            showInfo = showResponse.data;
        } catch(e) {
            throw (e);
        }
        //grab reviews
        const reviews = await reviewsCollection()
        const showReviewList = await reviews.find({forID: id, section:'show'}).toArray();
        let showReview;
        //if no reviews
        if (showReviewList.length === 0 ) {
            showReview = 'There are no reviews';
        }
        //if there are reviews
        else {
            const posterIDs = showReviewList.map(review => review.posterID);
            const posterObjectIDs = posterIDs.map(id => new ObjectId(id));
            //grab user names
            const accounts = await accountsCollection()
            const accountList = await accounts.find({
                _id: { $in: posterObjectIDs }
            }, {
                projection: { username: 1 }
            }).toArray();

            const accountMap = new Map();
            accountList.forEach(account => {
                accountMap.set(account._id.toString(), account.username);
            });
            showReview = showReviewList.map(review => ({
                ...review,
                username: accountMap.get(review.posterID.toString()) || 'Deleted User'
            }));
        }
        //put reviews in
        showInfo['showReview'] = showReview;
        return showInfo;
    },

    async searchShowByTitle(searchTerm, pageNum=1) {

        const itemsPerPage = 20;
        //will give a page of responses from a given input search term
        //paramter checking
        if (!searchTerm) throw ('Search term must be provided');
        if (typeof pageNum !== 'number') throw ('Page must be a number'); 
        searchTerm = await validationFunctions.validString(searchTerm, "show");
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
        id = await validationFunctions.validPositiveNumber(id, "show ID");

        let showInfo;
        try {
            const showResponse = await axios.get(`https://www.tvmaze.com/shows/${id}`)
            showInfo = showResponse.data;
        } catch(e) {
            throw (e);
        }
        return {title: showInfo.show.name, image: show.image?.medium || null};
    }
}

export default showsDataFunctions; 