// PhysicianDisplay.component.js
/* Component for displaying detailed patient information and associated radiology images. 
It provides functionalities to view the images using the OHIF Viewer and navigate back to the physician choices. 
This component handles fetching patient details and images from the server and managing display states.*/

// Import React library, hooks for managing state and effects, and navigation utilities.
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Define the PhysicianDisplay functional component.
const PhysicianDisplay = () =>{

    // Initialize state variables for managing patient details, image sources, and identifiers for OHIF Viewer integration.
    const [patientDetails, setPatientDetails] = useState(null);
    const [orthancID, setOrthancID] = useState(null);
    const [StudyInstanceUID, setStudyInstanceUID] = useState(null);
    const [patientid,setPatientID] = useState(null);
    const [imageSrc, setImageSrc] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    // Fetch patient details on component mount or when the patient ID changes. Retrieve additional data like Orthanc ID for image display.
    useEffect(() => {
        const { pid } = location.state || {};
        if (pid) {
            fetch('http://localhost:3000/existingpatient', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pid }),
            })
            .then(response => response.json())
            .then(data => {
                if (data && data.patientDetails) {
                    setPatientID(data.patientDetails[0].patientid)
                    setPatientDetails(data.patientDetails[0]);
                    fetchOrthancID(pid);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
    }, [location.state]);

    // Load patient image using the Orthanc server link or fallback to a direct image path if available.
    useEffect(() => {
        if (patientid) {
            const imagePath = `http://localhost:3000/images/${patientid}.jpg`;  // URL as served by Express
            fetch(imagePath)
                .then(response => {
                    if (response.ok) {
                        setImageSrc(imagePath);
                    } else {
                        throw new Error('Image not found');
                    }
                })
                .catch(error => {
                    console.error('Image not found, using Orthanc image preview:', error.message);
                    setImageSrc(`http://localhost:8042/instances/${orthancID}/preview`);
                });
        }
    }, [patientid, orthancID]);
    
    // Retrieve the Orthanc ID from the backend to link patient details with radiology images stored in Orthanc.
    const fetchOrthancID = (pid) => {
        fetch(`http://localhost:3000/get-orthanc-id/${pid}`)
        .then(response => response.json())
        .then(data => {
            setOrthancID(data.sopIDs[(data.sopIDs.length-1)]);
            setStudyInstanceUID((data.studyInstanceUIDs[data.studyInstanceUIDs.length-1]))
        })
        .catch(error => {
            console.error('Error fetching Orthanc ID:', error);
        });
    };

    // Provide functionalities to view DICOM images in the OHIF viewer and to exit the current patient display.
    const handleOHIFView = () => {
        if (orthancID) {
            window.open(`http://localhost:3001/viewer/${StudyInstanceUID}`, '_blank');
        }
        navigate('/physician-choice');
    };

    const handleExitPatient=()=>{
            navigate('/physician-choice');
    }

    // Render the patient details and image, provide buttons for OHIF viewer and exiting, handle loading states.
    return(
        <div className="patient-details-section fade-in-effect">
    <h2 className="text-center">Patient Details</h2>
    {patientDetails ? (
        <div className="details-layout">
            {/* DICOM Image Section */}
            <div className="details-dicom">
                <h3>Radiology Image</h3>
                {imageSrc && (
                            <img 
                                src={imageSrc} 
                                alt=" " 
                                className="dicom-image"
                                style={{ width: '100%', height: 'auto', maxWidth: '400px' }}
                            />
                        )}
            </div>

            {/* Patient Information Section */}
            <div className="details-info">
                <h3>Patient Details</h3>
                <div className="patient-info-card">
                    <div className="info-card-body">
                        <p><strong>PID:</strong> {patientDetails.patientid}</p>
                        <p><strong>Name:</strong> {`${patientDetails.firstname} ${patientDetails.lastname}`}</p>
                        <p><strong>Gender:</strong> {patientDetails.gender}</p>
                        <p><strong>Address:</strong> {patientDetails.address}</p>
                        <p><strong>Admitted Department:</strong> {patientDetails.department}</p>
                        <p><strong>Attending Doctor:</strong> {patientDetails.doctor}</p>
                        <p><strong>Admit Reason:</strong> {patientDetails.admitreason}</p>
                    </div>
                </div>
            </div>
{/* View in OHIF Button */}
<div className="view-ohif-button-container">
    <button className="btn view-ohif" onClick={handleOHIFView}>View in OHIF</button>
</div>
<div className="view-ohif-button-container">
    <button className="btn view-ohif" onClick={handleExitPatient}>Exit</button>
</div>
        </div>
    ) : (
        <div className="text-center">
            <p>Loading patient details...</p>
        </div>
    )}
</div>
    )
}

// Export the PhysicianDisplay component for use in other parts of the application.
export default PhysicianDisplay;