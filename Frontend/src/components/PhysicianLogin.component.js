//PhysicianLogin.component.js
/* This component handles the login functionality for staff members, allowing them to 
access the patient management system by verifying their credentials.*/

// Import React library and useState for managing state, useNavigate for programmatic navigation.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

  /* Defines the Login component with state management for email and password inputs, and 
  uses navigation for redirecting upon successful login.*/
  const PhysicianLogin = () => {

  // Initialize state variables for managing username, password inputs, and feedback messages (error and success).
  const [username, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error,setError]=useState('');
  const [success,setSuccess]=useState('')
  const navigate = useNavigate();

  // Function to handle the form submission, validate the login credentials, and navigate based on the result.
  const handleSubmit = (e) => {
    setError('')
    e.preventDefault();
    if(username === "Jennifer" && password === "quantumcare1"){
        setSuccess("Login Successful")
        setTimeout(()=>{
          navigate('/physician-choice',{ state: { doctor: 'Dr Jennifer' } })
        },2000)
    }else if(username === "Sneha" && password === "quantumcare2"){
        setSuccess("Login Successful")
        setTimeout(()=>{
          navigate('/physician-choice',{ state: { doctor: 'Dr Sneha' } })
        },2000)
    }else{
      setError("Enter Valid Details.")
    }
  };


  // Renders the login form UI, allowing staff to input their email and password for accessing the system.
  return (
    <div className="login-container fade-in-effect">
    <div className="login-card">
      <form onSubmit={handleSubmit} className="login-form">
      {/* Displays the main heading for the login form. */}
      <h2>Physician Login</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      {/* Input field for the staff's email address. */}
      <div className="mb-3">
        <label>UserName</label>
        <input
          type="text"
          className="form-control"
          placeholder="Enter your username"
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {/* Input field for the staff's password. */}
      <div className="mb-3">
        <label>Password</label>
        <input
          type="password"
          className="form-control"
          placeholder="Enter your password"
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {/* Button to submit the login form. */}
      <div className="d-grid">
        <button type="submit" className="btn btn-primary">
          Sign-in
        </button>
      </div>
    </form>
    </div>
    </div>
  );
};

// Export the PhysicianLogin component for use in other parts of the application.
export default PhysicianLogin;