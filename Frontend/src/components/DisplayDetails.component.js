// DisplayDetails.component.js
/* Component for displaying detailed information of a patient including radiology images and personal information. 
It provides options for editing, transferring, or discharging a patient and integrates modal views for image enlargement and interactive options.*/

// Import React library, hooks for state and effects, navigation, and icons for user interactions.
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PencilSquare, BoxArrowInRight, Check2Circle } from 'react-bootstrap-icons';
// Import sub-components for submitting patient details, transferring patients, and discharging patients.
import SubmitPatientDetails from './SubmitPatientDetails.components';
import TransferPatient from './TransferPatient.components';
import DischargePatient from './DischargePatient.components';

// Define the DisplayDetails functional component.
const DisplayDetails = () => {
    // Initialize state variables for managing patient details, Orthanc image IDs, modal states, and error/success messages.
    const [patientDetails, setPatientDetails] = useState(null);
    const [orthancIDs, setOrthancIDs] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentImageSrc, setCurrentImageSrc] = useState('');
    const [showTransferOptions, setShowTransferOptions] = useState(false);
    const [showSubmitOptions, setShowSubmitOptions] = useState(false);
    const [showDischargeConfirmation, setShowDischargeConfirmation] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    // Use effect to fetch patient details and Orthanc IDs when the component mounts or the patient ID changes.
    useEffect(() => {
        const { pid } = location.state || {};
        if (pid) {
            fetch(`http://localhost:3000/existingpatient`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pid }),
            })
            .then(response => response.json())
            .then(data => {
                if (data && data.patientDetails) {
                    setPatientDetails(data.patientDetails[0]);
                    fetchOrthancID(pid);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                setError('Failed to load patient details');
            });
        }
    }, [location.state]);

    const fetchOrthancID = (pid) => {
        fetch(`http://localhost:3000/get-orthanc-id/${pid}`)
        .then(response => response.json())
        .then(data => {
            if (data && data.sopIDs) {
                setOrthancIDs(data.sopIDs);
            }
        })
        .catch(error => {
            console.error('Error fetching Orthanc ID:', error);
            setError('Failed to fetch image data');
        });
    };

    // Functions to handle opening and closing of the modal for image enlargement.
    const openModal = (imageSrc) => {
        setCurrentImageSrc(imageSrc);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };
// Handles navigation to the edit patient page and updates for success or error messaging.
    const handleSuccess = message => {
        setSuccess(message);
    };

    const handleError = message => {
        setError(message);
    };
    const handleEdit = () => {
        navigate('/edit-patient', { state: { pid: patientDetails.patientid } });
    };
    
const getImageStyle = (numImages, index) => {
    let style = {
        height: 'auto', // Maintain aspect ratio
        maxWidth: '400px', // Limit the width to 200px or adjust as needed
        maxHeight: '400px', // Limit the height to 200px or adjust as needed
        width: '50%', // Default to half width for two images per row
    };

    if (numImages === 1) {
        style.width = '100%'; // One image takes full width
    } else if (numImages === 2) {
        style.width = '50%'; // Two images, each takes half width
    } else if (numImages === 3) {
        if (index === 2) {
            style.width = '100%'; // Third image takes full width
            style.display = 'block'; // Ensure it blocks to a new line
            style.margin = '0 auto'; // Center the image
        } else {
            style.width = '50%'; // First two images take half width each
        }
    } else if (numImages === 4) {
        style.width = '50%'; // Four images, two per row
    }

    return style;
};

// Render patient details, radiology images, and provide options for editing, transferring, and discharging the patient.
    return (
        <div className="patient-details-section fade-in-effect">
            <h2 className="text-center">Patient Details</h2>
            {patientDetails ? (
                <div className="details-layout">
                    <div className="details-dicom">
                        <h3>Radiology Images</h3>
                        <div className="dicom-grid" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                            {orthancIDs.map((id,index) => (
                                <img 
                                    key={id}
                                    src={`http://localhost:8042/instances/${id}/preview`} 
                                    alt="DICOM Preview"
                                    className="dicom-image"
                                    style={getImageStyle(orthancIDs.length,index)}
                                    onClick={() => openModal(`http://localhost:8042/instances/${id}/preview`)}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="details-info">
                        <button className="edit-button" onClick={handleEdit} style={{ float: 'right' }}>
                            <PencilSquare />
                        </button>
                        <div className="patient-info-card">
                            <div className="info-card-body">
                                <p><strong>PID:</strong> {patientDetails.patientid}</p>
                                <p><strong>Name:</strong> {`${patientDetails.firstname} ${patientDetails.lastname}`}</p>
                                <p><strong>Gender:</strong> {patientDetails.gender}</p>
                                <p><strong>Address:</strong> {patientDetails.address}</p>
                                <p><strong>Department:</strong> {patientDetails.department}</p>
                                <p><strong>Doctor:</strong>{patientDetails.doctor}</p>
                                <p><strong>Reason for Admission:</strong> {patientDetails.admitreason}</p>
                            </div>
                        </div>
                    </div>
                </div>
                ) : (
                <div className="text-center">
                <p>{error || 'Loading patient details...'}</p>
            </div>
                    )}
                                        {isModalOpen && (
            <div className="modal" onClick={closeModal}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <span className="close" onClick={closeModal}>&times;</span>
                    <img src={currentImageSrc} alt="Enlarged DICOM" className="enlarged-dicom-image" />
                </div>
            </div>
        )}

        <div className="details-buttons">
            <button 
                className="btn btn-primary" 
                onClick={() => setShowSubmitOptions(!showSubmitOptions)}>
                {showSubmitOptions ? 'Hide Visit Details' : 'Show Visit Details'}
                <Check2Circle />
            </button>
            <button 
                className="btn btn-secondary" 
                onClick={() => setShowTransferOptions(!showTransferOptions)}>
                Transfer Patient
                <BoxArrowInRight />
            </button>
            <button 
                className="btn btn-danger" 
                onClick={() => setShowDischargeConfirmation(!showDischargeConfirmation)}>
                Discharge
            </button>
        </div>

        {showSubmitOptions && (
            <SubmitPatientDetails
                patientDetails={patientDetails}
                onSuccess={handleSuccess}
                onError={handleError}
            />
        )}

        {showTransferOptions && (
            <TransferPatient
                patientDetails={patientDetails}
                onSuccess={handleSuccess}
                onError={handleError}
            />
        )}

        {showDischargeConfirmation && (
            <DischargePatient
                patientDetails={patientDetails}
                showDischargeConfirmation={showDischargeConfirmation}
                setShowDischargeConfirmation={setShowDischargeConfirmation}
                onSuccess={handleSuccess}
                onError={handleError}
            />
        )}
    </div>
);
};
// Export the DisplayDetails component for use in other parts of the application.
export default DisplayDetails;