// PatientType.component.js
/* Component for selecting the patient type. 
It offers options to navigate to either the new patient registration or existing patient search page, 
facilitating easy routing based on user selection.*/

// Import React library and useNavigate hook from 'react-router-dom' for routing.
import React from 'react';
import { useNavigate } from 'react-router-dom';

// Define the PatientType functional component.
const PatientType = () => {
  // Initialize the navigation hook to enable programmatic navigation.
  const navigate = useNavigate();

  // Function to navigate to the New Patient registration page.
  const handleNewPatientClick = () => {
    navigate("/new-patient");
  };

  // Function to navigate to the Existing Patient search page.
  const handleExistingPatientClick = () => {
    navigate("/existing-patient");
  };

// Render buttons for selecting the patient type with event handlers for navigation.
  return (
    <div className="patient-type-container fade-in-effect">
      <button type="button" className="btn btn-primary btn-block" onClick={handleNewPatientClick}>
        New Patient
      </button>

      <button type="button" className="btn btn-primary btn-block" onClick={handleExistingPatientClick}>
        Existing Patient
      </button>
      
    </div>
  );
};

// Export the PatientType component for use in other parts of the application.
export default PatientType;