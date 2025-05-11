import { React, useState, useEffect} from "react";
import {Link} from "react-router-dom";
import No_image from "../assets/no_image.png";
import axios from "axios";

function PopularListingsVertical({type, section}) {
    const typeToQuery = {
        'shows': 'popularShows',
        'movies': 'popularMovies',
        'posts': 'popularPosts',
        'books': 'popularBooks'
    }
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        async function fetchData() {
            try {
                const params = type === 'posts' && section ? { n: 10, section: section } : { n: 10 };
                const {data} = await axios.get(`http://localhost:3000/${type}/${typeToQuery[type]}`,
                    {params}
                );
                setListings(data);
                setLoading(false);
            }
            catch(e){
                setLoading(false);
                setError(e);
                console.log(e);
            }
        }
        fetchData();
    },[type, section]);
    if(loading){
        return <div className="p-4 text-gray-500">Loading...</div>;
    }
    if(error){
        return <div className="p-4 text-red-500">Error: {error.message}</div>;
    }
    if(!listings || listings.length === 0){
        return <div className="p-4 text-gray-500">No {type} listings found</div>;
    }
    let body;
    if(type === 'posts'){
        body=(
            //I also need to figure out how if this is the right way to add the pictures for the icon?
           <div className="px-4 py-6 space-y-4">
                <h2 className="text-xl font-bold mb-4">Popular Posts</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    { Array.isArray(listings) && listings.map((post) => (
                        <div key={post._id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
                            <div className="flex items-start gap-4">
                                <img src={post.profilePic || No_image}
                                onError={(e) => e.target.src = No_image}
                                loading="lazy"
                                alt="Profile" 
                                className="w-12 h-12 rounded-full object-cover"
                                />
                                <div className="flex-1">
                                    <Link to= {`/${type}/${post._id}`} className="hover:text-blue-600">
                                        <h3 className="text-lg font-semibold">{post.title}</h3>
                                    </Link>      
                                    <p className="text-gray-600 text-sm mt-1" >{post.username}</p>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                        <span>Likes: {post.likes}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                    }
                </div>
            </div>
        )
    }
    else if(type === 'books'){
        body= (
            <div className="px-4 py-6 space-y-4">
                <h2 className="text-xl font-bold mb-4">Popular Books</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    { Array.isArray(listings) && listings.map((book)=>(
                        <div key={book.forID} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">                   
                            <div className="flex gap-4">
                                <img src={book.cover|| No_image}
                                onError={(e) => e.target.src = No_image}
                                loading="lazy"
                                alt="Book cover" 
                                className="w-24 h-32 object-cover rounded"/>
                                <div className="flex-1">
                                    <Link to={`/${type}/${book.forID}`} className="hover:text-blue-600">
                                        <h3 className="text-lg font-semibold" >{book.title}</h3>
                                    </Link>     
                                    <p className="text-sm text-gray-600 mt-1">
                                        {book.authors?.join(", ") || 'Unknown author'}
                                    </p>
                                    <div className="mt-2 text-sm space-y-1">
                                        <p>Authors: {book.authors?.join(", ") || 'Unknown authors'}</p>
                                        <p>Average Rating: {book.averageRating}</p>
                                        <p>Number of Reviews: {book.reviewCount}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }
    else if(type === 'shows' || type === 'movies')
    {
        body= (
            <div className="px-4 py-6 space-y-4">
                <h2 className="text-xl font-bold mb-4">Popular {type.charAt(0).toUpperCase() + type.slice(1)}</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    { Array.isArray(listings) && listings.map((media)=>(
                        <div key={media.forID} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
                            <img src={media.image || No_image} 
                            onError={(e) => e.target.src = No_image}
                            loading="lazy"
                            alt="listing_image" 
                            className="w-full h-48 object-cover rounded-t-lg"/>
                            <div className="p-4">
                                <Link to={`/${type}/${media.forID}`} className="hover:text-blue-600">
                                    <h3 className="text-lg font-semibold">{media.title}</h3>
                                </Link>   
                                <div className="mt-2 text-sm space-y-1">                     
                                    <p>Average Rating: {media.averageRating}</p>
                                    <p>Number of Reviews: {media.reviewCount}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }
    return body;
}

export default PopularListingsVertical;