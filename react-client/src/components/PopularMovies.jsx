import { React, useState, useEffect} from "react";
import ListingsHorizontal from "./ListingsHorizontal";
import movieService from "../services/movieService";

function PopularMovies() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {                
                const data = await movieService.getPopularMovies(10);
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
    return <ListingsHorizontal title="Popular Movies" cards={listings} type="movies" />
}

export default PopularMovies;