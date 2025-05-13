import { React, useState, useEffect } from "react";
import { useAuth } from "../contexts/authContext";
import { Link, useNavigate, useParams } from "react-router-dom";
import accountService from "../services/accountService";
import ListingsHorizontal from "./ListingsHorizontal";
import ListingsVertical from "./ListingsVertical";
import imageService from "../services/imageService";
import validationFunctions from "../validation/validation";

function Profile(){
    const navigate = useNavigate();

    const { id } = useParams();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [accountData, setAccountData] = useState(undefined);
    const [removeProfilePic, setRemoveProfilePic] = useState(false);
    const [getData, reGetData] = useState(false)
    //user state
    const { currentUser, mongoUser } = useAuth()

    // Edit Modal state
    const [modalActive, setModalActive] = useState(false) 
    const [editedUsername, setEditedUsername] = useState("");
    const [editedPassword, setEditedPassword] = useState("");
    const [editedEmail, setEditedEmail] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [editErr, setEditErr] = useState("")

    const selectFileHandler = (e) => {
        setImageFile(e.target.files[0])
        if (e.target.files[0] == null) {
            setRemoveProfilePic(false)
        } else {
            setRemoveProfilePic(mongoUser.profilePic)
        }
        
    }

    function resetEditAccount (user) {
        setEditedUsername(user.username)
        setEditedPassword("")
        setEditedEmail(currentUser.email)
        setImageFile(null)
        setRemoveProfilePic(false)
    }

    useEffect(() => {
        async function fetchData(){
            try {
                const data = await accountService.getAccount(id);
                setAccountData(data);
                resetEditAccount(data);
                setLoading(false);
            } catch (e) {
                alert(e)
            }
        }
        fetchData();
    }, [id, getData]);

    async function handleSave() {
        try {
            await validationFunctions.validEmail(editedEmail)
            if (editedUsername == '') {
               setEditErr("Your Username must contain some text!")
               return 
             } 
        } catch (e) {
            setEditErr("That's not a valid email!")
            return
        }
        try {
            setEditErr("")
            setLoading(true)
            //build form data
            let profilePic = mongoUser.profilePic
            if (imageFile != undefined) {
                profilePic = await imageService(imageFile);
            }
            
            const updateObj = {
                newUsername: editedUsername.length > 0 ? editedUsername : false,
                newPassword: editedPassword.length > 0 ? editedPassword : false,
                newEmail: editedEmail.length > 0 ? editedEmail : false,
                newProfilePic: profilePic !== undefined ? profilePic : false
            }
            //send to accountService
            const response = await accountService.editAccount(id, updateObj.newUsername, updateObj.newPassword, updateObj.newEmail, updateObj.newProfilePic)
            if (response) {
                setError(null)
                setModalActive(false)
                if(editedEmail.length > 0) {
                    resetEditAccount(mongoUser)
                    navigate(`/account/${id}`, {replace: true});
                }
                setLoading(false)
                resetEditAccount(mongoUser)
                reGetData(!getData)
                window.location.reload();
            }
        } catch(e) {
            console.log(e)
            resetEditAccount(mongoUser)
            setEditErr(e?.message)
        }
    }

    function handleClose() {
        resetEditAccount(mongoUser)
        setModalActive(false)
        setRemoveProfilePic(false);
        setEditErr("")
    }

    function EditAction() {
        return (
            <div className="flex space-x-4 mt-4">
                <button 
                onClick={() => setModalActive(true)} 
                className="px-4 py-2 text-white font-semibold rounded transition"
                >
                    📝 Edit Profile
                </button>
            </div>
        )
    }

    if (loading) {
        return (
            <>Loading...</>
        )
    }

    if (error) {
        return (
            <>{error}</>
        )
    }
    return (
        <div>

            <div className="flex justify-end px-4 py-3 mx-2">
                {id === currentUser.displayName ? <EditAction/> : null}
            </div>

            <div className="flex justify-start space-x-10 items-center my-5">
                <img
                    src={accountData.profilePic}
                    alt="Poster profile"
                    className="w-20 h-20 rounded-full object-cover border"
                  />
                <h1>{accountData.username}</h1>
            </div>

            <div><ListingsHorizontal title="Posts" cards={accountData.postCards} type="posts" /></div>
            <span className="flex flex-col items-center md:flex-row md:items-start gap-6 mb-10">
                <div><ListingsVertical type="book" data={accountData.topBooks} title="Books"/></div>
                <div><ListingsVertical type="movie" data={accountData.topMovies} title="Movies" /></div>
                <div><ListingsVertical type="show" data={accountData.topShows} title="Shows" /></div>
            </span>
            
            {/*edit modal*/}
            {modalActive && (
                <div className="fixed inset-0 flex items-center bg-gray-400/50 justify-center z-50">
                    <div className="bg-black p-6 rounded-lg w-full max-w-lg space-y-4 shadow-xl">
                        <h2 className="text-2x1 font-bold">Edit Profile</h2>

                        {editErr && (
                            <div className="text-red-600">{editErr}</div>
                        )}

                        <label className="text-lg" for="Username">Username:</label>
                        <input 
                            id="username"
                            type="text"
                            autoComplete="new-password"
                            value={editedUsername}
                            onChange={(e) => setEditedUsername(e.target.value)}
                            className="w-full border my-2 dark:bg-zink-900 border-gray-300 rounded px-3 py-2"
                        />
                        <br />
                        <label className="text-lg" for="Password">Password:</label>
                        <input 
                            id="password"
                            type="password"
                            autoComplete="new-password"
                            value={editedPassword}
                            onChange={(e) => setEditedPassword(e.target.value)}
                            className="w-full border my-2 dark:bg-zink-900 border-gray-300 rounded px-3 py-2"
                        />
                        <br />
                        <label className="text-lg" for="Email">Email:</label>
                        <input 
                            id="email"
                            type="email"
                            autoComplete="off"
                            value={editedEmail}
                            onChange={(e) => setEditedEmail(e.target.value)}
                            className="w-full border my-2 dark:bg-zink-900 border-gray-300 rounded px-3 py-2"
                        />
                        <label className="text-lg" for="ProfilePic">Profile Picture:</label>
                        <input 
                            id="profilepic"
                            type="file"
                            accept="image/*"
                            onChange={selectFileHandler}
                            className="bg-white block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded 
                            file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />

                        {mongoUser.profilePic && !removeProfilePic && mongoUser.profilePic !== "react-client/public/nouser.jpg" && (
                            <div className="relative inline-block w-20 h-20">
                                <img
                                    src={mongoUser.profilePic}
                                    alt="Current Profile"
                                    className="w-20 h-20 rounded-full object-cover border"
                                />
                            </div>
                        )}
                        {imageFile && removeProfilePic && (
                            <div className="relative inline-block w-20 h-20">
                                <img
                                    src={imageFile}
                                    alt="New Profile Image"
                                    className="w-20 h-20 rounded-full object-cover border"
                                />
                            </div>
                        )}

                       <div className="flex justify-end space-x-2">
                            <button 
                                onClick={() => handleClose()}
                                className="px-4 py-2 bg-gray-200 text-gray-300 rounded hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => handleSave()}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Save Changes
                            </button>
                        </div> 
                    </div>

                    
                </div>

            )}
        </div>
    );
}

export default Profile