// SubmitPatientDetails.components.js
/* Component for submitting or updating patient visit details. It allows staff to enter or modify the department, doctor, patient type, admit reason, and schedule examinations if applicable. 
It supports dynamic field updates based on department selection and manages the submission of updated details to the backend.*/

// Import React library, useState for state management, and useNavigate for routing.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Define the SubmitPatientDetails functional component with props for handling success and error responses.
function SubmitPatientDetails({ patientDetails, onSuccess, onError}) {
    // Initialize state variables for patient details, doctor selection, examination details, and success/error messages.
    const [patientType, setPatientType] = useState(patientDetails.patientType);
    const [admitReason, setAdmitReason] = useState(patientDetails.admitreason);
    const [newDepartment, setNewDepartment] = useState(patientDetails.department);
    const [doctor, setDoctor] = useState(patientDetails.doctor);
    const [examType, setExamType] = useState('');
    const [appointmentDate, setAppointmentDate] = useState('');
    const [preferredTime, setPreferredTime] = useState('');
    const [doctorsList, setDoctorsList] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    // Handles changes to the department selection, updates the doctor list based on department, and resets examination fields if not Radiology.
    const handleDepartmentChange = (e) => {
        const departmentName = e.target.value;
        setNewDepartment(departmentName);
        if (departmentName === 'General') {
            setDoctorsList(['Dr. Purushothaman', 'Dr. Vasanth', 'Dr. Ashu Sharma']);
        } else if (departmentName === 'ICU') {
            setDoctorsList(['Dr. Saurabh Kumar', 'Dr. Mohammed Danish', 'Dr. Nikhil Sen']);
        } else if (departmentName === 'Radiology') {
            setDoctorsList(['Dr. Jennifer', 'Dr. Sneha']);
        } else {
            setDoctorsList([]);
        }
        if (departmentName !== 'Radiology') {
            setExamType('');
            setAppointmentDate('');
            setPreferredTime('');
        }
    };
    const handleDoctorSelection = e => setDoctor(e.target.value);
    const handlePatientTypeChange = e => setPatientType(e.target.value);
    const handleAdmitReasonChange = e => setAdmitReason(e.target.value);

    // Submits updated patient details to the backend and handles the response to update the UI or navigate on success.
    const handleSubmitDetails = () => {
        if (!patientType || !admitReason || !newDepartment || !doctor) {
            setError("Please fill in all the fields.");
            return;
        }

        const submitData = {
            ...patientDetails,
            patientType,
            admitReason,
            department: newDepartment,
            doctor,
            type: 'submit',
            examType: newDepartment === 'Radiology' ? examType : undefined,
            appointmentDate: newDepartment === 'Radiology' ? appointmentDate : undefined,
            preferredTime: newDepartment === 'Radiology' ? preferredTime : undefined,
        };
        fetch('http://localhost:3000/submit-transfer-discharge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(submitData),
        })
        .then(response => {
            if (!response.ok) {
              return response.json().then(err => Promise.reject(err));
            }
            return response.json();
          })
        .then(data => {
            if (data.status === "ok") { // Ensure this check is aligned with server responses
                setSuccess(data.message);
                onSuccess(data.message);
                setTimeout(() => {
                    navigate('/patient-type');
                }, 2000);
            } else {
                throw new Error(data.message || "An error occurred while submitting details.");
            }
        })
        .catch(error => {
            console.error("Error during submission: " + error);
            setError("Error during Submission: " + error.message);
            onError(error.message);
        });
    };

// Renders the form UI with dropdowns for department, doctor, patient type, input for admit reason, and buttons for Radiology specific fields if applicable.
    return (
        <div className="submit-options-container fade-in-effect">
            <h4>Enter Patient Visit Details</h4>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            
            {/* Department Dropdown */}
            <div className="input-group mb-3">
                <label className="input-group-text" htmlFor="newDepartment">New Department:</label>
                <select className="form-select" id="newDepartment" value={newDepartment} onChange={handleDepartmentChange}>
                    <option value="">Select Department</option>
                    <option value="General">General</option>
                    <option value="ICU">ICU</option>
                    <option value="Radiology">Radiology</option>
                </select>
            </div>

            {newDepartment === 'Radiology' && (
                <>
                    <div className="input-group mb-3">
                        <label className="input-group-text">Exam Type:</label>
                        <select className="form-select" value={examType} onChange={e => setExamType(e.target.value)}>
                            <option value="">Select Exam Type</option>
                            <option value="MRI">MRI</option>
                            <option value="CT">CT Scan</option>
                            <option value="XRay">X-ray</option>
                            <option value="Ultrasound">Ultrasound</option>
                        </select>
                    </div>
                    <div className="input-group mb-3">
                        <label className="input-group-text">Appointment Date:</label>
                        <input
                            type="date"
                            className="form-control"
                            value={appointmentDate}
                            onChange={e => setAppointmentDate(e.target.value)}
                        />
                    </div>
                    <div className="input-group mb-3">
                        <label className="input-group-text">Preferred Time:</label>
                        <input
                            type="time"
                            className="form-control"
                            value={preferredTime}
                            onChange={e => setPreferredTime(e.target.value)}
                        />
                    </div>
                </>
            )}

            {/* Doctor Dropdown */}
            {doctorsList && doctorsList.length > 0 && (
                <div className="input-group mb-3">
                    <label className="input-group-text" htmlFor="doctor">New Doctor:</label>
                    <select
                        className="form-select"
                        id="doctor"
                        value={doctor}
                        onChange={handleDoctorSelection}
                    >
                        <option value="">Select Doctor</option>
                        {doctorsList.map((doc, index) => (
                            <option key={index} value={doc}>{doc}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Patient Type Dropdown */}
            <div className="input-group mb-3">
                <label className="input-group-text" htmlFor="patientType">Patient Type:</label>
                <select className="form-select" id="patientType" value={patientType} onChange={handlePatientTypeChange}>
                    <option value="">Select Type</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Inpatient">Inpatient</option>
                    <option value="Outpatient">Outpatient</option>
                    <option value="Obstetrics">Obstetrics</option>
                </select>
            </div>

            {/* Admit Reason Input */}
            <div className="input-group mb-3">
                <label className="input-group-text" htmlFor="admitReason">Admit Reason:</label>
                <input
                    type="text"
                    className="form-control"
                    id="admitReason"
                    value={admitReason}
                    onChange={handleAdmitReasonChange}
                />
            </div>

            {/* Submit Button */}
            <button className="btn btn-success" onClick={handleSubmitDetails}>Submit Details</button>
        </div>
    );
}
// Export the SubmitPatientDetails component for use in other parts of the application.
export default SubmitPatientDetails;