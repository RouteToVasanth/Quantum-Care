// signup.component.js
/* Component for user registration, enabling new users to sign up by providing email and password. 
It performs client-side validation to ensure passwords match before submitting the registration request to the server and 
navigating to the sign-in page upon successful registration.*/

// Import React library and useState hook for managing state, useNavigate for routing.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Define the Signup functional component with local state for handling user inputs and error messages.
const Signup = () => {
  const navigate = useNavigate();
  // Initialize state variables for email, password, confirmPassword, and error handling.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

// Handles form submission including validation and fetch request to the signup API endpoint.
  const handleSubmit = (e) => {
    setError('')
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords did not match.'); 
      return;
    }

    const signupDetails={
      email:email,
      password:password,
      confirmPassword:confirmPassword
    }
    fetch("http://localhost:3000/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(signupDetails),
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    })
    .then(data => {
      if (data.status === "error") {
        setError(data.message);
      } else {
        setSuccess("Sign up Successfull")
        setTimeout(()=>{
          navigate('/sign-in')
        },2000)
      }
    })
    .catch(error => {
      console.error('Error:', error);
      if (error.message.includes('<!DOCTYPE')) {
        setError('Enter the valid details.'); 
      } else {
        setError(error.message || 'Failed to connect to the server.');
      } 
    });
  };

// Render the signup form UI allowing users to input their email, password, and confirm password.
  return (
    <div className="signup-container fade-in-effect">
      <div className="signup-card">
        <form onSubmit={handleSubmit} className="signup-form">
          <h2>Sign Up</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <div className="mb-3">
            <label>Email address</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label>Confirm Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">Sign Up</button>
        </form>
      </div>
    </div>
  );
};
// Export the Signup component for use in other parts of the application.
export default Signup;