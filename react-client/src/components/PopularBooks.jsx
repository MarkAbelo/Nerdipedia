import { React, useState, useEffect} from "react";
import ListingsHorizontal from "./ListingsHorizontal";
import bookService from "../services/bookService";

function PopularBooks() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {                
                const data = await bookService.getPopularBooks(10);
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
        return <div className="p-4 text-gray-500">No books found</div>;
    }
    return <ListingsHorizontal title="Popular Books" cards={listings} type="books" />
}

export default PopularBooks;