import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { userLoggedIn, mongoUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // The context will pick up the change and fetch mongoUser
      navigate("/home");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className='card bg-gray-800'>
      <h2 className="mb-5 text-[30px] font-bold">Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label><br />
          <input
            className="bg-white"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label><br />
          <input
            className="bg-white"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" style={{ marginTop: "1rem" }}>Login</button>
      </form>

      {userLoggedIn && mongoUser && (
        <div style={{ marginTop: "2rem", borderTop: "1px solid #ccc", paddingTop: "1rem" }}>
          <h3>Welcome, {mongoUser.name}</h3>
          <p>Username: {mongoUser.username}</p>
          <p>MongoDB ID: {mongoUser._id}</p>
        </div>
      )}
    </div>
  );
};

export default Login;