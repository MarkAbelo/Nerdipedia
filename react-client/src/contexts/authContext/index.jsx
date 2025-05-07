import React, { useContext, useEffect, useState } from "react";
import { auth } from "../../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = React.createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [mongoUser, setMongoUser] = useState(null);

    useEffect(() => {
        if(!auth) return;
        const unsubscribe = onAuthStateChanged(auth, initializeUser);
        return unsubscribe;
    }, [])

    async function initializeUser(user) {
        if (user) {
            setCurrentUser({ ...user });
            setUserLoggedIn(true);
            setMongoUser(user.displayName);

            try {
                const mongoUserId = user.displayName;
                //TODO: make call under aaccountService "getAccount" which will be passed the mongoID
            } catch(e) {
                console.log(e)
                setMongoUser(null);
            }

        } else {
            setCurrentUser(null);
            setUserLoggedIn(false);
            setMongoUser(null);
        }
        setLoading(false);
    }

    const value = {
        currentUser,
        mongoUser,
        userLoggedIn,
        loading
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}
