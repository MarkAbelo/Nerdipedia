import React, {useState} from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/authContext'
import imageService from '../services/imageService'
import postService from '../services/postService'

export default function CreatePost() {

    const {currentUser} = useAuth()

    const navigate = useNavigate()

    const [error, setError] = useState(null)

    const [title, setTitle] = useState("")
    const [body, setBody] = useState("")
    const [section, setSection] = useState("")
    const [images, setImages] = useState([])

    const handleFileChange = (e) => {
        e.preventDefault()
        const files = Array.from(e.target.files);
        setImages(files);
    };
    
    const removeImage = (index) => {
        const updated = [...images];
        updated.splice(index, 1);
        setImages(updated);
    };

    const handleReset = () => {
        if (window.confirm("Are you sure you want to reset your post? Everything you have input will be permanently deleted.")) {
            setTitle("")
            setBody("")
            setSection("")
            setImages([])
        }
    }

    const handlePost = async () => {
        try {
            // build image url array
            let imageURLs = [];
            if (images.length > 0) { // If images, upload to google storage
                try{
                    imageURLs = await Promise.all(images.map(async (file) => await imageService(file)))
                } catch (e) {
                    console.log("Error in uploading images: ")
                    throw e
                }
            }
            // build form data
            const postObj = {
                posterID: currentUser.displayName,
                body: body,
                title: title,
                section: section,
                images: imageURLs
            }
            // send form data to postService.createPost(postObj)
            const response = await postService.createPost(postObj) // Returns new post's ID
            setError(null)
            navigate(`/post/${response}`)
        } catch (e) {
            console.log(e)
            setError(e)
        }
    }

    if (error) {
        return (
            <>{error.message}</>
        )
    }
  return (
    <div className="flex items-center justify-center z-50">
      <div className="p-6 rounded-lg w-full max-w-3xl space-y-4 shadow-xl border-1 border-zinc-800">
        <h2 className="text-2xl font-bold">Create Post</h2>
          
        <label className="text-lg" for='title'>Title:</label>
        <input
          id='title'
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border my-2 bg-zinc-900 border-gray-300 rounded px-3 py-2"
        />
          <br/>
          <div className="flex flex-row items-center">
        <label className="text-lg" for='section'>Section:</label>
        <select
            id='section'
            value={section}
            onChange={(e) => setSection(e.target.value)}
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
          value={body}
          onChange={(e) => setBody(e.target.value)}
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
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded 
                   file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />

      <div className="flex flex-wrap gap-4 mt-2">
        {images.map((src, idx) => (
          <div key={idx} className="relative">
            <img
              src={src}
              alt={`upload-${idx}`}
              className="h-24 w-24 object-cover rounded shadow"
            />
            <button
              onClick={() => removeImage(idx)}
              className="absolute top-0 right-0 text-white bg-red-600 rounded-full px-1 text-xs"
            >
              ✕
            </button>
          </div>
        ))}
      </div>


        <div className="flex justify-end space-x-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-200 text-gray-300 rounded hover:bg-gray-300"
          >
            Reset Post
          </button>
          <button
            onClick={handlePost}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Post!
          </button>
        </div>
      </div>
    </div>
  )
}
