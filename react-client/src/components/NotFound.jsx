import React from "react";
import { useNavigate } from "react-router-dom";
import NotFoundCat from '../assets/NotFoundCat.png';

function NotFound() {
    const navigate = useNavigate();
    return (
<div className="flex w-full flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-800 via-blue-900 to-purple-900 text-white p-4 text-center">            {/* Cat Image with Animation */}
            <img 
                src={NotFoundCat} 
                alt="Confused cat" 
                className="w-64 h-64 mb-8 animate-bounce" 
                style={{ animationDuration: '2s' }}
            />
            
            <div className="space-y-6 max-w-2xl">
                <h1 className="text-6xl font-bold text-red-400 drop-shadow-lg">404</h1>
                <h2 className="text-4xl font-semibold text-teal-300">Lost in the Library?</h2>
                
                <p className="text-xl text-gray-200 leading-relaxed">
                    The page you're looking for seems to have been...<br />
                    <span className="italic">checked out</span> indefinitely!
                </p>

                <button
                    onClick={() => navigate(-1)}
                    className="bg-teal-600 hover:bg-teal-700 text-black dark:text-white  font-bold py-2 px-4 rounded-lg transition-colors duration-200 mr-4"
                    >
                    Go Back
                    </button>
                    <button
                    onClick={() => navigate("/")}
                    className="bg-blue-600 hover:bg-blue-700 text-black dark:text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 mt-4"
                    >
                        Return to Shelves
                </button>

                <p className=" text-white mt-8 text-sm">
                    (Don't worry, our library cats are on the case!)
                </p>
            </div>
        </div>
    );
}

export default NotFound;