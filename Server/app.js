// Main server file for Quantum Care, handling API endpoints, middleware, and database connections.

const express = require('express'); 
const app = express(); // Create an Express application instance
const cors = require("cors"); // Enable CORS for cross-origin HTTP requests
const bcrypt = require("bcrypt"); // Secure hashing of passwords
const jwt = require("jsonwebtoken"); // Handling JSON Web Tokens for secure transmission
const mongoose = require("mongoose"); // MongoDB object modeling tool
const cryptojs = require("crypto-js"); // Library for cryptographic operations
const db = require('./database'); // Database interaction logic
const { v4: uuidv4 } = require("uuid"); // Generate unique identifiers
const pdfParse = require('pdf-parse'); // Extract text data from PDF files
const jwttoken = process.env.JWT_SECRET || "abcdefghijklemnop()!!23njm"; // JWT secret for token generation
const mongooseurl = "mongodb+srv://<username>:<password>@quantum-care.j3vrjih.mongodb.net/Quantum-Care?retryWrites=true&w=majority"; // MongoDB connection string
const fs = require('fs'); // File system operations
const path = require('path'); // File and directory paths utilities
const PDFDocument = require('pdfkit'); // PDF generation library
const util = require('util'); // Utility functions
const exec = util.promisify(require('child_process').exec); // Promisify exec for async support
const axios = require('axios'); // HTTP client for requests

// Setting up multer for file uploads
const multer = require('multer');
const upload = multer({ 
  dest: 'uploads/dicoms/', // Upload destination for DICOM files
  limits: { fileSize: 1024 * 1024 * 50 } // Limit file size to 50MB
});
const uploadPdf = multer({ 
  dest: 'uploads/pdfs/', // Upload destination for PDF files
  limits: { fileSize: 1024 * 1024 * 50 } // Limit file size to 50MB
});


// Middleware to log each access attempt to image resources
function logImageAccess(req, res, next) {
  console.log(`Access attempt for image: ${req.url}`);
  next();
}

// Middleware for serving static images from a specified directory
// Adjust the path below according to your directory structure
app.use('/department-images', logImageAccess, express.static(path.join('C:\\Users\\win10\\Desktop\\Quantum-Care\\Frontend\\src\\Department-Images')));

// Middleware for enabling CORS and parsing JSON bodies
app.use(cors());
app.use(express.json());

// Import HL7 message generation and patient transfer details update functionalities
const { generate_hl7_message } = require('./hl7Generator.component');
const { updatePatientTransferDetails } = require('./database');

// Connect to MongoDB using the connection string, enabling new URL parser and unified topology for better performance
mongoose.connect(mongooseurl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("Connected to the Database");
}).catch(e => console.log(e));

// Function to parse HL7 messages based on message type and patient details
const parseHL7Message = (hl7Message, patientDetails, type) => {
  if (!hl7Message) {
    console.error('HL7 Message not found for Parsing !!');
    return {}; // Return an empty object if no message is found
  }
  const segments = hl7Message.split('\n'); // Split the message into segments for parsing

  // Initialize parsed data object
  const parsedData = {
    dateTime: "", 
    messageType: "",
    messageControlID: "",
    patientIdentifier: "",
    firstName: "",
    lastName: "",
    gender: "",
    examType: patientDetails.examType,
    bdate: patientDetails.bdate,
    addressLine1: "",
    patientType: "",
    admitreason: "",
    department: "",
    doctor: "",
    HospitalService: '',
    priorLocation: ''
  };

  // Parse each segment and populate the parsed data object
  segments.forEach(segment => {
    const fields = segment.split('|');
    switch(fields[0]) {
      case "MSH":
        parsedData.dateTime = fields[6];
        parsedData.messageType = (fields[8].split('^')[0] + '^' + fields[8].split('^')[1]);
        parsedData.messageControlID = fields[9];
        break;
      case "PID":
        parsedData.patientIdentifier = fields[3].split('^')[0];
        parsedData.firstName = fields[5].split('^')[1];
        parsedData.lastName = fields[5].split('^')[0];
        parsedData.gender = fields[8];
        parsedData.addressLine1 = fields[11].split('^').join(" ");
        break;
      case "PV1":
        parsedData.patientType = fields[2];
        parsedData.department = fields[3].split('^^')[0];
        parsedData.doctor = fields[7];
        parsedData.HospitalService = fields[10];
        parsedData.priorLocation = fields[6];
        break;
      case "PV2":
        parsedData.admitreason = fields[3];
        break;
    }
  });

  // Determine whether to insert an ADT event or a simple message based on the type
  if (type === "submit" || type === "transfer" || type === "discharge" || type === "edit") {
    db.insertADTEvent(parsedData);
  } else {
    db.insertMessage(parsedData)
      .then(() => console.log('\nHL7 Message inserted successfully\n'))
      .catch(err => console.error('Failed to insert HL7 message', err));
  }
  return parsedData;
};
// Importing user detail schemas from another module.
require("./userDetails");
const user = mongoose.model("UserInfo");
const newuser = mongoose.model("NewPatientRegistration");
const existingPatient = mongoose.model("ExistingPatientRegistration");
const Sequence = mongoose.model("SequenceSchema");

