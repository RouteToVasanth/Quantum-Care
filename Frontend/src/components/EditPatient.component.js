//EditPatient.component.js
/* This component is used for editing the details of an existing patient. 
It fetches the patient's current information, allows editing, and updates the patient record.*/

// Import React library, hooks for state and effects, navigation, and icons for user interactions.
import React, { useState, useEffect } from 'react';
import { useLocation,useNavigate} from 'react-router-dom';

const EditPatient = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);

// State hooks for managing the form data of the patient to be edited and the patient ID.
const [patientDetails, setPatientDetails] = useState({
    fname: '',
    lname: '',
    bdate: '',
    gender: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phoneNumber: '',
    email: '',
  });

const [pid, setPid] = useState("");

// useEffect hook to fetch the patient's current details based on the patient ID from the route's state and populate the form fields.
  useEffect(() => {
    const { pid } = location.state || {};

    // Fetch the current details of the patient from the backend using the patient ID and update the form state.
    if (pid) {
      fetch(`http://localhost:3000/get-patient/${pid}`, {
        method: 'GET'
      })
      .then(response => response.json())
      .then(data => {
        setPatientDetails(data); // Populate the state with the fetched data
        setPid(pid);
      })
      .catch(error => console.error('Error:', error));
    }
  }, [location.state]);

  // Handles form field changes and updates the corresponding state.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPatientDetails({
      ...patientDetails,
      [name]: value,
    });
  };
  
  // Submits the updated patient details to the backend and navigates back to the existing patient page.
  const handleSubmit = (e) => {
    e.preventDefault();

    // Constructs the patient details from state and sends an update request to the server.
    fetch("http://localhost:3000/editpatient", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...patientDetails, pid }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
        handleEditPatientSuccess();
        
    })
    .catch(error => {
        console.error('Error:', error);
        setError("Error in updating patient details.")
    });
  };

  // Handles successful patient edit operation by displaying a success message and navigating to a specific page.
  const handleEditPatientSuccess = () => {
    setSuccess("Patient Details Updated Successfully.");
    setShowSuccessModal(true); // Show the success modal
  };

  // Renders the patient edit form populated with the current details fetched from the backend.
return (
    // Form for editing patient details. Fields are pre-populated with current patient data fetched on component load.
    <div className="edit-patient-wrapper fade-in-effect">
    <div className="edit-patient-container">
    <div className="edit-patient-card">
      <form className="edit-patient-form" onSubmit={handleSubmit}>
        <h1><center>Patient Edit  Form</center></h1>
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <h4><center>Enter the Patient details</center></h4>
      <div className="row">
        {/* First Name */}
        <div className="col-md-6 mb-3">
          <label htmlFor="fname">First name:</label>
          <input
            type="text"
            className="form-control"
            name="fname"
            id="fname"
            placeholder="Enter the first name"
            value={patientDetails.fname}
            onChange={handleChange}
            required
          />
        </div>

        {/* Last Name */}
        <div className="col-md-6 mb-3">
          <label htmlFor="lname">Last name:</label>
          <input
            type="text"
            className="form-control"
            name="lname"
            id="lname"
            placeholder="Enter the last name"
            value={patientDetails.lname}
            onChange={handleChange}
          />
        </div>

        {/* Date of Birth */}
        <div className="col-md-6 mb-3">
          <label htmlFor="bdate">Date of Birth:</label>
          <input
            type="date"
            className="form-control"
            name="bdate"
            id="bdate"
            value={patientDetails.bdate}
            onChange={handleChange}
            required
          />
        </div>

        {/* Gender */}
        <div className="col-md-6 mb-3">
          <label htmlFor="gender">Gender:</label>
          <select
            className="form-control"
            name="gender"
            id="gender"
            value={patientDetails.gender}
            onChange={handleChange}
            required
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Address Line 1 */}
        <div className="col-md-6 mb-3">
          <label htmlFor="addressLine1">Address Line 1:</label>
          <input
            type="text"
            className="form-control"
            name="addressLine1"
            id="addressLine1"
            placeholder="Enter address line 1"
            value={patientDetails.addressLine1}
            onChange={handleChange}
          />
        </div>

        {/* Address Line 2 */}
        <div className="col-md-6 mb-3">
          <label htmlFor="addressLine2">Address Line 2:</label>
          <input
            type="text"
            className="form-control"
            name="addressLine2"
            id="addressLine2"
            placeholder="Enter address line 2"
            value={patientDetails.addressLine2}
            onChange={handleChange}
          />
        </div>

        {/* City, State, and Zip Code */}
        <div className="col-md-4 mb-3">
          <label htmlFor="city">City:</label>
          <input
            type="text"
            className="form-control"
            name="city"
            id="city"
            placeholder="Enter city"
            value={patientDetails.city}
            onChange={handleChange}
          />
        </div>

        {/* State*/}
        <div className="col-md-4 mb-3">
          <label htmlFor="state">State:</label>
          <input
            type="text"
            className="form-control"
            name="state"
            id="state"
            placeholder="Enter state"
            value={patientDetails.state}
            onChange={handleChange}
          />
        </div>

        {/* Zip Code */}
        <div className="col-md-4 mb-3">
          <label htmlFor="zipCode">Zip Code:</label>
          <input
            type="text"
            className="form-control"
            name="zipCode"
            id="zipCode"
            placeholder="Enter zip code"
            value={patientDetails.zipCode}
            onChange={handleChange}
          />
        </div>

        {/* Country */}
        <div className="col-md-6 mb-3">
          <label htmlFor="country">Country:</label>
          <input
            type="text"
            className="form-control"
            name="country"
            id="country"
            placeholder="Enter country"
            value={patientDetails.country}
            onChange={handleChange}
          />
        </div>

        {/* Phone Number */}
        <div className="col-md-6 mb-3">
          <label htmlFor="phoneNumber">Phone Number:</label>
          <input
            type="tel"
            className="form-control"
            name="phoneNumber"
            id="phoneNumber"
            placeholder="Enter phone number"
            value={patientDetails.phoneNumber}
            onChange={handleChange}
          />
        </div>

        {/* Email */}
        <div className="col-12 mb-3">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            className="form-control"
            name="email"
            id="email"
            placeholder="Enter email"
            value={patientDetails.email}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div className="d-grid">
        {/* Submission button for the form. Saves changes made to the patient's details. */}
        <button type="submit" className="btn btn-primary" >Submit</button>
      </div>
      {showSuccessModal && (
            <div className="modal-overlay fade-in-effect">
                <div className="modal-content">
                    <h3>Patient Details Updated Successfully</h3>
                    <button className="confirm-button" onClick={() => {
                        setShowSuccessModal(false); // Close the modal
                        navigate('/existing-patient'); // Navigate
                    }}>OK</button>
                </div>
            </div>
        )}
    </form>
    </div>
    </div>
    </div>
  );
};

// Export the EditPatient component for use in other parts of the application.
export default EditPatient;