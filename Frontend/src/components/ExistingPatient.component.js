// ExistingPatient.component.js
/* Component for searching and retrieving the details of an existing patient by their Patient ID. 
It allows users to input a Patient ID, performs a fetch request to retrieve patient details, 
and navigates to the display details page upon successful retrieval.*/

// Import React library and useState for state management, useNavigate for routing.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Define the ExistingPatient functional component for searching existing patients.
const ExistingPatient = () => {
    const navigate = useNavigate();

    // Initialize state variables for managing existing patient details and error messages.
    const [existingpatientDetails, setPatientDetails] = useState({
        pid: ''
    });
    const [error, setError] = useState('');

    // Handle changes in the input field, updating the state with the new Patient ID.
    const handleChange = (e) => {
        const { name, value } = e.target;
        setPatientDetails({
            ...existingpatientDetails,
            [name]: value,
        });
    };

    // Handle the form submission to search for an existing patient using their Patient ID.
    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        fetch("http://localhost:3000/existingpatient", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                pid: existingpatientDetails.pid,
            }),
        })
        .then(response => {
            // Parse the JSON body of the response
            return response.json().then(data => {
                if (!response.ok) {
                    // Throw an error with the message returned from the server
                    throw new Error(data.error);
                }
                return data; // Continue with the resolved data if response is ok
            });
        })
        .then(data => {
            navigate('/display-details',{ state: { pid: existingpatientDetails.pid } });
        })
        .catch(error => {
            console.error('Error:', error);
            if (error.message.includes('<!DOCTYPE')) {
              setError('Enter the valid Patient ID'); 
            } else {
              setError(error.message || 'Failed to connect to the server.');
            } 
        });
    };

    // Render the form UI allowing users to input a Patient ID and submit it to retrieve patient details.
    return (
        <div className="existing-patient-container fade-in-effect">
            <div className="existing-patient-card">
                <form onSubmit={handleSubmit} className="existing-patient-form">
                    <h2>Enter Patient ID</h2>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <div className="col-md-4 mb-3">
                        <input
                            type="text"
                            className="form-control"
                            name="pid"
                            id="pid"
                            placeholder="Patient ID"
                            value={existingpatientDetails.pid}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="d-grid">
                        <button type="submit" className="btn btn-primary">
                            Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Export the ExistingPatient component for use in other parts of the application.
export default ExistingPatient;