// Function to generate a unique patient ID using UUID and SHA256 hashing.
const generate_patient_id = () => {
    const uuid = uuidv4();
    const hash = cryptojs.SHA256(uuid);
    const patientID = hash.toString(cryptojs.enc.Hex).slice(0, 8);
    return patientID;
};

// Function to calculate age from a date string in the format YYYY-MM-DD.
function age(dateString) {
  const [year, month, day] = dateString.split('-');
  const birthday = new Date(year, month - 1, day);
  const today = new Date();
  let age = today.getFullYear() - birthday.getFullYear();
  const m = today.getMonth() - birthday.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) {
    age--;
  }
  return age;
}

// Function to get the current time in HH:MM format.
function getCurrentTime() {
  const now = new Date();
  let hours = now.getHours().toString().padStart(2, '0');
  let minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Async function to generate a PDF for patient details.
async function generatePDF(patientDetails) {
  return new Promise(async (resolve, reject) => {
    try {
      // Setup directories and file names for PDF and associated images.
      // Adjust the path below according to your directory structure
      const pdfDirectory = 'C:\\Users\\win10\\Desktop\\Quantum-Care\\Server\\Patient-Pdfs';
      const imageDirectory = 'C:\\Users\\win10\\Desktop\\Quantum-Care\\Server\\Annotated-Images';
      const fileName = `${sanitizeFileName(patientDetails.fname)}-${patientDetails.pid}-${getCurrentTime().replace(/:/g, '-')}.pdf`;
      const imageFileName = `${patientDetails.pid}.jpg`;
      const imageFilePath = path.join(imageDirectory, imageFileName);
      const filePath = path.join(pdfDirectory, fileName);

      // Initialize PDF document and stream setup.
      const doc = new PDFDocument();
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Layout of PDF including title, address, and demographics.
      // Formatting of headers and patient information inside the PDF.
      // Adjust the path below according to your directory structure
      doc.image('C:\\Users\\win10\\Desktop\\Quantum-Care\\Server\\ICO.png', 50, 20, { width: 100 });
      doc.fontSize(22).font('Helvetica-Bold').text('Quantum Care', { align: 'center' });
      doc.fontSize(10).font('Helvetica').text('#2103, Vasanth Layout, Purushotham Nagar, Bangalore 560069', { align: 'center' });
      doc.fontSize(10).text(`Date: ${new Date().toLocaleDateString()}`, doc.page.width - 150, 30, { align: 'right' });
      doc.moveTo(50, 125).lineTo(doc.page.width - 50, 125).lineWidth(3).stroke();

      // Further details section including diagnostics and treatment summary.
      let startY = 150;
      doc.fontSize(18).font('Helvetica-Bold').text('Discharge Summary', 70, startY - 7.5, { align: 'center', width: doc.page.width - 140 });
      startY += 15;
      doc.lineWidth(2).strokeColor('black').moveTo(70, startY).lineTo(550, startY).stroke();

      // Patient details and demographics formatted into the PDF.
      startY += 10;
      doc.fontSize(10).font('Helvetica').fillColor('black');
      const patientInfoStartX = 70;
      const quantumInfoStartX = 370;
      const lineSpacing = 25;
      const maxAddressWidth = 270;

      // Patient Demographics
      doc.fontSize(12)
        .text(`First Name: ${getDetail(patientDetails.fname)}`, patientInfoStartX, startY)
        .text(`Date of Birth: ${getDetail(patientDetails.bdate)}`, patientInfoStartX, startY += lineSpacing)
        .text(`Gender: ${getDetail(patientDetails.gender)}`, patientInfoStartX, startY += lineSpacing)
        .text(`Phone Number: ${getDetail(patientDetails.phoneNumber)}`, patientInfoStartX, startY += lineSpacing)
        .text(`Address Line 1: ${getDetail(patientDetails.addressLine1)}`, patientInfoStartX, startY += lineSpacing, { width: maxAddressWidth })
        .text(`Address Line 2: ${getDetail(patientDetails.addressLine2)}`, patientInfoStartX, startY += doc.heightOfString(patientDetails.addressLine1, { width: maxAddressWidth }) + 5, { width: maxAddressWidth })
        .text(`City: ${getDetail(patientDetails.city)}`, patientInfoStartX, startY += doc.heightOfString(patientDetails.addressLine2, { width: maxAddressWidth }) + 5)
        .text(`State: ${getDetail(patientDetails.state)}`, patientInfoStartX, startY += lineSpacing)
        .text(`Country: ${getDetail(patientDetails.country)}`, patientInfoStartX, startY += lineSpacing);

      // Quantum Care Information
      startY = 80 + lineSpacing * 3.8; // Reset startY for right column information
      doc.fontSize(12)
        .text(`Last Name: ${getDetail(patientDetails.lname)}`, quantumInfoStartX, startY)
        .text(`Age: ${getDetail(age(patientDetails.bdate))}`, quantumInfoStartX, startY += lineSpacing)
        .text(`Patient ID: ${getDetail(patientDetails.pid)}`, quantumInfoStartX, startY += lineSpacing)
        .text(`Department: ${getDetail(patientDetails.department)}`, quantumInfoStartX, startY += lineSpacing)
        .text(`Doctor: ${getDetail(patientDetails.doctor)}`, quantumInfoStartX, startY += lineSpacing)
        .text(`Admit Reason: ${getDetail(patientDetails.admitreason)}`, quantumInfoStartX, startY += lineSpacing)
        .text(`Time: ${getCurrentTime()}`, quantumInfoStartX, startY += lineSpacing)
        .text(`Zip Code: ${getDetail(patientDetails.zipCode)}`, quantumInfoStartX, startY += lineSpacing)
        .text(`Email: ${getDetail(patientDetails.email)}`, quantumInfoStartX, startY += lineSpacing);

      // Image inclusion and finalization of PDF.
      fs.access(imageFilePath, fs.constants.F_OK, (err) => {
        if (!err) {
          // If the image exists, add it to the PDF
          startY += doc.currentLineHeight() + 10;
          doc.fontSize(12)
            .font('Helvetica-Bold')
            .text('Radiology Image', 70, startY, { align: 'center', continued: true });
          startY += doc.currentLineHeight() + 10;
          const imageWidth = 300; 
          const imageX = (doc.page.width - imageWidth) / 2; 
          doc.image(imageFilePath, imageX, startY, { width: imageWidth });
          finalizePDF(doc, stream, filePath, resolve, reject);
        } else {
          finalizePDF(doc, stream, filePath, resolve, reject);
        }
      });
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      reject(error);
    }
  });
}

// Finalizes the PDF document and opens it.
function finalizePDF(doc, stream, filePath, resolve, reject) {
  doc.end();
  stream.on('finish', () => {
    import('open').then(open => {
      open.default(filePath)
        .then(() => resolve(filePath))
        .catch(error => reject(error));
    }).catch(error => reject(error));
  });
  stream.on('error', reject);
}

// Utility function to handle null values in patient details.
function getDetail(value) {
  return value ? value : 'N/A';
}

// Sanitizes the filename by removing invalid characters.
function sanitizeFileName(input) {
  return input.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}


// Modality codes and sequence numbers for Accession Number generation
const modalityCodes = {
  MRI: "MR",
  CT: "CT",
  XRay: "XR",
  Ultrasound: "US"
};


// Asynchronously generating an accession number for medical imaging studies.
async function generateAccessionNumber(department) {
  // Obtaining the current year to use as a prefix in the accession number.
  const year = new Date().getFullYear();

  // Retrieving the modality code based on the department (e.g., MR for MRI).
  const modalityCode = modalityCodes[department];
  // If there's no modality code for the department, return null.
  if (!modalityCode) return null;

  // Update and retrieve the next sequence number for the given modality code from the database.
  const sequenceEntry = await Sequence.findOneAndUpdate(
    { modalityCode: modalityCode },
    { $inc: { lastSequenceNumber: 1 } },  // Increment the sequence number atomically.
    { new: true, upsert: true }  // Return the updated document and create a new one if it doesn't exist.
  );

  // Format the sequence number to be four digits, padding with zeros if necessary.
  const sequence = sequenceEntry.lastSequenceNumber.toString().padStart(4, '0');
  
  // Construct the full accession number using the year, modality code, and sequence number.
  return `${year}-${modalityCode}-${sequence}`;
}

// Modifies DICOM files by updating their metadata according to the provided patient details.
async function modifyDicomFile(filePath, patientDetails) {
  // Replace backslashes in the file path to avoid escape issues on different platforms.
  const safeFilePath = filePath.replace(/\\/g, '/');
  // Format the patient's birthdate to remove hyphens for DICOM compatibility.
  const formattedBDate = patientDetails.bdate.replace(/-/g, '');
  // Format the study date to remove hyphens.
  const formattedStudyDate = patientDetails.preferredDate.replace(/-/g, '');
  // Format the study time to remove colons and append '00' to meet DICOM time format requirements.
  const formattedStudyTime = patientDetails.preferredTime.replace(/:/g, '') + '00';

  // Begin constructing the command to modify DICOM tags.
  let command = `dcmodify -ie ` +
                `-ma "(0010,0010)=${patientDetails.firstname} ${patientDetails.lastname}" ` +
                `-ma "(0008,0060)=${patientDetails.examType}" ` +
                `-ma "(0008,0020)=${formattedStudyDate}" ` +
                `-ma "(0008,0030)=${formattedStudyTime}" `;

  // Exclude patient ID for Ultrasound exams as a conditional DICOM tag modification.
  if (patientDetails.examType !== "Ultrasound") {
    command += `-ma "(0010,0020)=${patientDetails.patientid}" `;
  }

  // Include specific tags for CT and MRI related to patient demographics.
  if (patientDetails.examType === "CT" || patientDetails.examType === "MRI") {
    command += `-ma "(0010,0030)=${formattedBDate}" ` +
               `-ma "(0010,0040)=${patientDetails.gender}" `;
  }

  // Include the study description for certain modalities.
  if (["MRI", "Ultrasound", "Xray"].includes(patientDetails.examType)) {
    command += `-ma "(0008,1030)=${patientDetails.admitreason}" `;
  }

  // Include the accession number and referring physician's name for certain modalities.
  if (["CT", "MRI", "Xray"].includes(patientDetails.examType)) {
    command += `-ma "(0008,0050)=${patientDetails.accessionNumber}" ` +
               `-ma "(0008,0090)=${patientDetails.doctor}" `;
  }

  // Append the file path to the command and prevent backups.
  command += `${safeFilePath} -nb`;

  // Execute the command and handle the output.
  try {
    const { stdout, stderr } = await exec(command);
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return { success: false, message: `Error modifying DICOM tags: ${stderr}` };
    }
    console.log(`stdout: ${stdout}`);
    return { success: true, filePath: filePath };
  } catch (error) {
    console.error(`exec error: ${error}`);
    return { success: false, message: `Command execution failed: ${error.message}` };
  }
}

