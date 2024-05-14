// ModalityPatientEntry.component.js
/* Component for entering or retrieving patient details based on their ID, 
primarily used for managing patient entries in the Modality Worklist. 
It supports actions such as uploading DICOM images or viewing patient details, based on the context provided via route state.*/

// Import React library, useState for state management, and useLocation, useNavigate for routing.
import React, { useState } from 'react';
import { useLocation,useNavigate } from 'react-router-dom';
const ModalityPatientEntry=()=>{

    // Setup navigation and location hooks, initialize state variables for managing patient ID, error, and success messages.
    const navigate = useNavigate();
    const location = useLocation();
    const action = location.state?.action;
    const [existingpatientDetails, setPatientDetails] = useState({
        pid: ''
      });
    const [error,setError]=useState('');
    const [success, setSuccess] = useState('')

    // Function to handle changes to the patient ID input field, updating the state accordingly.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPatientDetails({
      ...existingpatientDetails,
      [name]: value,
    });
  };

  /* Handles the form submission to perform actions based on the 'action' state. 
  Submits patient ID to the backend and navigates based on the response.*/

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('')
    fetch("http://localhost:3000/modalitypatiententry", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
            pid: existingpatientDetails.pid,
        }),
    })
    .then(response => response.json())
    .then(data => { 
        if (data.patientDetails && data.patientDetails[0].department === "Radiology") {
            setSuccess("Patient Queried Successfully");
            if (action === 'uploadImage') {
                setTimeout(()=>{
                    navigate('/upload-dicom', { state: { data } });
                },1500)
            } else if (action === 'viewDetails') {
                setTimeout(()=>{
                    navigate('/physician-display', { state: { pid: existingpatientDetails.pid } });
                },1500)               
            }
        }
        else{
            setError("Patient do not exist in the Modality Worklist")
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
};

/* Renders a form UI allowing users to enter a patient ID and provides feedback based on the operation outcome.
 Includes buttons for specific actions based on the context provided.*/
    return(
        <form onSubmit={handleSubmit}>
        <div className="patient-type-container fade-in-effect">
                <h3>Enter Patient ID</h3>
                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                {success && <div className="alert alert-success" role="alert">{success}</div>}
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
            <div className="d-grid">
                <button type="submit" className="btn btn-primary">
                Search
                </button>
            </div>
        </div>
        </form>
    )
}

// Export the ModalityPatientEntry component for use in other parts of the application.
export default ModalityPatientEntry;