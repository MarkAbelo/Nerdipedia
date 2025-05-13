import { React, useState, useEffect} from "react";
import ListingsHorizontal from "./ListingsHorizontal";
import postService from "../services/postService";

function RecentPosts({type}) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {                
                const data = await postService.getRecentPosts(20, type);
                setPosts(data);
                setLoading(false);
            }
            catch(err){
                setLoading(false);
                setError(err);
                console.log(err);
            }
        }
        fetchData();
    }, [type]);

    if(loading){
        return <div className="p-4 text-gray-500">Loading...</div>;
    }
    if(error){
        return <div className="p-4 text-red-500">Error: {error.message}</div>;
    }
    return <ListingsHorizontal title="Recent Posts" cards={posts} type="posts" />
}

export default RecentPosts;