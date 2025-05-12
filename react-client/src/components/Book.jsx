import {React, useState, useEffect} from "react";
import Reviews from "./Reviews";
import {useAuth} from "../contexts/authContext";
import Link from "react-router-dom";
import bookService from "../services/bookService";
import No_image from "../assets/no_image.png";

function Book({id}){
    const [book,setBook] =useState(null);
    const [loading,setLoading] = useState(true);
    const [error,setError] = useState(null);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewBody, setReviewBody] = useState('');
    const [reviewRating, setReviewRating] = useState(10);
    const [reviews, setReviews] = useState([]);
    const [userReview, setUserReview] = useState(null);
    const [editingReview, setEditingReview] = useState(null);

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
            try{
                //grab the user review
            }
            catch(e){
                //throw if there is an error
            }
        };
        fetchBook();
    }, [id]);

    useEffect(() => {
        if (editingReview) {
          setReviewBody(editingReview.body);
          setReviewRating(editingReview.rating);
          setShowReviewForm(true);
        }
      }, [editingReview]);

    const handleSubmit = () => {
        //need to complete
    }  
    if(loading){
        return <div className="p-4 text-gray-500">Loading...</div>;
    }
    if(error){
        return <div className="p-4 text-red-500">Error: {error.message}</div>;
    }

 
}

