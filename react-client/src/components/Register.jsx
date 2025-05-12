import React, { useState } from "react";
import validationFunctions from "../../../data-server/validation/validation";
import { NavLink, useNavigate } from "react-router-dom";
import accountService from "../services/accountService";


function Register() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        profilePic: ''
    });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

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
    };

    const handleSubmit = async(e) => {
        e.preventDefault();

        //validate before submitting
        let username;
        let email;
        let password;
        let profilePic = null
        try {
            username = await validationFunctions.validString(formData.username, 'Username');
            email = await validationFunctions.validEmail(formData.email);
            password = await validationFunctions.validPassword(formData.password);
            if (formData.profilePic.trim()) profilePic = await validationFunctions.validURL(formData.profilePic, 'Profile picture URL'); 
        } catch (err) {
            setServerError(err.toString());
            return;
        }

        //TODO: the actual submission using the service
        try {
            accountService.createAccount(username, password, email, profilePic)
            setSuccessMessage("Account created successfully!");
            setFormData({ username: '', email: '', password: '', profilePic: '' });
            setTimeout(() => navigate("/login"), 1500); 
        } catch(e) {
            console.log(e.response.data)
            throw "Error: account could not be created"
        }

    }
        
     
    

    return(
        <div className="card bg-gray-800">
            <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: 'auto' }}>
            <h2 className="mb-5 text-[30px] font-bold">Sign Up</h2>

            <div className="m-4 grid">
                <label>Username:</label>
                <input name="username" className="bg-white" value={formData.username} onChange={handleChange} /><br />
                {errors.username && <p className="errorText">{errors.username}</p>}
            
                <label>Email:</label>
                <input name="email" className="bg-white" value={formData.email} onChange={handleChange} /><br />
                {errors.email && <p className="errorText">{errors.email}</p>}

            
                <label>Password:</label>
                <input type="password" name="password" className="bg-white" value={formData.password} onChange={handleChange} /><br />
                {errors.password && <p className="errorText">{errors.password}</p>}


                <label>Profile Picture URL:</label>
                <input name="profilePic" className="bg-white" value={formData.profilePic} onChange={handleChange} /><br />
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