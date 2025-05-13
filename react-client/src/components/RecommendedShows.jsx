import { React, useState, useEffect} from "react";
import ListingsHorizontal from "./ListingsHorizontal";
import showService from "../services/showService";
import { useAuth } from "../contexts/authContext";

function RecommendedShows() {
    const { currentUser } = useAuth()
    
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {                
                const data = await showService.getShowRecs(currentUser.displayName, 10);
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
    }, [currentUser]);

    if (!currentUser) {
        return null;
    }
    if(loading){
        return <div className="p-4 text-gray-500">Loading...</div>;
    }
    if(error){
        return <div className="p-4 text-red-500">Error: {error}</div>;
    }
    return <ListingsHorizontal title="Recommended Shows" cards={listings} type="shows" noneFoundMessage="No shows found... Review shows to receive recommendations"/>
}

export default RecommendedShows;