// Asynchronously uploads a DICOM file to an Orthanc server and handles the response.
async function uploadDicomToOrthanc(filePath) {
  try {
    // Read the modified DICOM file into a buffer for upload.
    const fileBuffer = fs.readFileSync(filePath);

    // Specify the URL of the Orthanc server for DICOM uploads.
    const orthancServerUrl = 'http://127.0.0.1:8042/instances';

    // Perform the POST request to upload the DICOM file.
    const uploadResponse = await axios.post(orthancServerUrl, fileBuffer, {
      headers: {
        'Content-Type': 'application/dicom',
        'Authorization': 'Basic ' + Buffer.from('Quantum-Care'+':'+'Quantum-care').toString('base64')
      }
    });

    // Check if the upload was successful and an ID was returned.
    if (uploadResponse.data && uploadResponse.data.ID) {
      // Retrieve detailed DICOM tags using the ID from the upload response.
      const tagsResponse = await axios.get(`http://127.0.0.1:8042/instances/${uploadResponse.data.ID}/simplified-tags`, {
        headers: {
          'Authorization': 'Basic ' + Buffer.from('Quantum-Care'+':'+'Quantum-care').toString('base64')
        }
      });

      // Extract the StudyInstanceUID from the DICOM tags, which is crucial for further processing.
      const studyInstanceUID = tagsResponse.data.StudyInstanceUID;

      // Return the IDs and status indicating successful upload and retrieval of DICOM tags.
      return {
        ID: uploadResponse.data.ID,
        StudyInstanceUID: studyInstanceUID,
        Status: "Success"
      };
    } else {
      // Log and return an error if no ID was retrieved, indicating a problem with the upload.
      console.error('Failed to retrieve ID from Orthanc response');
      return {
        Status: "Error",
        Message: "Failed to upload file or retrieve ID"
      };
    }
  } catch (error) {
    // Log and rethrow errors related to network issues or server errors.
    console.error('Error uploading DICOM to Orthanc:', error);
    throw error;
  }
}

