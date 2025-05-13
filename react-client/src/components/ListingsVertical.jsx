import { React, useState, useEffect} from "react";
import {Link} from "react-router-dom";
import No_image from "../assets/no_image.png";
import axios from "axios";

function ListingsVertical({type, title, data}) {
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
                // if(type ==="books"){
                //     let {data} = await axios.get(`http://localhost:3000/books/search`,{
                //         params:{
                //             searchTerm: 'Harry Potter',
                //             pageNum: 1
                //         }
                //     })
                //     data= data.map((book) => ({
                //         ...book,
                //         averageRating: 10,
                //         reviewCount: 100,
                //         publish_year: book.publish_year,
                //     }))
                //     setListings(data);
                //     setLoading(false);
                // }
                // else{
                setListings(data);
                setLoading(false);
            // }
            }
            catch(e){
                setLoading(false);
                setError(e);
                console.log(e);
            }
        }
        fetchData();
    },[type]);
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
           <div className="px-4 py-6 space-y-4 ">
                <h2 className="text-xl font-bold mb-4">Popular Posts</h2>
                <div className="space-y-3">
                    {Array.isArray(listings) && listings.map((post) => (
                        <Link
                        to={`/${type}/${post.id}`}
                        key={post._id}
                        className="flex items-center gap-4 p-3 rounded-lg transition hover:bg-gray-800/50 border border-gray-700 hover:border-blue-500"
                        >
                        <img
                            src={post.profilePic || No_image}
                            onError={(e) => (e.target.src = No_image)}
                            alt="profile"
                            className="w-12 h-12 object-cover rounded-full"
                        />
                        <div className="flex-1 text-white">
                            <h3 className="text-lg font-medium leading-tight">{post.title}</h3>
                            <p className="text-sm text-gray-400">{post.username}</p>
                            <div className="mt-1 text-xs text-gray-500">
                            ❤️ {post.likes} Likes
                            </div>
                        </div>
                        </Link>
                    ))}
                    </div>
            </div>
        )
    }
    //new
    else if(type === 'book'){
        body= (
            <div className="px-4 py-6 space-y-4">
        <h2 className="text-2xl font-semibold mb-4">Favorite Books</h2>
        <div className="space-y-3">
            {Array.isArray(listings) && listings.map((book) => (
            <Link
                to={`/${type}/${book.id}`}
                key={book.forID}
                className="flex items-center gap-4 p-3 rounded-lg transition hover:bg-gray-800/50 border border-gray-700 hover:border-blue-500 w-72"
            >
                <img
                src={book.cover || No_image}
                onError={(e) => (e.target.src = No_image)}
                alt="cover"
                className="w-16 h-24 object-cover rounded-md"
                />
                <div className="flex-1 text-white">
                <h3 className="text-lg font-medium leading-tight">{book.title}</h3>
                <p className="text-sm text-gray-400">
                    {book.authors?.join(", ") || "Unknown author"}
                </p>

                </div>
            </Link>
            ))}
        </div>
        </div>
        )
    }

    else if(type === 'show' || type === 'movie')
    {
        body= (
            <div className="px-4 py-6 space-y-4">
                <h2 className="text-xl font-bold mb-4">Favorite {title}</h2>
                <div className="space-y-3">
                    {Array.isArray(listings) && listings.map((media) => (
                        <Link
                        to={`/${type}/${media.id}`}
                        key={media.forID}
                        className="flex items-center gap-4 p-3 rounded-lg transition hover:bg-gray-800/50 border border-gray-700 hover:border-blue-500 w-72"
                        >
                        <img
                            src={media.image || No_image}
                            onError={(e) => (e.target.src = No_image)}
                            alt="media"
                            className="w-16 h-24 object-cover rounded-md"
                        />
                        <div className="flex-1 text-white">
                            <h3 className="text-lg font-medium leading-tight">{media.title}</h3>
                            <div className="mt-1 text-xs text-gray-500 flex gap-4">
                            </div>
                        </div>
                        </Link>
                    ))}
                </div>
            </div>
        )
    }
    return body;
}

export default ListingsVertical;