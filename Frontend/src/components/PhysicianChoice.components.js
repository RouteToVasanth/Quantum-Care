// PhysicianChoice.components.js
/* Component for presenting options to a logged-in physician. It offers buttons to upload radiology images or view patient details, 
navigating accordingly based on the physician's selection.*/

// Import React from 'react', useLocation for accessing route state, and useNavigate for programmatic navigation.
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Define the PatientType component, used here to offer navigational choices to physicians after login.
const PatientType = () => {

  // Setup navigation and location hooks, retrieve doctor's name from route state.
  const navigate = useNavigate();
  const location = useLocation();
  const doctor = location.state?.doctor;
  const handleUploadPatientClick = () => {
    navigate("/modality-patient-entry",{ state: { action: 'uploadImage' } });
  };

  // Define event handlers for buttons that navigate to different patient-related actions.
  const handleViewPatientClick = () => {
    navigate("/modality-patient-entry" ,{ state: { action: 'viewDetails' } });
  };

// Renders the UI for the component, providing buttons for uploading images and viewing patient details, personalized with the doctor's name.
  return (
    <div className="patient-type-container fade-in-effect">
      <h3>Welcome</h3>
      <button type="button" className="btn btn-primary btn-block" onClick={handleUploadPatientClick}>
        Upload Radiology Image
      </button>

      <button type="button" className="btn btn-primary btn-block" onClick={handleViewPatientClick}>
        View Patient
      </button>
      
    </div>
  );
};

// Export the PatientType (PhysicianChoice) component for use in other parts of the application.
export default PatientType;