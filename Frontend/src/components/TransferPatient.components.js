// TransferPatient.components.js
/* Component for handling the transfer of a patient to a new department within the healthcare facility. 
It provides a user interface to select a new department and doctor, and specify details for any required exams, 
especially if transferring to Radiology. Upon successful submission, it updates the patient's records accordingly.*/

// Import React library and useState for managing state, useNavigate for routing.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Define the TransferPatient functional component with props for managing success and error feedback.
function TransferPatient({ patientDetails, onSuccess, onError }) {
    // Initialize state variables for managing new department, doctor selection, exam details, and message statuses.
    const [newDepartment, setNewDepartment] = useState('');
    const [selectedNewDoctor, setSelectedNewDoctor] = useState('');
    const [examType, setExamType] = useState('');
    const [appointmentDate, setAppointmentDate] = useState('');
    const [preferredTime, setPreferredTime] = useState('');
    const [doctorsList, setDoctorsList] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    // Handles changes in department selection, updating doctor list and resetting exam fields if not transferring to Radiology.
    const handleDepartmentChange = (e) => {
        const departmentName = e.target.value;
        setNewDepartment(departmentName);
        if (departmentName === 'Radiology') {
            setDoctorsList(['Dr. Jennifer', 'Dr. Sneha']);
        } else if (departmentName === 'General') {
            setDoctorsList(['Dr. Purushothaman', 'Dr. Vasanth', 'Dr. Ashu Sharma']);
        } else if (departmentName === 'ICU') {
            setDoctorsList(['Dr. Saurabh Kumar', 'Dr. Mohammed Danish', 'Dr. Nikhil Sen']);
        } else {
            setDoctorsList([]);
        }
        if (departmentName !== 'Radiology') {
            setExamType('');
            setAppointmentDate('');
            setPreferredTime('');
        }
    };

    // Handles changes in doctor selection.
    const handleDoctorChange = (e) => {
        setSelectedNewDoctor(e.target.value);
    };

    // Submits the transfer details to the backend and processes the response to navigate or display messages.
    const submitTransfer = () => {
        if (!newDepartment || !selectedNewDoctor) {
            setError("Please select both a new department and a new doctor.");
            return;
        }
        if (newDepartment === 'Radiology' && (!examType || !appointmentDate || !preferredTime)) {
            setError("Please fill in all fields for the Radiology department.");
            return;
        }

        const transferData = {
            patientid: patientDetails.patientid,
            department:patientDetails.department,
            newDepartment,
            newDoctor: selectedNewDoctor,
            type: 'transfer',
            examType: newDepartment === 'Radiology' ? examType : undefined,
            appointmentDate: newDepartment === 'Radiology' ? appointmentDate : undefined,
            preferredTime: newDepartment === 'Radiology' ? preferredTime : undefined,
        };

        fetch('http://localhost:3000/submit-transfer-discharge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transferData),
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
                throw new Error(data.message || "An error occurred while submitting details.");
            }
        })
        .catch(error => {
            console.error("Error during transfer: " + error);
            setError("Error during transfer: " + error.message);
            onError(error.message);
            
        });
    };

    // Renders the form UI with dropdowns for department and doctor selection, conditional fields for Radiology, and a submit button.
    return (
        <div className="transfer-options-container fade-in-effect">
            <h4>Transfer Options</h4>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

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
                            <option value="CT">CT</option>
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

            {doctorsList.length > 0 && (
                <div className="input-group mb-3">
                    <label className="input-group-text" htmlFor="newDoctor">New Doctor:</label>
                    <select
                        className="form-select"
                        id="newDoctor"
                        value={selectedNewDoctor}
                        onChange={handleDoctorChange}
                    >
                        <option value="">Select Doctor</option>
                        {doctorsList.map((doc, index) => (
                            <option key={index} value={doc}>{doc}</option>
                        ))}
                    </select>
                </div>
            )}

            <button className="btn btn-success" onClick={submitTransfer}>Confirm Transfer</button>
        </div>
    );
}

// Export the TransferPatient component for use in other parts of the application.
export default TransferPatient;
