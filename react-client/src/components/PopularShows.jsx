import { React, useState, useEffect} from "react";
import ListingsHorizontal from "./ListingsHorizontal";
import showService from "../services/showService";

function PopularShows() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {                
                const data = await showService.getPopularShows(10);
                setListings(data);
                setLoading(false);
            }
            catch(err){
                setLoading(false);
                setError(err);
                console.log(err);
            }
        }
        fetchData();
    }, []);

    if(loading){
        return <div className="p-4 text-gray-500">Loading...</div>;
    }
    if(error){
        return <div className="p-4 text-red-500">Error: {error.message}</div>;
    }
    if(!listings || listings.length === 0){
        return <div className="p-4 text-gray-500">No shows found</div>;
    }
    return <ListingsHorizontal title="Popular Shows" cards={listings} type="shows" />
}

export default PopularShows;