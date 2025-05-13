import React, { useState, useEffect } from "react";
import postService from "../services/postService";
import ListingsHorizontal from "./ListingsHorizontal";

function SearchPosts({title, type}) {

    const [ searchQuery, setSearchQuery ] = useState('');
    const [ searchResults, setSearchResults ] = useState([]);
    const [ error, setError ] = useState(null)

    useEffect(() => {
        async function fetchData() {
            if (searchQuery) {
                try {
                    const data = await postService.searchPosts(searchQuery, type);
                    setSearchResults(data);
                } catch (err) {
                    setError(err);
                    console.log(err);
                }
            }
        }
        fetchData()
    }, [searchQuery])

    const handleChange = (e) => {
        setSearchQuery(e.target.value);
    }

    let body = null
    if (error) {
        body = <div className="py-10 text-red-500">Error: {error.message}</div>
    } else if (searchResults && searchResults.length > 0) {
        body = <div>
            <p className="mt-5 text-gray-500 text-center">Showing {searchResults.length} results for "{searchQuery}"</p>
            <ListingsHorizontal cards={searchResults} type='posts' limit='30' />
        </div>
    } else {
        body = <div className="py-25 text-gray-500 text-center">No Results</div>;
    }
    return (
        <div>
            {title? <h2 className="text-xl font-bold mb-4">{title}</h2> : null}
            <form
                method='POST'
                onSubmit={(e) => e.preventDefault()}
                >
                    <input autoComplete="off" type="text" onChange={handleChange} className= "w-full border dark:bg-zinc-900 border-gray-300 rounded px-5 py-2" />
            </form>
            {body}
        </div>
    );

}

export default SearchPosts