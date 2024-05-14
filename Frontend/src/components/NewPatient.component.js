// NewPatient.component.js
/* Component for registering a new patient. It allows input of patient details and supports uploading a PDF to auto-fill the form. 
The component provides dynamic field updates based on department selection and manages the submission of patient data to the backend.*/

// Import React and useState hook from 'react', and useNavigate for routing.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Define the NewPatient functional component with state management for all patient detail inputs, including support for PDF upload and parsing.
const NewPatient = () => {
  const navigate = useNavigate();
  // Initialize state variables for patient details, doctors list, PDF file, error message, success message, success modal display, and patient ID.
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
    patientType:'',
    admitreason:'',
    email: '',
    department: '',
    doctor: '',
    examType: '',
    preferredDate: '',
    preferredTime:''
  });
  const [showDoctorsDropdown, setShowDoctorsDropdown] = useState(false);
  const [doctorsList, setDoctorsList] = useState([]);
  const [pdfFile, setPdfFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [patientId, setPatientId] = useState(null);


  // Updates the state with input values from the form fields.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPatientDetails(prevDetails => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  // Sets the selected PDF file in state when a file is chosen for upload.
  const handlePdfFileChange = (e) => {
    setPdfFile(e.target.files[0]);
  };

  // Handles the uploading and parsing of the selected PDF file to auto-fill the form fields with extracted patient details.
  const handlePdfUpload = async () => {
    if (!pdfFile) {
      setError('No PDF file selected.');
      return;
    }

    // Prepares the PDF file for parsing by creating a FormData object and appending the file to it.
    const formData = new FormData();
    formData.append('patientPdf', pdfFile);

    // Sends the PDF file to the backend for parsing, expecting the extracted details to auto-fill the form.
    try {
      const response = await fetch('http://localhost:3000/parse-patient-pdf', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      const data = result.data;
      if (!response.ok) {
        throw new Error(data.error || 'File Type Mismatch. Kindly ensure to upload a PDF file.');
      }

      if (data.status === "error") {
        throw new Error(data.error);
      }
      setPatientDetails(prevDetails => ({
        ...prevDetails,
        fname: data.firstName || prevDetails.fname,
        lname: data.lastName || prevDetails.lname,
        bdate: data.bdate || prevDetails.bdate,
        gender: data.gender || prevDetails.gender,
        addressLine1: data.addressLine1 || prevDetails.addressLine1,
        addressLine2: data.addressLine2 || prevDetails.addressLine2,
        city: data.city || prevDetails.city,
        state: data.state || prevDetails.state,
        zipCode: data.zipCode || prevDetails.zipCode,
        country: data.country || prevDetails.country,
        phoneNumber: data.phoneNumber || prevDetails.phoneNumber,
        email: data.email || prevDetails.email,
      }));
      setSuccess('PDF uploaded successfully.');
      setError(''); // Clear any previous error
    } catch (error) {
      setError(error.toString());
      setSuccess('');
    }
  };
  
  
  // Manages department selection and dynamically loads the corresponding list of doctors based on the selected department.
  function setDepartment(departmentName) {
    setPatientDetails({
      ...patientDetails,
      department: departmentName,
    });

  if (departmentName === 'General') {
    setDoctorsList(['Dr. Purushothaman', 'Dr. Vasanth', 'Dr. Ashu Sharma']);
    setShowDoctorsDropdown(true);
  } 
  else if(departmentName === 'ICU'){
    setDoctorsList(['Dr. Saurabh Kumar', 'Dr. Mohammed Danish', 'Dr. Nikhil Sen']);
    setShowDoctorsDropdown(true);
  }
  else if(departmentName === 'Radiology'){
    setDoctorsList(['Dr. Jennifer', 'Dr. Sneha']);
    setShowDoctorsDropdown(true);
  }
  else {
    setShowDoctorsDropdown(false);
  }
  }

  // Submits the new patient form, including all entered details and the selected doctor, to the backend for registration.
  const handleSubmit = (e) => {
    e.preventDefault(); 

  
  // Start with the basic patient details
  const patientJsonData = {
    ...patientDetails,
  };
  
  // Conditionally add Radiology-specific fields
  if (patientDetails.department === "Radiology") {
    patientJsonData.examType = patientDetails.examType;
    patientJsonData.preferredDate = patientDetails.preferredDate;
    patientJsonData.preferredTime = patientDetails.preferredTime;
  } 

  fetch("http://localhost:3000/newpatient", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(patientJsonData),
  })
  .then(response => {
    // Check if the response was successful
    if (!response.ok) {
      // If the response status is not OK, handle it as an error and throw an error
      return response.json().then(err => Promise.reject(err));
    }
    // If the response status is OK, parse it as JSON
    return response.json();
  })
  .then(data => {
    // Only show the success message and navigate if the registration was actually successful
    setShowSuccessModal(true); // Show the success modal
    setPatientId(data.newPatient.pid); // Save the patient ID from the response
  })
  .catch(error => {
    // Since we're now properly handling non-OK responses, we can assume any errors here are unexpected
    if (error.status === "error") {
      if (error.error === "Email already exists") {
        setError('Please ensure you enter valid details, as our records indicate that a patient with this information already exists.');
      }
    } else {
      // If the error object does not have a status property, it's a network or parsing error
      setError('An unexpected error occurred. Please try again.');
    }
  });
  
};

  // Renders the new patient registration form with inputs for all patient details and an option to upload a PDF file for auto-fill functionality.
  return (
    <div className="new-patient-wrapper fade-in-effect">

    <form onSubmit={handleSubmit} className="form-container">
      {/* Displays the heading. */}
      <h1 style={{ textAlign: 'center' }}>New Patient Registration</h1>
      <h4 style={{ textAlign: 'center' }}>Enter the Patient details manually or upload a PDF report to auto-fill</h4>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
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
  
        {/* City */}
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
  
        {/* State */}
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

        {/* Patient Type */}
        <div className="col-md-6 mb-3">
          <label htmlFor="patientType">Patient Type:</label>
          <select
          className="form-control"
          name="patientType"
          id="patientType"
          value={patientDetails.patientType}
          onChange={handleChange}
          required
        >
      <option value="">Select Type</option>
      <option value="Emergency">Emergency</option>
      <option value="Inpatient">Inpatient</option>
      <option value="Outpatient">Outpatient</option>
      <option value="Obstetrics">Obstetrics</option>
      </select>
        </div>

        {/* Admit Reason */}
        <div className="col-md-6 mb-3">
          <label htmlFor="admitreason">Admit Reason:</label>
          <input
            type="text"
            className="form-control"
            name="admitreason"
            id="admitreason"
            placeholder="Enter Admit Reason"
            value={patientDetails.admitreason}
            onChange={handleChange}
          />
        </div>

        {/* Department */}
        <div className="row mb-3">
        <label htmlFor="admitreason">Select Department:</label>
          <div className="col text-center department-button">
            <div className="department-button">
              <button type="button" id="general" className="btn" onClick={() => setDepartment('General')}>
                <img src="http://localhost:3000/department-images/General.png" alt="General" />
                General
              </button>
            </div>
            <div className="department-button">
              <button type="button" id="general" className="btn" onClick={() => setDepartment('ICU')}>
              <img src="http://localhost:3000/department-images/ICU.png" alt="ICU"  />
              ICU
              </button>
            </div>
            <div className="department-button">
              <button type="button" id="general" className="btn" onClick={() => setDepartment('Radiology')}>
              <img src="http://localhost:3000/department-images/Radiology.png" alt="Radiology"  />
              Radiology
              </button>
            </div>
          </div>
      </div>
{/*And if the department is Radiology, we need to input Exam Type(MRI,CT,XRay,Ultrasound), Appointment Date, Appointment Time and the Doctor*/}
  {
  patientDetails.department === "Radiology" && (
    <>
      <div className="col-md-6 mb-3">
        <label htmlFor="examType">Exam Type:</label>
        <select className="form-control" name="examType" id="examType" value={patientDetails.examType} onChange={handleChange} required>
          <option value="">Select Exam Type</option>
          <option value="MRI">MRI</option>
          <option value="CT">CT</option>
          <option value="XRay">XRay</option>
          <option value="Ultrasound">Ultrasound</option>
        </select>
      </div>
      <div className="col-md-6 mb-3">
        <label htmlFor="preferredDate">Appointment Date:</label>
        <input type="date" className="form-control" name="preferredDate" id="preferredDate" value={patientDetails.preferredDate} onChange={handleChange} />
      </div>
      <div className="col-md-6 mb-3">
      <label htmlFor="preferredTime">Preferred Time:</label>
      <input type="time" className="form-control" name="preferredTime" id="preferredTime" value={patientDetails.preferredTime} onChange={handleChange} />
    </div>
    </>
  )
}

          {/* Dropdown for selecting the doctor based on the selected department, displayed conditionally. */}
       {showDoctorsDropdown && (
          <div className="col-md-6">
            <label htmlFor="doctor">Doctor:</label>
            <select
              className="form-control"
              name="doctor"
              id="doctor"
              value={patientDetails.doctor}
              onChange={handleChange}
              required
            >
              <option value="">Select a Doctor</option>
              {doctorsList.map((doctor, index) => (
                <option key={index} value={doctor}>{doctor}</option>
              ))}
            </select>
          </div>
      )}

        {/* Allows uploading a patient report in PDF format for auto-filling the form fields. */}
        <div className="col-12 mb-3">
        <label htmlFor="patientPdf" className="form-label">Upload Patient Report PDF</label>
        <input
          className="form-control"
          type="file"
          id="patientPdf"
          onChange={handlePdfFileChange}
          accept="application/pdf"
        />
        <small className="form-text text-muted">Uploading a PDF will auto-fill the form fields above.</small>
        </div>

        <div className="col-12 mb-3">
        <button type="button" onClick={handlePdfUpload} className="btn btn-info">Upload PDF and Auto-Fill</button>
      </div>

  {/* Button to submit the completed form for new patient registration. */}
  <div className="col-12">
    <div className="d-grid">
      <button type="submit" className="btn btn-primary">Submit</button>
    </div>
  </div>
</div>
{showSuccessModal && (
            <div className="modal-overlay fade-in-effect">
                <div className="modal-content">
                    <h3>Registration Successful</h3>
                    <button className="confirm-button" onClick={() => {
                        setShowSuccessModal(false); // Close the modal
                        navigate('/display-details', { state: { pid: patientId } }); // Navigate to display details
                    }}>OK</button>
                </div>
            </div>
        )}
</form>
</div>
);
};
// Export the NewPatient component for use in other parts of the application.
export default NewPatient;