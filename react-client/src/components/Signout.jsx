import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { useAuth } from "../contexts/authContext";

const Signout = () => {
    const { userLoggedIn, currentUser } = useAuth();
    const [confirm, setConfirm] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSignout = async () => {
        try {
            await signOut(auth);
            navigate("/"); 
        } catch (e) {
            setError("Failed to sign out");
            console.log(e)
        }
    };

    if (!userLoggedIn) {
        return (
            <div>
                <h2>You are already logged out</h2>
                <button onClick={() => navigate("/")}>Go Home</button>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-center mb-5">Sign Out</h2>
            {error && <p>{error}</p>}

            {!confirm ? (
                <div className="mx-auto w-fit">
                    <p>Are you sure you want to sign out of {currentUser?.email}?</p>
                    <div className="flex justify-center space-x-10 mt-5">
                        <button onClick={() => setConfirm(true)}>Yes, sign out</button>
                        <button onClick={() => navigate(-1)}>Cancel</button>
                    </div>
                </div>
            ) : (
                <div>
                    <p>Signing out</p>
                    {handleSignout()}
                </div>
            )}
        </div>
    );
}

export default Signout