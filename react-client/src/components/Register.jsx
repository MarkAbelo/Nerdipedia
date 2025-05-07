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
        <div>
            <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: 'auto' }}>
            <h2>Sign Up</h2>

            <input name="username" placeholder="Username" value={formData.username} onChange={handleChange} />
            {errors.username && <p style={{ color: 'red' }}>{errors.username}</p>}

            <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
            {errors.email && <p style={{ color: 'red' }}>{errors.email}</p>}

            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} />
            {errors.password && <p style={{ color: 'red' }}>{errors.password}</p>}

            <input name="profilePic" placeholder="Profile Picture URL (optional)" value={formData.profilePic} onChange={handleChange} />
            {errors.profilePic && <p style={{ color: 'red' }}>{errors.profilePic}</p>}

            {serverError && <p style={{ color: 'red' }}>{serverError}</p>}
            {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}

            <button type="submit" disabled={Object.values(errors).some(Boolean)}>Create Account</button>
            </form>
        </div>
    )
}

export default Register