// Endpoint for registering new staff members with POST requests.
app.post("/signup", async (req, res) => {
  // Extract email, password, and confirmPassword from the request body.
  const { email, password, confirmPassword } = req.body;

  // Validate the presence of email and passwords and ensure they are not empty.
  if (!email || !password || !confirmPassword) {
    return res.status(400).json({ status: "error", message: "Enter Valid Details" });
  }

  // Ensure the password and confirmPassword fields match.
  if (password !== confirmPassword) {
    return res.status(400).json({ status: "error", message: "Passwords do not match!" });
  }

  try {
    // Check for existing user with the same email to prevent duplicates.
    const oldUser = await user.findOne({ email });
    if (oldUser) {
      return res.status(400).json({ status: "error", message: "User email already exists!" });
    }

    // Hash the password using bcrypt for secure storage.
    const encryptPassword = await bcrypt.hash(password, 10);

    // Create a new user record in the database with the hashed password.
    await user.create({
      email,
      password: encryptPassword
    });

    // Respond with success if the user was created successfully.
    res.status(201).json({ status: "ok", data: email });
  } catch (error) {
    // Log and respond with error if there are issues during the signup process.
    console.error("Error in signup:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

// Endpoint for authenticating staff members with POST requests.
app.post("/signin", async (req, res) => {
  // Extract email and password from the request body.
  const { email, password } = req.body;
  try {
    // Attempt to find an existing user by email.
    const oldUser = await user.findOne({ email });
    if (!oldUser) {
      // If no user is found, return a 404 error.
      return res.status(404).json({ status: "error", error: "User Not Found" });
    }
    // Compare the provided password with the stored hashed password.
    if (await bcrypt.compare(password, oldUser.password)) {
      // If the password is correct, generate a JWT token.
      const token = jwt.sign({ email: oldUser.email }, jwttoken);
      // Send back the token if the login is successful.
      res.status(200).json({ status: "ok", data: { token } });
    } else {
      // If the password is invalid, send an error response.
      res.status(401).json({ status: "error", error: "Invalid Password" });
    }
  } catch (error) {
    // Log the error internally and send back a generic error message.
    console.error("Error in signin:", error);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
});

// Endpoint for adding new patient records with POST requests.
app.post("/newpatient", async (req, res) => {
  try {
    const patientdetails = req.body;  // Retrieve patient details from the request body.
    if (!patientdetails) {  // Validate if the patient details are provided.
        return res.status(400).json({ status: "error", error: "Invalid patient details" });
    }
    // Destructure and extract patient details from the request body.
    const { fname, lname, bdate, gender, addressLine1, addressLine2, city, state, zipCode, country, phoneNumber, patientType, admitreason, email, department, doctor, examType, preferredDate,preferredTime } = patientdetails;

    // Check if a patient with the same email already exists in the database.
    const existingPatient = await newuser.findOne({ email: email });
    if (existingPatient) {
        return res.status(400).json({ status: "error", error: "Email already exists" });
    }

    // Generate a new unique patient ID.
    const pid = generate_patient_id();
    let pv=1;  // Set patient visit number to 1 for new records.

    // Create a new patient record in the database.
    const newPatient = await newuser.create({
        pid, pv, fname, lname, bdate, gender, addressLine1, addressLine2, city, state, zipCode, country, phoneNumber, patientType, admitreason, email, department, doctor,examType, preferredDate,preferredTime
    });
    // Prepare patient details for generating HL7 message.
    const patientDetails={
        pid: newPatient.pid,
        pv: newPatient.pv,
        fname: newPatient.fname,
        lname: newPatient.lname,
        bdate: newPatient.bdate,
        gender: newPatient.gender,
        addressLine1: newPatient.addressLine1,
        addressLine2: newPatient.addressLine2,
        city: newPatient.city,
        state: newPatient.state,
        zipCode: newPatient.zipCode,
        country: newPatient.country,
        phoneNumber: newPatient.phoneNumber,
        patientType: newPatient.patientType,
        admitreason: newPatient.admitreason,
        email: newPatient.email,
        department : newPatient.department,
        doctor : newPatient.doctor,
        examType : newPatient.examType,
        preferredDate : newPatient.preferredDate,
        preferredTime:newPatient.preferredTime,
        accessionNumber : ''
    }

    // Generate HL7 message for the new patient.
    const hl7Message=generate_hl7_message(patientDetails)
    if (!hl7Message) {
        return res.status(500).json({ status: "error", error: "Failed to generate HL7 message" });
    }
    try {
      // If the department is Radiology, insert a Modality Worklist message.
      if(patientDetails.department === 'Radiology'){
          await db.insertMWLMessage(patientDetails);
      }
      // Parse the generated HL7 message and insert it into the database.
      const parsedMessage = parseHL7Message(hl7Message, patientDetails, 'null');
      await db.insertADTMessage(patientDetails.pid, parsedMessage.messageType, hl7Message);
      // Return the newly created patient details along with the parsed HL7 message.
      res.status(201).json({status: "ok", newPatient: patientDetails, parsedMessage: parsedMessage});
  } catch (err) {
      // Handle errors related to patient data processing.
      res.status(500).json({ status: "error", error: "Failed to process patient data" });
  }
} catch (error) {
  // Handle general errors in the endpoint.
  res.status(500).json({ status: "error", error: "Internal server error" });
}
});

// Endpoint for fetching and updating existing patient records.
app.post("/existingpatient", async (req, res) => {
  const { pid } = req.body; // Extract patient ID from the request body.
  try {
      // Attempt to find an existing patient in the database using the provided patient ID.
      const patient = await newuser.findOne({ pid: pid });
      if (!patient) { // If no patient is found, respond with an error.
          return res.status(404).json({ status: "error", error: "Patient Not Found!!" });
      }
      // Retrieve detailed patient information from the database.
      const patientdetails = await db.getPatientDetailsByPID(pid);
      if (!patientdetails) { // If no details are found, respond with an error.
          return res.status(404).json({ status: "error", error: "Patient details not found." });
      }
      // Fetch the Orthanc ID associated with the patient, if available.
      const orthancID = await db.getOrthancIDByPatientID(pid);
      if (orthancID) {
        patientdetails.orthancID = orthancID; // Assign the Orthanc ID to the patient details if found.
      } else {
        patientdetails.orthancID = null; // Set Orthanc ID to null if not found.
      }
      // Respond with the patient details including the Orthanc ID.
      res.status(200).json({patientDetails: patientdetails })
  } catch (error) {
      // Log and respond with errors encountered during the operation.
      console.error("Error in existingpatient:", error);
      res.status(500).json({ status: "error", error: "Existing Patient Internal server error"});
}
});

// Endpoint to retrieve Orthanc IDs for a specific patient.
app.get('/get-orthanc-id/:patientID', async (req, res) => {
  const { patientID } = req.params; // Extract patient ID from request parameters.
  try {
      // Fetch all Orthanc IDs related to the given patient ID from the database.
      const orthancIDs = await db.getOrthancIDByPatientID(patientID);
      if (orthancIDs && orthancIDs.length > 0) {
        // Map the retrieved data to create arrays of SOP IDs and StudyInstanceUIDs.
        const sopIDs = orthancIDs.map(({ sopID }) => sopID);
        const studyInstanceUIDs = orthancIDs.map(({ StudyInstanceUID }) => StudyInstanceUID);
        // Respond with the SOP IDs and StudyInstanceUIDs.
        res.json({ sopIDs, studyInstanceUIDs });
      } else {
        // If no Orthanc IDs are found, respond with an error message.
        res.status(404).json({ message: "No DICOM images found for the given patient ID." });
      }
  } catch (error) {
      // Log and respond with any errors encountered during the operation.
      console.error("Error fetching Orthanc IDs:", error);
      res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint to retrieve details for a specific patient by PID from the database.
app.get("/get-patient/:pid", async (req, res) => {
  const { pid } = req.params; // Extract the patient ID (PID) from the request parameters.
  try {
    // Attempt to find the patient by PID in the database.
    const patient = await newuser.findOne({ pid: pid });
    if (!patient) {
      // If no patient is found, return a 404 Not Found status with a message.
      return res.status(404).json({ message: "Patient not found" });
    }
    // If a patient is found, return the patient's data.
    res.json(patient);
  } catch (error) {
    // Log any errors and return a 500 Internal Server Error status.
    console.error("Error fetching patient:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint to edit/update existing patient records via POST request.
app.post("/editpatient", async (req, res) => {
  const { pid, ...patientDetails } = req.body;  // Extract PID and other details from the request body.
  const identifier = { pid };  // Prepare the identifier for the MongoDB query.

  try {
    // Attempt to update the patient record in the database and return the new document.
    const updated = await newuser.findOneAndUpdate(identifier, {
      $set: { ...patientDetails },
    }, { new: true });
    
    // Adjust the gender representation to conform to HL7 requirements.
    let genderHL7 = updated.gender;
    if (updated.gender === "male") {
      genderHL7 = "M";
    } else if (updated.gender === "female") {
      genderHL7 = "F";
    } else if (updated.gender === "other") {
      genderHL7 = "O";
    }

    // Update additional patient details in another database component, if necessary.
    const updateResult = await db.updatePatientDetailsByPID(pid, {...updated.toObject(), gender: genderHL7});

    // Generate an HL7 message with the updated patient data.
    const hl7Message = generate_hl7_message({...updated.toObject(), gender: genderHL7}, 'A08');
    const parsedMessage = parseHL7Message(hl7Message, updated, "edit");
    db.insertADTMessage(updated.pid, 'A08', hl7Message);
    
    // Check if the database update affected any rows/documents.
    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ message: "Patient not found or no changes made." });
    }

    // Send a response back with success message and the HL7 message.
    res.status(200).json({ message: "Patient updated successfully", hl7Message });
  } catch (error) {
    // Log the error and return an Internal Server Error status.
    console.error("Error updating patient:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint for transferring patients between different departments and doctors
app.post('/submit-transfer-discharge', async (req, res) => {
  const patientdata = req.body; // Get patient data from request body
  try {
    // Fetch the patient by ID to ensure they exist
    const patient = await newuser.findOne({ pid: patientdata.patientid});
    if (!patient) {
      return res.status(404).json({ message: "Patient Not Found!!" });
    }
    patient.pv = patient.pv+1; // Increment the patient version to track changes

    if(patientdata.type === "submit"){
      // Update patient details for a new submission
      patient.department=patientdata.department,
      patient.doctor = patientdata.doctor,
      patient.admitreason =patientdata.admitReason,
      patient.patientType = patientdata.patientType,
      await patient.save(); // Save updated patient details

      // Prepare patient details for HL7 message generation
      const submitpatientDetails = {
        pid : patient.pid,
        lname : patient.lname,
        fname : patient.fname,
        gender : patient.gender,
        addressLine1 : patient.addressLine1,
        city : patient.city,
        state : patient.state,
        zipCode : patient.zipCode,
        pv : patient.pv,
        department : patientdata.department,
        admitreason : patientdata.admitReason,
        doctor : patientdata.doctor,
        patientType : patientdata.patientType,
        examType: patientdata.examType,
        preferredDate: patientdata.appointmentDate,
        preferredTime: patientdata.preferredTime
      };

      try {
        // Generate and process HL7 message based on patient type
        const hl7Message = submitpatientDetails.patientType==="Outpatient"
          ? generate_hl7_message(submitpatientDetails, "A04")
          : generate_hl7_message(submitpatientDetails, "A01");
        
        if(submitpatientDetails.department==="Radiology"){
          // Insert a modality worklist entry if department is Radiology
          await db.insertMWLMessage(submitpatientDetails);
        }

        // Parse the HL7 message and insert it into the database
        const parsedHL7Message = parseHL7Message(hl7Message, "Null", patientdata.type);
        db.insertADTMessage(submitpatientDetails.pid, parsedHL7Message.messageType, hl7Message);
        res.status(200).json({ status:"ok", message: "Patient details submitted successfully." });
      } catch (error) {
        console.error("Error inserting ADT message:", error);
        res.status(500).json({ status:"error", error: "Failed to submit patient details." });
      }
    } else if (patientdata.type === "transfer") {
      // Handle patient transfer to a new department or doctor
      const transferDetails = {
        pid : patient.pid,
        lname : patient.lname,
        fname : patient.fname,
        gender : patient.gender,
        addressLine1 : patient.addressLine1,
        city : patient.city,
        state : patient.state,
        zipCode : patient.zipCode,
        pv : patient.pv,
        priorDepartment : patient.department,
        department : patientdata.newDepartment,
        doctor : patientdata.newDoctor,
        admitreason : patient.admitreason,
        patientType : patient.patientType,
        examType: patientdata.examType,
        preferredDate: patientdata.appointmentDate,
        preferredTime: patientdata.preferredTime
      };

      // Update the patient's department and doctor
      patient.department = patientdata.newDepartment,
      patient.doctor = patientdata.newDoctor,
      await patient.save(); // Save changes to the patient record

      try {
        // Generate and insert an HL7 transfer message
        const hl7TransferMessage = generate_hl7_message(transferDetails, "A02");
        if(transferDetails.department === 'Radiology'){
          // Insert a modality worklist entry if department is Radiology
          await db.insertMWLMessage(transferDetails);
        }
        const parsedHL7TransferMessage = parseHL7Message(hl7TransferMessage, "Null", patientdata.type);
        db.insertADTMessage(transferDetails.pid, "A02", hl7TransferMessage);
        res.status(200).json({ status:"ok", message: "Patient Transferred Successfully" });
      } catch (error) {
        console.error("Error inserting ADT message:", error);
        res.status(500).json({ status:"error", error: "Failed to submit patient details." });
      }
    } else if (patientdata.type === "discharge") {
      // Handle patient discharge
      const dischargeDetails = {
        pid : patient.pid,
        lname : patient.lname,
        fname : patient.fname,
        gender : patient.gender, 
        addressLine1 : patient.addressLine1,
        city : patient.city,
        state : patient.state,
        zipcode : patient.zipCode,
        pv : patient.pv,
        department : patient.department,
        doctor: patient.doctor,
        admitreason : patient.admitreason,
        patientType : patient.patientType
      };

      try {
        // Generate and parse a discharge HL7 message
        const hl7DischargeMessage = generate_hl7_message(dischargeDetails, 'A03');
        const parsedHL7DischargeMessage = parseHL7Message(hl7DischargeMessage, "Null", patientdata.type);
        db.insertADTMessage(dischargeDetails.pid, "A03", hl7DischargeMessage);
        generatePDF(patient).then((pdfPath) => {
          // Send the generated PDF file as a response
          res.sendFile(pdfPath);
        }).catch((error) => {
          // Handle PDF generation errors
          console.error('Error generating PDF:', error);
          res.status(500).json({ status:"error", error: "Error Generating Discharge Summary." });
        });
        res.status(200).json({ status:"ok", message: "Patient details submitted successfully." });
      } catch (error) {
        console.error("Error inserting ADT message:", error);
        res.status(500).json({ status:"error", error: "Failed to Discharge patient." });
      }
    }
  } catch (error) {
    console.error("Error in /submit-transfer-discharge:", error);
    // Send back a generic error message to the client
    res.status(500).json({ status: "error", error: "Error processing request. Please try again later." });
  }
});

// Endpoint for parsing patient reports uploaded in PDF format to auto-fill new patient registration forms.
app.post('/parse-patient-pdf', uploadPdf.single('patientPdf'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ status: "error", error: 'No PDF file was uploaded.' }); // Error if no PDF file is uploaded
  }

  let dataBuffer = fs.readFileSync(req.file.path); // Read the PDF file from the upload path
  pdfParse(dataBuffer).then(data => {
      const details = extractPatientDetails(data.text); // Extract patient details from the parsed PDF text
      return res.status(201).json({ status: "ok", data:details}); // Send extracted details back to client
  }).catch(error => {
      console.error('Error parsing PDF:', error); // Log errors during PDF parsing
      return res.status(400).json({ status: "error", error: 'Error Parsing the PDF' }); // Send error response if parsing fails
  });
});

// Function to extract patient details from PDF text
function extractPatientDetails(text) {
  let details = {
      // Extracts patient details using regular expressions from the structured PDF text
      firstName: text.match(/First Name:\s*(.*)/)?.[1],
      lastName: text.match(/Last Name:\s*(.*)/)?.[1],
      bdate: text.match(/Date of Birth:\s*(.*)/)?.[1],
      gender: text.match(/Gender:\s*(.*)/)?.[1].toLowerCase(), // Normalize the gender value to match form options
      addressLine1: text.match(/Address Line 1:\s*(.*)/)?.[1],
      addressLine2: text.match(/Address Line 2:\s*(.*)/)?.[1],
      city: text.match(/City:\s*(.*)/)?.[1],
      state: text.match(/State:\s*(.*)/)?.[1],
      zipCode: text.match(/Zip Code:\s*(.*)/)?.[1],
      country: text.match(/Country:\s*(.*)/)?.[1],
      phoneNumber: text.match(/Phone Number:\s*(.*)/)?.[1],
      email: text.match(/Email:\s*(.*)/)?.[1],
  };

  // Normalize gender to match the select options in the form
  if(details.gender === "male" || details.gender === "m") {
    details.gender = "male";
  } else if(details.gender === "female" || details.gender === "f") {
    details.gender = "female";
  } else if(details.gender === "other" || details.gender === "o") {
    details.gender = "other";
  } else {
    details.gender = ""; // Set to empty if unmatched to ensure form validation can handle it
  }

  return details; // Return the extracted details
}

// Endpoint to upload DICOM files and update patient details in the medical workflow
app.post('/uploadDicom', upload.single('dicomFile'), async(req, res) => {
  if (!req.file) {
    return res.status(400).send('DICOM file is required.'); // Ensure a DICOM file is provided
  }

  let patientDetails;
  try {
    patientDetails = JSON.parse(req.body.patientDetails); // Parse patient details from request body
  } catch (error) {
    return res.status(400).send('Invalid patient details format.'); // Handle errors in patient details format
  }

  const AccessionNumber = await generateAccessionNumber(patientDetails.examType); // Generate an accession number based on the exam type
  patientDetails.accessionNumber = AccessionNumber; // Assign the generated accession number to patient details

  const modifiedDicomFilePath = await modifyDicomFile(req.file.path, patientDetails); // Modify the DICOM file with patient and exam details
  const orthancResponse = await uploadDicomToOrthanc(modifiedDicomFilePath.filePath); // Upload the modified DICOM file to Orthanc server

  if(orthancResponse.Status === "Success") {
    const updateToMWL = {
      pid: patientDetails.patientid,
      sopID: orthancResponse.ID,
      Status: orthancResponse.Status,
      StudyInstanceUID: orthancResponse.StudyInstanceUID,
      accessionNumber: patientDetails.accessionNumber
    };
    db.updateMWL(updateToMWL); // Update the modality worklist with the new details
  }

  res.status(200).json({ message: 'DICOM file and patient details received successfully.', orthancResponse:orthancResponse }); // Send success response with Orthanc server response
});

// Endpoint to retrieve modality patient entry details from the database
app.post("/modalitypatiententry", async (req, res) => {
  const { pid } = req.body;
  try {
    const patient = await newuser.findOne({ pid: pid }); // Attempt to find patient by PID
    if (!patient) {
      return res.status(404).json({ message: "Patient Not Found!!" }); // Respond with not found if no patient
    }
    const patientdetails = await db.getMWLPatientDetailsByPID(pid); // Fetch patient details from modality worklist (MWL)
    if (!patientdetails) {
      return res.status(404).json({ message: "Patient details not found." }); // Respond with not found if details are missing
    }
    res.status(200).json({ patientDetails: patientdetails }); // Return patient details if found
  } catch (error) {
    console.error("Error in existingpatient:", error); // Log errors
    res.status(500).json({ status: "error", error: "Existing Patient Internal server error" }); // Respond with server error
  }
});

// Middleware to serve static images from a specified directory
// Adjust the path below according to your directory structure
app.use('/images', express.static('C:\\Users\\win10\\Desktop\\Quantum-Care\\Server\\Annotated-Images'));

// Additional logging middleware to record access attempts to the image directory
// Adjust the path below according to your directory structure
app.use('/images', (req, res, next) => {
  console.log(`Access attempt for image: ${req.url}`); // Log the access attempt with the request URL
  next(); // Continue to the next middleware function
}, express.static('C:\\Users\\win10\\Desktop\\Quantum-Care\\Server\\Annotated-Images')); // Serve static images from the specified directory again


// Start the server on the specified port, listening for incoming requests.
const PORT = process.env.PORT || 3000;

// Log a message to the console to indicate the server is running and listening for requests.
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});