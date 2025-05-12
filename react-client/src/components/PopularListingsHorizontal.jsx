import { React, useState, useEffect, useRef} from "react";
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
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);
    const scrollRef = useRef(null);

    const checkScroll = () => {
        if (scrollRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
          setShowLeftArrow(scrollLeft > 0);
          setShowRightArrow(scrollLeft + clientWidth < scrollWidth);
        }
      };
    
      const handleScrollLeft = () => {
        if (scrollRef.current) {
          const scrollAmount = -scrollRef.current.clientWidth * 0.8;
          scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
      };
    
      const handleScrollRight = () => {
        if (scrollRef.current) {
          const scrollAmount = scrollRef.current.clientWidth * 0.8;
          scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
      };

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
                // const params = type === 'posts' && section ? { n: 10, section: section } : { n: 10 };
                const {data} = await axios.get(`http://localhost:3000/${type}/${typeToQuery[type]}`,
                    {params:{
                        n: 10,
                    }
                });
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

    useEffect(() => {
        const currentRef = scrollRef.current;
        if (currentRef) {
          currentRef.addEventListener("scroll", checkScroll);
          checkScroll();
        }
        return () => {
          if (currentRef) currentRef.removeEventListener("scroll", checkScroll);
        };
      }, [listings]); 
      const ScrollArrows = () => (
        <div>
            <button
                onClick={handleScrollLeft}
                className={`absolute left-0 top-1/2 -translate-y-1/2 bg-amber-50/90 hover:bg-amber-100 backdrop-blur-sm border-2 border-amber-900/30 text-amber-900 rounded-lg p-3 z-10 transition-all duration-300 shadow-lg shadow-amber-900/10 hover:shadow-amber-900/20 ${
                    showLeftArrow ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
                aria-label="Scroll left"
                >
                <span className="text-2xl font-serif font-bold transform hover:-translate-x-1 transition-transform">
                    «
                </span>
                </button>

                <button
                onClick={handleScrollRight}
                className={`absolute right-0 top-1/2 -translate-y-1/2 bg-amber-50/90 hover:bg-amber-100 backdrop-blur-sm border-2 border-amber-900/30 text-amber-900 rounded-lg p-3 z-10 transition-all duration-300 shadow-lg shadow-amber-900/10 hover:shadow-amber-900/20 ${
                    showRightArrow ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
                aria-label="Scroll right"
                >
                <span className="text-2xl font-serif font-bold transform hover:translate-x-1 transition-transform">
                    »
                </span>
                </button>
        </div>
      );
      
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
        body = (
            <div className="px-4 py-6">
                <h2 className="text-xl font-bold mb-4">Popular Books</h2>
                <div className="relative -mx-4">
                    <div
                        ref={scrollRef}
                        className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide"
                    >
                        {Array.isArray(listings) && listings.map((book) => (
                            <div 
                                key={book.forID} 
                                className="relative flex-shrink-0 w-48 transition-transform hover:scale-105 group"
                            >
                                <Link to={`/${type}/${book.forID}`} className="block">
                                    {/*Image container*/}
                                    <div className="relative">
                                        <img 
                                            src={book.cover || No_image}
                                            onError={(e) => e.target.src = No_image}
                                            loading="lazy"
                                            alt={book.title}
                                            className="w-full h-64 object-cover"
                                        />
                                        
                                        {/*Title overlay*/}
                                        <div className="absolute top-0 left-0 right-0 p-2 bg-gradient-to-b from-black/60 to-transparent">
                                            <h3 className="text-white font-bold text-sm truncate">
                                                {book.title}
                                            </h3>
                                        </div>
    
                                        {/*Hover overlay*/}
                                        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-2">
                                            <div className="text-white text-center">
                                                <div className="flex flex-col gap-1">
                                                    <div>⭐ {book.averageRating}</div>
                                                    <div>📝 {book.reviewCount}</div>
                                                    <div>📅 {book.publish_year}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
    
                                    {/*Bottom text*/}
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
                    <ScrollArrows />
                </div>
            </div>
        );
    }    
    else if (type === 'shows' || type === 'movies') {
        body = (
            <div className="px-4 py-6">
                <h2 className="text-xl font-bold mb-4">Popular {type.charAt(0).toUpperCase() + type.slice(1)}</h2>
                <div className="relative -mx-4">
                    <div
                        ref={scrollRef}
                        className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide"
                    >
                        {Array.isArray(listings) && listings.map((media) => (
                            <div 
                                key={media.forID} 
                                className="relative flex-shrink-0 w-48 transition-transform hover:scale-105 group"
                            >
                                <Link to={`/${type}/${media.forID}`} className="block">
                                    {/*Image container*/}
                                    <div className="relative rounded-lg overflow-hidden">
                                        <img 
                                            src={media.image || No_image} 
                                            onError={(e) => e.target.src = No_image}
                                            loading="lazy"
                                            alt={media.title} 
                                            className="w-full h-64 object-cover"
                                        />
    
                                        {/*Title overlay*/}
                                        <div className="absolute top-0 left-0 right-0 p-2 bg-gradient-to-b from-black/60 to-transparent">
                                            <h3 className="text-white font-bold text-sm truncate">
                                                {media.title}
                                            </h3>
                                        </div>
    
                                        {/*Hover overlay*/}
                                        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-2">
                                            <div className="text-white text-center">
                                                <div className="flex flex-col gap-1">
                                                    <div>⭐ {media.averageRating}</div>
                                                    <div>📝 {media.reviewCount} reviews</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
    
                                    {/*Bottom text*/}
                                    <div className="mt-2 px-1">
                                        <h3 className="font-semibold truncate">{media.title}</h3>
                                        <p className="text-sm text-gray-600 truncate">
                                            {media.releaseYear || 'Unknown year'}
                                        </p>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                    <ScrollArrows />
                </div>
            </div>
        );
    }
    
    return body;
}

export default PopularListingsHorizontal;