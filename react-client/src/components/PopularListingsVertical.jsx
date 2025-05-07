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
        return <div>Loading...</div>;
    }
    if(error){
        return <div>Error: {error.message}</div>;
    }
    if(!listings || listings.length === 0){
        return <div>No {Type} listings found</div>;
    }
    let body;
    if(type === 'posts'){
        body=(
            //Todo: Need to figure out tailwind CSS for this component and how to make a visually appealing vertical list of items for posts.
            //So for now it will be a simple normal css
            //I also need to figure out how if this is the right way to add the pictures for the icon?
           <div className="popularListings">
                <ol className="columnListings">
                    { Array.isArray(listings) && listings.map((post) => (
                        <li key={post._id} className="postListing">
                            <Link to= {`/${type}/${post._id}`}>
                                <h2>{post.title}</h2>
                            </Link>                        
                            <img src={post.profilePic || No_image}
                            onError={(e) => e.target.src = No_image}
                            alt="profile_picture" 
                            className="profileIcon"/>
                            <p>{post.username}</p>
                            <p>Likes: {post.likes}</p>
                        </li>
                    ))
                    }
                </ol>
            </div>
        )
    }
    else if(type === 'books'){
        body= (
            //Todo: Need to figure out tailwind CSS for this component, and how to make a visually appealing vertical list of items for books
            //So for now it will be a simple normal css
            <div className="popularListings">
                <ol className="columnListings">
                    { Array.isArray(listings) && listings.map((book)=>(
                        <li key={book.forID} className="listingItem">
                            <Link to={`/${type}/${book.forID}`}>
                                <h2>{book.title}</h2>
                            </Link>                        
                            <img src={book.cover|| No_image}
                             onError={(e) => e.target.src = No_image}
                             alt="listing_image" 
                             className="listingImage"/>
                            <p>Year: {book.publish_year}</p>
                            <p>Authors: {book.authors?.join(", ") ?? 'Unknown authors'}</p>
                            <p>Average Rating: {book.averageRating}</p>
                            <p>Number of Reviews: {book.reviewCount}</p>
                        </li>
                    ))}
                </ol>
            </div>
        )
    }
    else if(type === 'shows' || type === 'movies')
    {
        body= (
            //Todo: Need to figure out tailwind CSS for this component, and how to make a visually appealing vertical list of items for shows/movies
            //So for now it will be a simple normal css
            <div className="popularListings">
                <ol className="columnListings">
                    { Array.isArray(listings) && listings.map((media)=>(
                        <li key={media.forID} className="listingItem">
                            <Link to={`/${type}/${media.forID}`}>
                                <h2>{media.title}</h2>
                            </Link>                        
                            <img src={media.image || No_image} 
                             onError={(e) => e.target.src = No_image}
                             alt="listing_image" 
                             className="listingImage"/>
                            <p>Average Rating: {media.averageRating}</p>
                            <p>Number of Reviews: {media.reviewCount}</p>
                        </li>
                    ))}
                </ol>
            </div>
        )
    }
    return body;
}

export default PopularListingsVertical;