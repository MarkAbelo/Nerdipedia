import { React, useState, useEffect} from "react";
import ListingsHorizontal from "./ListingsHorizontal";
import bookService from "../services/bookService";
import { useAuth } from "../contexts/authContext";


function RecommendedBooks() {
    const { currentUser } = useAuth()
    
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {                
                const data = await bookService.getBooksRecs(currentUser.displayName, 10);
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
        return <div className="p-4 text-red-500">Error: {error.message}</div>;
    }
    return <ListingsHorizontal title="Recommended Books" cards={listings} type="books" noneFoundMessage="No books found... Review movies to receive recommendations"/>
}

export default RecommendedBooks;