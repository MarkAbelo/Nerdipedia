import { React, useState, useEffect } from "react";
import { useAuth } from "../contexts/authContext";
import { Link, useParams } from "react-router-dom";
import accountService from "../services/accountService";
import postService from "../services/postService";
import ListingsHorizontal from "./ListingsHorizontal";
import ListingsVertical from "./ListingsVertical";

function Profile(){

    const { id } = useParams();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [accountData, setAccountData] = useState(undefined);

    // Edit Modal state
    const [modalActive, setModalActive] = useState(false) 
    const [editedTitle, setEditedTitle] = useState(null);
    const [editedBody, setEditedBody] = useState(null);
    const [editedSection, setEditedSection] = useState(null);
    const [editedImages, setEditedImages] = useState(null);
    const [uploadedImages, setUploadedImages] = useState([])

    useEffect(() => {
        async function fetchData(){
            try {
                const data = await accountService.getAccount(id);
                console.log(data) //for checking
                setAccountData(data);
                setLoading(false);
            } catch (e) {
                alert(e)
            }
        }
        fetchData();
    }, [id]);



    if (loading) {
        return (
            <>Loading...</>
        )
    }

    if (error) {
        return (
            <>{error.message}</>
        )
    }
    return (
        <div>
            <div className="flex justify-start space-x-10 items-center my-5">
                <img
                    src={accountData.profilePic}
                    alt="Poster profile"
                    className="w-20 h-20 rounded-full object-cover border"
                  />
                <h1>{accountData.username}</h1>
            </div>

            <div><ListingsHorizontal title="Posts" cards={accountData.postCards} type="posts" /></div>
            <span className="flex flex-col items-center md:flex-row md:items-start gap-6 mb-10">
                <div><ListingsVertical type="book" data={accountData.topBooks} title="Books"/></div>
                <div><ListingsVertical type="movie" data={accountData.topMovies} title="Movies" /></div>
                <div><ListingsVertical type="show" data={accountData.topShows} title="Shows" /></div>
            </span>
            

        </div>
    );
}

export default Profile