import React from 'react';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'; // Imports Bootstrap CSS for global styling.
import Navbar from 'react-bootstrap/Navbar'; // Imports Navbar component from React-Bootstrap.
import Nav from 'react-bootstrap/Nav'; // Imports Nav component from React-Bootstrap for navigation links.
import NavDropdown from 'react-bootstrap/NavDropdown'; // Imports NavDropdown for dropdown menu in navigation.
import './App.css'; // Imports custom CSS for additional styling.
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'; // Imports routing components from React Router.
import ModalityPatientEntry from './components/ModalityPatientEntry.component'; // Imports component for modality patient entry.
import UploadDicom from './components/uploadDicom.component'; // Imports component for uploading DICOM files.
import PhysicianLogin from './components/PhysicianLogin.component'; // Imports component for physician login.

import Login from './components/login.component'; // Imports component for user login.
import SignUp from './components/signup.component'; // Imports component for user sign-up.
import PatientType from './components/PatientType.component'; // Imports component for selecting patient type.
import NewPatient from './components/NewPatient.component'; // Imports component for registering a new patient.
import ExistingPatient from './components/ExistingPatient.component'; // Imports component for managing existing patients.
import EditPatient from './components/EditPatient.component'; // Imports component for editing patient details.
import DisplayDetails from './components/DisplayDetails.component'; // Imports component for displaying patient details.
import PhysicianDisplay from './components/PhysicianDisplay.component'; // Imports component for physician display interface.
import PhysicianChoice from './components/PhysicianChoice.components'; // Imports component for physician choices.

function App() {
  return (
    <Router>
      <div className="App fade-in-effect">
      <Navbar bg="primary" variant="dark" expand="lg" fixed="top">
  <div className="container">
    <Navbar.Brand as={Link} to="/sign-in">
      <img src="/QuantumCarePNG.png" alt="Quantum Care Logo" />
    </Navbar.Brand>
    <Navbar.Toggle aria-controls="basic-navbar-nav" />
    <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
  <Nav className="ml-auto">
    <NavDropdown title="LOGIN" id="staff-login-dropdown" style={{ color: "#ffffff" }}>
      <NavDropdown.Item as={Link} to="/sign-in">
        Staff Login
      </NavDropdown.Item>
      <NavDropdown.Item as={Link} to="/physician-login">
        Physician Login
      </NavDropdown.Item>
    </NavDropdown>
  </Nav>
</Navbar.Collapse>
  </div>
</Navbar>
        <div className="auth-wrapper">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/sign-in" element={<Login />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/patient-type" element={<PatientType />} />
            <Route path="/new-patient" element={<NewPatient />} />
            <Route path="/existing-patient" element={<ExistingPatient />} />
            <Route path="/edit-patient" element={<EditPatient />} />
            <Route path="/display-details" element={<DisplayDetails />} />
            <Route path="/modality-patient-entry" element={<ModalityPatientEntry/>}/>
            <Route path="/upload-dicom" element={<UploadDicom/>}/>
            <Route path="/physician-login" element={<PhysicianLogin />} />
            <Route path="/modality-patient-entry" element={<ModalityPatientEntry />} />
            <Route path="/physician-login" element={<PhysicianLogin />} />
            <Route path="/physician-display" element={<PhysicianDisplay />} />
            <Route path="/physician-choice" element={<PhysicianChoice />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
