import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import postService from "../services/postService";
import accountService from "../services/accountService";
import imageService from "../services/imageService";
import No_image from "../assets/no_image.png";


function Post() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [getData, reGetData] = useState(false) // used after Edit post to re-trigger useEffect

    // User state
    const {userLoggedIn, mongoUser, currentUser } = useAuth(); 

    // Edit Modal state
    const [modalActive, setModalActive] = useState(false) 
    const [editedTitle, setEditedTitle] = useState(null);
    const [editedBody, setEditedBody] = useState(null);
    const [editedSection, setEditedSection] = useState(null);
    const [editedImages, setEditedImages] = useState(null);
    const [uploadedImages, setUploadedImages] = useState([])

    // Like/Dislike state
    const [userLikeState, setUserLikeState] = useState("") 

    // Post data state
    const [ editErr, setEditErr ] = useState("")
    const [ loading, setLoading ] = useState(true); 
    const [ error, setError] = useState(null)
    const [ post, setPostData ] = useState(undefined);

    
    function resetEditPost (postObj) {
        setEditedTitle(postObj.title)
        setEditedBody(postObj.body)
        setEditedSection(postObj.section)
        setEditedImages(postObj.images)
        setEditErr("")
        setUploadedImages([])
    } 

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true)
                const postResponse = await postService.getPost(id);
                if (userLoggedIn) {
                  const userRespnse = await accountService.getAccount(currentUser.displayName)
                  if (userRespnse.dislikedPosts.includes(id)) {
                    setUserLikeState("dislikes")
                  } else if (userRespnse.likedPosts.includes(id)) {
                    setUserLikeState("likes")
                  } else {
                    setUserLikeState("none")
                  }
                }
                // Making quite the STATEment here! :))
                resetEditPost(postResponse)
                setPostData(postResponse)
                setError(null)
            } catch (e) {
                setError(e)
                setPostData(null)
            } finally {
                setLoading(false)
            }
        }
        fetchData().then(() => console.log('useffect state: ', userLikeState));
    }, [id, userLikeState, getData]);

    async function handleSave () {
      try {
        if (editedBody == '') {
          setEditErr("Your body must contain some text!")
          return 
        } 
        if (editedTitle == '') {
          setEditErr("You can't have a post without a title!")
          return
        } 
        if (editedSection == '') {
          setEditErr("Don't forget to select a section!")
          return
        }
      } catch (e) {
        throw e
      }
        try {
            // build image url array
            let updatedImages;
            if (uploadedImages.length > 0) { // If new images, upload to google storage
                try{
                    const uploadedURLs = await Promise.all(uploadedImages.map(async (file) => await imageService(file)))
                    updatedImages = editedImages.concat(uploadedURLs)
                } catch (e) {
                    console.log("Error in uploading images: ")
                    throw e
                }
            } else { // No new images, just take remaining existing images
                updatedImages = editedImages
            }

            if (editedSection == '') {
              throw new Error('Error: Please select a section')
            }

            // build form data
            const updateObj = {
                body: editedBody,
                title: editedTitle,
                section: editedSection,
                images: updatedImages
            }
            // send form data to postService.updatePost(id, updateObj)
            const response = await postService.updatePost(id, updateObj)
            if (response) {
                setError(null)
                setModalActive(false)
                resetEditPost(post)
                reGetData(!getData) // Re-fetch post data to update page
            }
        } catch (e) {
            console.log(e)
            setError(e)
        }
    }

    function handleClose () {
        setModalActive(false)
        resetEditPost(post)
    }

    const handleLike = async () => {
        try {
          setLoading(true);
          const state = await postService.toggleLikedPost(id, currentUser.displayName);
          setUserLikeState(state)
          setLoading(false);
          setError(null)
        } catch (err) {
          console.error("Failed to like post:", err);
          setError(err)
        }
      };
    
      const handleDislike = async () => {
        try {
          setLoading(true);
          const state = await postService.toggleDislikedPost(id, currentUser.displayName);
          setUserLikeState(state)
          setLoading(false);
          setError(null)
        } catch (err) {
          console.error("Failed to dislike post:", err);
          setError(err)
        }
      };

    const capFirst = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1)
    }

    function PostActions() {
      const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this post?")) {
          const response = await postService.deletePost(id)
          if (response) {
            navigate(-1)
          } else {
            setError("Could not delete post")
          }
        }
      };
    
      return (
        <div className="flex space-x-4 mt-4">
          <button
            onClick={() => setModalActive(true)}
            className="px-4 py-2 dark:text-white font-semibold rounded transition"
          >
            📝 Edit Post
          </button>
    
          <button
            onClick={handleDelete}
            className="px-4 py-2 dark:text-white font-semibold rounded transition"
          >
            🗑️ Delete Post
          </button>
        </div>
      );
    }
    if (loading) {
        return (
            <>Loading...</>
        )
    }

    if (error) {
        return (
            <>{error.message}</>
        )
    }

    const handleFileChange = (e) => {
        e.preventDefault()
        const files = Array.from(e.target.files);
        setUploadedImages(files);
      };
    
      const removeImage = (index) => {
        const updated = [...editedImages];
        updated.splice(index, 1);
        setEditedImages(updated);
      };

    const removeUploadedImage = (index) => {
        const updated = [...uploadedImages]
        updated.splice(index, 1)
        setUploadedImages(updated)
    }


    return(
    <div>
        <div className="flex justify-end px-4 py-3 mx-2">
            {currentUser?.displayName === post.posterID? <PostActions/> : null}
        </div>
        <hr className="dark:text-gray-500"/>
        
        <div className="grid grid-cols-2 flex-row gap-50">
            <div className=" mx-auto bg-gray overflow-hidden p-6 space-y-4">

                <h1 className="text-2xl font-bold dark:text-gray-200">{post.title}</h1>

                {/* Poster Info */}
                <Link to={`/account/${post.posterID}`} className="flex items-center">
                  <img
                    src={post.posterPic ? post.posterPic : No_image}
                    alt="Poster profile"
                    className="w-14 h-14 rounded-full object-cover border"
                  />
                  <elem className="mx-4">
                    <p className="text-sm font-medium text-gray-400">By: {post.posterUsername}</p>
                    <p className="text-xs text-gray-500">{new Date(post.timeStamp).toLocaleString()}</p>
                  </elem>
                </Link>



                {/* Section Tag */}
                <div className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                  {capFirst(post.section)}
                </div>

                {/* Body */}
                <p className="dark:text-gray-400 text-base whitespace-pre-line">{post.body}</p>

                {/* Likes / Dislikes */}
                {userLoggedIn? (
                <div className="flex items-center space-x-6 pt-2 text-sm text-gray-600">
                  <button onClick={() => handleLike().then(() => console.log('like: ',userLikeState))}>👍 {post.likes}</button>
                  <button onClick={() => handleDislike().then(() => console.log('dislike: ',userLikeState))}>👎 {post.dislikes}</button>
                </div>
                ) : null}

            </div>
            <div className="mx-auto bg-gray overflow-hidden p-6 space-y-4">
                {/* Images */}
             {post.images && post.images.length > 0 && (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {post.images.map((imgUrl, idx) => (
                   <img
                     key={idx}
                     src={imgUrl}
                     alt={`Post image ${idx + 1}`}
                     className="w-full h-60 object-cover rounded-md"
                   />
                 ))}
               </div>
             )}
            </div>
        </div>
        {modalActive && (
              <div className="text-white fixed inset-0 flex items-center bg-gray-400/50 justify-center z-50">
                <div className="bg-black p-6 rounded-lg w-full max-w-lg space-y-4 shadow-xl">
                  {editErr != '' ? (<p className="text-red-400 font-bold">Error: {editErr}</p>) : null}
                  <h2 className="text-2xl font-bold">Edit Post</h2>
                    
                  <label className="text-lg" for='title'>Title:</label>
                  <input
                    id='title'
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full border my-2 bg-zinc-900 border-gray-300 rounded px-3 py-2"
                  />
                    <br/>
                    <div className="flex flex-row items-center">
                  <label className="text-lg" for='section'>Section:</label>
                  <select
                      id='section'
                      value={editedSection}
                      onChange={(e) => setEditedSection(e.target.value)}
                      className="block w-full mx-2 my-2 px-3 py-2 border border-gray-300 bg-zinc-900 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                      <option value="">Select a section</option>
                      <option value="show">Show</option>
                      <option value="movie">Movie</option>
                      <option value="book">Book</option>
                      <option value="dnd">Dungeons & Dragons</option>
                  </select>
                </div>
                  <label className="text-lg" for='body'>Body:</label>
                  <textarea
                    id='body'
                    value={editedBody}
                    onChange={(e) => setEditedBody(e.target.value)}
                    className="w-full border my-2 bg-zinc-900 border-gray-300 rounded px-3 py-2"
                    rows={5}
                  />
                  <br/>
                  <br/>
                <label className="block text-sm font-medium text-gray-300">
                    Upload Images
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 
                             file:rounded file:border-0 file:text-sm file:font-semibold 
                             file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />

                <div className="flex flex-wrap gap-4 mt-2">
                  {editedImages.map((src, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={src}
                        alt={`upload-${idx}`}
                        className="h-24 w-24 object-cover rounded shadow"
                      />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute top-0 right-0 text-black dark:text-white bg-red-600 rounded-full px-1 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {uploadedImages.map((src, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={src}
                        alt={`upload-${idx}`}
                        className="h-24 w-24 object-cover rounded shadow"
                      />
                      <button
                        onClick={() => removeUploadedImage(idx)}
                        className="absolute top-0 right-0 text-black dark:text-white bg-red-600 rounded-full px-1 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>


                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleClose()}
                      className="px-4 py-2 bg-gray-200 text-black dark:text-gray-300 rounded hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSave()}
                      className="px-4 py-2 bg-blue-600 text-black dark:text-white rounded hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
    </div>
    )
}

export default Post