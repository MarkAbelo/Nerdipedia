import { React, useState, useEffect, useRef} from "react";
import {Link} from "react-router-dom";
import No_image from "../assets/no_image.png";

function ListingsHorizontal({title, cards, type, noneFoundMessage, forSearch}) {    
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
        const currentRef = scrollRef.current;
        if (currentRef) {
          currentRef.addEventListener("scroll", checkScroll);
          checkScroll();
        }
        return () => {
          if (currentRef) currentRef.removeEventListener("scroll", checkScroll);
        };
      }, [cards]); 

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
      
    
    if(!cards || cards.length === 0){
        return (
            <div className="px-8 py-6">
                {title? <h2 className="text-xl font-bold mb-4">{title}</h2> : null}
                <div className="p-4 text-gray-500">{noneFoundMessage? noneFoundMessage : `No ${type} found`}</div>
            </div>
        );
    }
    let body;
    if (type === 'posts') {
        body = (
            <div className="px-0 py-6">
                {title? <h2 className="text-xl font-bold mb-4">{title}</h2> : null}
                <div className="relative -mx-4">
                    <div
                        ref={scrollRef}
                        className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide"
                    >
                        {Array.isArray(cards) && cards.map((post) => (
                            <div 
                                key={post._id} 
                                className="relative flex-shrink-0 w-60 transition-transform hover:scale-105 group"
                            >
                                <Link to={`/post/${post._id}`} className="block pt-5">
                                    {/*Poster Info*/}
                                    <div className="relative flex items-center space-x-4">
                                        <img
                                            src={post.posterProfilePic}
                                            alt="Poster profile"
                                            className="w-14 h-14 rounded-full object-cover border"
                                        />
                                        <div>
                                            <p className="text-sm font-medium dark:text-gray-400">By {post.posterUsername}</p>
                                            <p className="text-xs text-gray-500">{new Date(post.timeStamp).toLocaleString()}</p>
                                        </div>
                                    </div>
    
                                    {/*Bottom text*/}
                                    <div className="mt-2 px-1">
                                        <h3 className="font-semibold truncate">{post.title}</h3>
                                        <p className="text-sm text-gray-600 truncate right-0">
                                            {post.likes} Likes 👍
                                        </p>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                    <ScrollArrows />
                </div>
            </div>
        )
    }
    else if(type === 'books'){
        body = (
            <div className="px-4 py-6">
                <h2 className="text-xl font-bold mb-4">{title}</h2>
                <div className="relative -mx-4">
                    <div
                        ref={scrollRef}
                        className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide"
                    >
                        {Array.isArray(cards) && cards.map((book) => (
                            <div 
                                key={book.forID? book.forID : book.id} 
                                className="relative flex-shrink-0 w-48 transition-transform hover:scale-105 group"
                            >
                                <Link to={`/book/${book.forID? book.forID : book.id}`} className="block">
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
                                        {book.averageRating && book.reviewCount? (
                                        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-2">
                                            <div className="text-white text-center">
                                                <div className="flex flex-col gap-1">
                                                    <div>⭐ {book.averageRating}</div>
                                                    <div>📝 {book.reviewCount}</div>
                                                </div>
                                            </div>
                                        </div>
                                        ) : null}
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
                <h2 className="text-xl font-bold mb-4">{title}</h2>
                <div className="relative -mx-4">
                    <div
                        ref={scrollRef}
                        className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide"
                    >
                        {Array.isArray(cards) && cards.map((media) => (
                            <div 
                                key={media.forID? media.forID : media.id} 
                                className="relative flex-shrink-0 w-48 transition-transform hover:scale-105 group"
                            >
                                <Link to={`/${type ==='shows'? 'show' : 'movie'}/${media.forID? media.forID : media.id}`} className="block">
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
                                        {media.averageRating && media.reviewCount? (
                                        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-2">
                                            <div className="text-white text-center">
                                                <div className="flex flex-col gap-1">
                                                    <div>⭐ {media.averageRating}</div>
                                                    <div>📝 {media.reviewCount} reviews</div>
                                                </div>
                                            </div>
                                        </div>
                                        ) : null}
                                    </div>
    
                                    {/*Bottom text*/}
                                    <div className="mt-2 px-1">
                                        <h3 className="font-semibold truncate">{media.title}</h3>
                                        <p className="text-sm text-gray-600 truncate">
                                            {media.premiered || 'Unknown release date'}
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

export default ListingsHorizontal;