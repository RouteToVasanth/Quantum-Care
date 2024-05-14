// This component handles the login functionality for staff members, allowing them to access the patient management system by verifying their credentials.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';


  // Defines the Login component with state management for email and password inputs, and uses navigation for redirecting upon successful login.
  const Login = () => {

  // State hooks for managing user input for email and password fields.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess]=useState('');
  // Hook to enable programmatic navigation post-login success.
  const navigate = useNavigate();

  // Handles the submission of the login form, including validation and sending credentials to the backend for verification.
  const handleSubmit = (e) => {
    setError('')
    // Prevents the default form submission behavior to handle the login process manually.
    e.preventDefault();
    // Posts the email and password to the backend for authentication, expecting a token or an error message in response.
    fetch("http://localhost:3000/signin", {
      method: "POST",
      crossDomain: true,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })

      // Parses the JSON response from the server.    
      .then((res) => res.json())
      // Conditional check on the response status to either proceed with navigation on success or alert the user on failure.
      .then(data => {
        if (data.status === "ok") {
          setSuccess("Login Successful")
          setTimeout(()=>{
            navigate('/patient-type',{ state: { doctor: 'Dr Sneha' } })
          },2000)
        } else {
          setError(data.error); // Set error message from server
        }
      })
      .catch(err => {
        setError(err.message || "Failed to connect to the server.");
      });
  };


  // Renders the login form UI, allowing staff to input their email and password for accessing the system.
  return (
    <div className="login-container fade-in-effect">
    <div className="login-card">
      <form onSubmit={handleSubmit} className="login-form">
      {/* Displays the main heading for the login form. */}
      <h2>Staff Login</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      {/* Input field for the staff's email address. */}
      <div className="mb-3">
        <label>Email address</label>
        <input
          type="email"
          className="form-control"
          placeholder="Enter your email"
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

        {/* Provides a link for users who have forgotten their password, leading to a password recovery process. */}  
      </div>
      <p className="forgot-password text-right">
        <Link to="/sign-up" style={{ fontSize: '1rem' }}>Don't have an account? Sign up</Link>
      </p>
    </form>
    </div>
    </div>
  );
};

export default Login;
