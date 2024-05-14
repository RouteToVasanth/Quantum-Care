// uploadDicom.component.js
/* Component for uploading DICOM files associated with a specific patient. It allows users to select and upload DICOM images to the server, 
handling file validation, server communication, and navigation based on the outcome of the upload process.*/

// Import React library, useState for managing state, and routing hooks from 'react-router-dom'.
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Define the UploadDicom functional component.
const UploadDicom = () => {

  // Initialize state variables for DICOM file management, loading status, and feedback messages.
  const navigate = useNavigate();
  const location = useLocation();
  const [dicomFile, setDicomFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success,setSuccess]=useState('');

  // Retrieve patient data passed via route state to link the uploaded DICOM with the correct patient record.
  const patientData = location.state ? location.state.data : null;

  // Function to handle file selection, setting the chosen DICOM file into state.
  const handleFileChange = (e) => {
    setDicomFile(e.target.files[0]);
  };

  // Handles the submission of the DICOM file upload form, performs validation, constructs FormData, and sends it to the backend API.
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!dicomFile) {
      setError("Please select a DICOM file before submitting.");
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('')
    let formData = new FormData();
    formData.append('dicomFile', dicomFile);
    formData.append('patientDetails',JSON.stringify(patientData.patientDetails[0]))
    if (patientData && patientData.patientDetails[0].patientid) {
      formData.append('pid', patientData.patientDetails[0].patientid);
    } else {
      setError('Patient ID is missing. Please go back and try again.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/uploadDicom', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload DICOM file. Please try again.');
      }
      setSuccess("Radiology Image Uploaded Successfully.")
      setTimeout(()=>{
        navigate('/physician-display',{ state: { pid: patientData.patientDetails[0].patientid } });
      },1500)
      
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Returns a placeholder message if no patient data is provided, indicating the component was accessed incorrectly.
  if (!patientData) {
    return <p>No patient details provided. Please navigate to this page with the required patient details.</p>;
  }

  // Renders the upload form UI, allowing users to select a DICOM file and submit it. Provides feedback on the operation's status.
  return (
    <div className="container fade-in-effect">
      <h2>Upload Radiology File {patientData.pid}</h2>
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input 
            type="file" 
            className="form-control" 
            id="dicomFile" 
            onChange={handleFileChange} 
            accept=".dcm" 
            required 
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
    </div>
  );
};

// Export the UploadDicom component for use in other parts of the application.
export default UploadDicom;