import React, { useState } from "react";
import { useAuth } from "../contexts/authContext";
import validationFunctions from "../../../data-server/validation/validation";

function Register() {

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
        e.preventdefault();

        //validate before submitting
        try {
            await validationFunctions.validString(formData.username, 'Username');
            await validationFunctions.validEmail(formData.email);
            await validationFunctions.validPassword(formData.password);
            if (formData.profilePic.trim()) await validationFunctions.validURL(formData.profilePic, 'Profile picture URL'); 
        } catch (err) {
            setServerError(err.toString());
            return;
        }

        //TODO: the actual submission using the service
    }
        
     
    

    return(
        <div className="card">
            <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: 'auto' }}>
            <h2>Sign Up</h2>

            <div className="m-4">
                <label>Username:</label><br />
                <input name="username" className="bg-white" value={formData.username} onChange={handleChange} />
                {errors.username && <p className="errorText">{errors.username}</p>}
            
                <label>Email:</label><br />
                <input name="email" className="bg-white" value={formData.email} onChange={handleChange} />
                {errors.email && <p className="errorText">{errors.email}</p>}

            
                <label>Password:</label><br />
                <input type="password" name="password" className="bg-white" value={formData.password} onChange={handleChange} />
                {errors.password && <p className="errorText">{errors.password}</p>}


                <label>Profile Picture URL:</label><br />
                <input name="profilePic" className="bg-white" value={formData.profilePic} onChange={handleChange} />
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