// DischargePatient.components.js
/* Component for discharging a patient from the hospital. It handles the submission of discharge details to the backend, 
manages confirmation modals for user interactions, and navigates to the patient type selection upon successful discharge.*/

// Import React library and useState for managing state, useNavigate for routing.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Define the DischargePatient functional component with props for managing patient details, success, and error handling.
function DischargePatient({ patientDetails, onSuccess, onError, showDischargeConfirmation, setShowDischargeConfirmation }) {

    // Initialize state variables for managing error and success messages during the discharge process.
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    /* Function to handle the discharge of a patient by sending a POST request to the backend with discharge details 
    and handling the response to update UI or navigate upon success.*/
    const handleDischarge = () => {
        const dischargeData = {
            ...patientDetails,
            type: 'discharge',
        };
        fetch('http://localhost:3000/submit-transfer-discharge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dischargeData),
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => Promise.reject(err));
            }
            return response.json();
        })
        .then(data => {
            if (data.status === "ok") {
                setSuccess(data.message);
                onSuccess(data.message);
                setTimeout(() => {
                    navigate('/patient-type');
                }, 2000);
            } else {
                throw new Error(data.message || "An error occurred while discharging.");
            }
        })
        .catch(error => {
            console.error("Error during discharge: " + error);
            setError("Error during discharge: " + error.message);
            onError(error.message);
        });

        setShowDischargeConfirmation(false); // Hide modal after action
    };

    /* Renders a modal for discharge confirmation with buttons to confirm or cancel the discharge. 
    Displays error or success messages based on the outcome.*/
    return (
        <div>
            {showDischargeConfirmation && (
                <div className="modal-overlay fade-in-effect">
                    <div className="modal-content">
                        <h3>Confirm Discharge</h3>   
                        {error && <div className="alert alert-danger">{error}</div>}
                        {success && <div className="alert alert-success">{success}</div>}
                        <button className="confirm-button" onClick={handleDischarge}>Confirm</button>
                        <button className="cancel-button" onClick={() => setShowDischargeConfirmation(false)}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
}

// Export the DischargePatient component for use in other parts of the application.
export default DischargePatient;