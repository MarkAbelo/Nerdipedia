import { Navigate, Outlet } from "react-router-dom";
import React from "react";
import { useAuth } from "../contexts/authContext";

const PrivateRoute = () => {
    const { currentUser } = useAuth();
    return currentUser? <Outlet/> : <Navigate to='/login' replace={true} />;
}

export default PrivateRoute