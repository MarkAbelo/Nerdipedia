import { React, useState, useEffect } from "react";
import { useAuth } from "../contexts/authContext";
import { Link, useParams } from "react-router-dom";
import accountService from "../services/accountService";

function Profile(){

    const { id } = useParams();

    const [loading, setLoading] = useState(true);
    const [ error, setError] = useState(null);
    const [accountData, setAccountData] = useState(undefined);

    useEffect(() => {
        async function fetchData(){
            try {
                const data = await accountService.getAccount(id);
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
            <div className="flex justify-start space-x-10 items-center">
                <img
                    src={accountData.profilePic}
                    alt="Poster profile"
                    className="w-20 h-20 rounded-full object-cover border"
                  />
                <h1>{accountData.username}</h1>
            </div>

            POSTS HERE
            TOP BOOKS HERE
            TOP MOVIES HERE
            TOP SHOWS HERE

        </div>
    );
}

export default Profile