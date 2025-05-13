import React, { useState } from "react";
import validationFunctions from "../../../data-server/validation/validation";
import { useNavigate } from "react-router-dom";
import accountService from "../services/accountService";
import imageService from "../services/imageService";


function Register() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        passwordConfirm: '',
    });
    const [imageFile, setImageFile] = useState(null);
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const selectFileHandler = (e) => {
        setImageFile(e.target.files[0]);
    }

    const handleChange = async(e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setServerError('');
        setSuccessMessage('');

        //validate inputs
        try {
            if (name === 'email') await validationFunctions.validEmail(value);
            if (name === 'password') await validationFunctions.validPassword(value);
            if (name === 'username') await validationFunctions.validString(value, 'Username')
            setErrors(prev => ({ ...prev, [name]: '' })); //clears error
        } catch(e) {
            setErrors(prev => ({ ...prev, [name]: e.toString() }));
        }

        //check if passwords match
        if (name === 'passwordConfirm' || name === 'password') {
            const passwordToCompare = name === 'password' ? value : formData.password;
            const confirmToCompare = name === 'passwordConfirm' ? value : formData.passwordConfirm;

            if (confirmToCompare && passwordToCompare !== confirmToCompare) {
                setErrors(prev => ({ ...prev, passwordConfirm: 'Passwords do not match' }));
            } else {
                setErrors(prev => ({ ...prev, passwordConfirm: '' }));
            }
        }
    };

    const handleSubmit = async(e) => {
        e.preventDefault();

        let profilePic = null
        try {
            profilePic = await imageService(imageFile);
        } catch (err) {
            setServerError('Could not upload image file');
            console.log(err)
        }

        //validate before submitting
        let username;
        let email;
        let password;
        try {
            username = await validationFunctions.validString(formData.username, 'Username');
            email = await validationFunctions.validEmail(formData.email);
            password = await validationFunctions.validPassword(formData.password);
            if (profilePic.trim()) profilePic = await validationFunctions.validURL(profilePic, 'Profile picture URL'); 

        } catch (err) {
            setServerError(err.toString());
            return;
        }

        //create account using data service
        try {
            await accountService.createAccount(username, password, email, profilePic)
            setSuccessMessage("Account created successfully!");
            setFormData({ username: '', email: '', password: '', profilePic: '' });
            setTimeout(() => navigate("/login"), 1500); 
        } catch(err) {
            setServerError(err.toString());
            return;
        }

    }
        
    

    return(
        <div className="card bg-teal-700 dark:bg-gray-800">
            <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: 'auto' }}>
            <h2 className="mb-5 text-[30px] font-bold">Register Account</h2>

            <div className="m-4 grid">
                <label>Username:</label>
                <input name="username" className="bg-white dark:bg-gray-700 dark:text-white pl-2 rounded" value={formData.username} onChange={handleChange} /><br />
                {errors.username && <p className="errorText">{errors.username}</p>}
            
                <label>Email:</label>
                <input name="email" className="bg-white dark:bg-gray-700 dark:text-white pl-2 rounded" value={formData.email} onChange={handleChange} /><br />
                {errors.email && <p className="errorText">{errors.email}</p>}

            
                <label>Password:</label>
                <input type="password" name="password" className="bg-white dark:bg-gray-700 dark:text-white pl-2 rounded" value={formData.password} onChange={handleChange} /><br />
                {errors.password && <p className="errorText">{errors.password}</p>}

                <label>Confirm Password:</label>
                <input type="password" name="passwordConfirm" className="bg-white dark:bg-gray-700 dark:text-white pl-2 rounded" value={formData.passwordConfirm} onChange={handleChange} /><br />
                {errors.passwordConfirm && <p className="errorText">{errors.passwordConfirm}</p>}


                <label>Profile Picture:</label>
                <input type="file" name="profilePic" className="dark:bg-gray-700 dark:text-white rounded bg-white block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded 
                   file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" onChange={selectFileHandler} />
                {errors.profilePic && <p className="errorText">{errors.profilePic}</p>}
            </div>
            

            {serverError && <p className="errorText">{serverError}</p>}
            {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}

            <button type="submit" disabled={Object.values(errors).some(Boolean)}>Create Account</button>
            </form>
        </div>
    )
}

export default Register