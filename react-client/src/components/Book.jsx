import {React, useState, useEffect} from "react";
import {useAuth} from "../contexts/authContext";
import Link from "react-router-dom";
import bookService from "../services/bookService";
import No_image from "../assets/no_image.png";

function Book({id}){
    const [book,setBook] =useState(null);
    const [loading,setLoading] = useState(true);
    const [error,setError] = useState(null);
    const {currentUser} = useAuth();

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const bookData = await bookService.getBook(id);
                setBook(bookData);
                setLoading(false);
            } catch (e) {
                setLoading(false);
                setError(e);
            }
        };
        fetchBook();
    }, [id]);
    if(loading){
        return <div className="p-4 text-gray-500">Loading...</div>;
    }
    if(error){
        return <div className="p-4 text-red-500">Error: {error.message}</div>;
    }
    
}

