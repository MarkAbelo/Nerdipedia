import React, { useState, useEffect } from "react";
import movieService from "../services/movieService";
import ListingsHorizontal from "./ListingsHorizontal";

function SearchMovies() {

    const [ searchParams, setSearchParams ] = useState({
        pageNum: 1,
        searchQuery: '' 
    })
    const [ searchResults, setSearchResults ] = useState([]);
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState(null)

    useEffect(() => {
        async function fetchData() {
            if (searchParams.searchQuery) {
                try {
                    const data = await movieService.searchMovie(searchParams.searchQuery, searchParams.pageNum);
                    console.log(data)
                    setSearchResults(data);
                    setLoading(false);
                } catch (err) {
                    setError(err);
                    console.log(err);
                    setLoading(false);
                }
            }
        }
        fetchData()
    }, [searchParams])

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        let term = document.getElementById('searchParam').value.trim();
        setSearchParams({searchQuery: term, pageNum: 1});
    }

    const handleMoreResults = (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSearchParams(params => (
            {...params, pageNum: params.pageNum + 1}
        ));
    }

     const handleClearSearch = (e) => {
        e.preventDefault();
        setSearchParams({
            pageNum: 1,
            searchQuery: '' 
        })
        document.getElementById('searchParam').value = '';
        setSearchResults([]);
        setError(null)
        setLoading(false);
    }

    let body = null
    if (error) {
        body = <div className="py-10 text-red-500">Error: {error.message}</div>
    } else if (loading) {
        body = <div className="py-25 text-gray-500 text-center">Loading . . .</div>; 
    } else if (searchResults && searchResults.length > 0) {
        body = <div>
            <p className="mt-5 text-gray-500 text-center">Showing results for "{searchParams.searchQuery}"</p>
            <ListingsHorizontal cards={searchResults} type='movies' limit='30' />
        </div>
    } else {
        body = <div className="py-25 text-gray-500 text-center">No Results</div>;
    }
    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Search Movies</h2>
            <form
                method='POST'
                onSubmit={handleSubmit}
                className= "flex justify-between space-x-5"
                >
                <input id='searchParam' autoComplete="off" type="text" className= "w-full border dark:bg-zinc-900 border-gray-300 rounded px-5 py-2" />
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" type="submit">Search</button>
            </form>
            {body}
            <div className="flex justify-end space-x-5">
                {searchResults && searchResults.length > 0? <button onClick={handleMoreResults} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" type="submit">More Results</button> : null}
                {searchParams.pageNum > 1 || searchParams.searchQuery.length > 0? <button onClick={handleClearSearch} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" type="submit">Clear Search</button> : null}
            </div>
        </div>
    );

}

export default SearchMovies