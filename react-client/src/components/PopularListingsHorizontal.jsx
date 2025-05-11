import { React, useState, useEffect} from "react";
import {Link} from "react-router-dom";
import No_image from "../assets/no_image.png";
import axios from "axios";

function PopularListingsHorizontal({type}) {
    //I don't think we actually need 'section' for this component because its on the Home page (not entirely sure but this my guess)
    //Actually on second thought, i don't think we need post at all because it would look terrible
    //I will keep it in for now, we can always remove it later if we need to 
    const typeToQuery = {
        'shows': 'popularShows',
        'movies': 'popularMovies',
        'books': 'popularBooks'
    }
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        async function fetchData() {
            try {
                //const params = type === 'posts' && section ? { n: 10, section: section } : { n: 10 };
                const {data} = await axios.get(`http://localhost:3000/${type}/${typeToQuery[type]}`,
                    {params:{
                        n: 10,
                    }
                });
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
    if(type === 'books'){
        body= (
            <div className="px-4 py-6">
                <h2 className="text-xl font-bold mb-4" >Popular Books</h2>
                <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide">
                    { Array.isArray(listings) && listings.map((book)=>(
                        <div key={book.forID} 
                            className="relative flex-shrink-0 w-48 transition-transform hover:scale-105">
                            <Link to={`/${type}/${book.forID}`} className="block">
                              
                                               
                            <img src={book.cover|| No_image}
                             onError={(e) => e.target.src = No_image}
                             loading="lazy"
                             alt="listing_image" 
                             className="w-full h-64 object-cover"/>
                            
                            <div className="absolute top-0 left-0 right-0 p-2 bg-gradient-to-b from-black/60 to-transparent">
                                <h3 className="text-white font-bold text-sm truncate">
                                    {book.title}
                                </h3>
                            </div>

                            {/*this is the hover part Jesus christ this is pain*/}
                            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-2">
                                <div className="text-white text-center">
                                    <div className="flex items-center justify-center mb-2">
                                        <div className="flex flex-col gap-1">
                                            {/*I can't think of a better method*/}
                                            <div>⭐{book.averageRating}</div>
                                            <div>📝 {book.reviewCount}</div>
                                            <div>📅 {book.publish_year}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-2 px-1">
                                <h3 className="font-semibold truncate">{book.title}</h3>
                                <p className="text-sm text-gray-600 truncate">
                                    {book.authors?.join(", ") || 'Unknown author'}
                                </p>
                            </div>
                        </Link> 
                        </div>
                    ))}
                </div>
            </div>
        )
    }
    else if(type === 'shows' || type === 'movies') {
        body = (
            <div className="px-4 py-6">
                <h2 className="text-xl font-bold mb-4">Popular {type.charAt(0).toUpperCase() + type.slice(1)}</h2>
                <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide">
                    {Array.isArray(listings) && listings.map((media) => (
                        <div 
                            key={media.forID} 
                            className="relative flex-shrink-0 w-48 transition-transform hover:scale-105 group"
                        >
                            <Link to={`/${type}/${media.forID}`} className="block">
                                <div className="relative rounded-lg overflow-hidden">
                                    <img 
                                        src={media.image || No_image} 
                                        loading="lazy"
                                        alt={media.title} 
                                        className="w-full h-64 object-cover"
                                        onError={(e) => e.target.src = No_image}
                                    />
                                    
                                    <div className="absolute top-0 left-0 right-0 p-2 bg-gradient-to-b from-black/60 to-transparent">
                                        <h3 className="text-white font-bold text-sm truncate">
                                            {media.title}
                                        </h3>
                                    </div>
    
                                    {/*this is the hover part Jesus christ this is pain*/}
                                    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-2">
                                        <div className="text-white text-center">
                                            <div className="flex items-center justify-center mb-2">
                                                <div className="flex flex-col gap-1">
                                                    <div>⭐ {media.averageRating}</div>
                                                    <div>📝 {media.reviewCount} reviews</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        )
    }
    return body;
}

export default PopularListingsHorizontal;