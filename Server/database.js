// Importing mysql2/promise for MySQL database interactions with promise-based syntax.
const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: 'localhost',
  user: '<UserName of your MySQL Server>',
  password: '<Password of your MySQL Server>',
  database: 'Database name (quantum_care)',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Function to test database connection by executing a simple SELECT query.
async function testConnection() {
    try {
      const [rows, fields] = await pool.query('SELECT 1');
      console.log("Connected to SQL Database");
    } catch (error) {
      console.error("Not connected to Database", error);
    }
  }
  
  testConnection();

  // Function to insert new patient data into the database.
  async function insertMessage(messageData) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
  
      //Query to insert data into table(s)
      const [patient] = await connection.query('INSERT INTO patients (patientid, firstname, lastname, gender, address, bdate ) VALUES (?, ?, ?, ?, ?, ?)', [messageData.patientIdentifier, messageData.firstName, messageData.lastName, messageData.gender ,messageData.addressLine1, messageData.bdate]);
      const [adtevents] = await connection.query('INSERT INTO adtevents (patientid, messageid, eventtype, eventdatetime, patienttype, admitreason, department, doctor, hospitalservice, priorlocation ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [messageData.patientIdentifier, messageData.messageControlID, messageData.messageType, messageData.dateTime, messageData.patientType, messageData.admitreason, messageData.department, messageData.doctor, messageData.HospitalService, messageData.priorLocation]);
  
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
  
  // Function to retrieve patient details by their ID from the database.
  async function getPatientDetailsByPID(pid) {
    const query = `
      SELECT 
        p.patientid, 
        p.firstname, 
        p.lastname, 
        p.gender, 
        p.address,
        p.bdate,
        DATE_FORMAT(latestADT.eventdatetime, '%Y-%m-%d %H:%i:%s') AS Formatteddatetime,
        latestADT.department, 
        latestADT.admitreason,
        latestADT.doctor
      FROM 
        patients p
      LEFT JOIN (
        SELECT
          adt.patientid,
          adt.eventtype, 
          adt.eventdatetime, 
          adt.department, 
          adt.admitreason,
          adt.doctor
        FROM 
          adtevents adt
        INNER JOIN (
          SELECT 
            patientid, 
            MAX(eventdatetime) as LatestDateTime
          FROM 
            adtevents
          GROUP BY 
            patientid
        ) as LatestEvent ON adt.patientid = LatestEvent.patientid AND adt.eventdatetime = LatestEvent.LatestDateTime
      ) as latestADT ON p.patientid = latestADT.patientid
      WHERE 
        p.patientid = ?;
    `;
  
    try {
      const [rows] = await pool.query(query, [pid]);
      if (rows.length > 0) {
        return rows.map(row => ({
          patientid: row.patientid,
          firstname: row.firstname,
          lastname: row.lastname,
          gender: row.gender,
          address: row.address,
          eventdatetime: row.Formatteddatetime,
          department: row.department,
          admitreason: row.admitreason,
          doctor: row.doctor,
          bdate:row.bdate
        }));
      } else {
        return null; // No patient found with the given PID
      }
    } catch (error) {
      console.error('Error fetching patient details:', error);
      throw error;
    }
  }

  // Function to update existing patient data in the database.
  async function updatePatientDetailsByPID(pid, patientDetails) {
    const query = `
      UPDATE patients
      SET 
        firstname = ?,
        lastname = ?,
        gender = ?,
        address = ? 
      WHERE patientid = ?;
    `;
  
    try {
      const [result] = await pool.query(query, [
        patientDetails.fname,
        patientDetails.lname,
        patientDetails.gender,
        patientDetails.addressLine1,
        pid,
      ]);
  
      return result;
    } catch (error) {
      console.error('Error updating patient details by PID:', error);
      throw error;
    }
  }
  
  //Inserting the HL7 ADT Message of the corresponding Patient ID
  async function insertADTMessage(patientID, messageType, hl7Message) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
  

      const [hl7message] = await connection.query('INSERT INTO adtmessages (patientid, messageType, hl7Message ) VALUES (?, ?, ?)', [patientID, messageType, hl7Message]); 
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  //Inserting the ADT Events which is parsed from the HL7 message
  async function insertADTEvent(messageData) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
  
      //Query to insert data into table(s)
      const [hl7message] = await connection.query('INSERT INTO adtevents (patientid, messageid, eventtype, eventdatetime, patienttype, admitreason, department, doctor, hospitalservice, priorlocation ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [messageData.patientIdentifier, messageData.messageControlID, messageData.messageType, messageData.dateTime, messageData.patientType, messageData.admitreason, messageData.department, messageData.doctor, messageData.HospitalService, messageData.priorLocation]); 
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  //Inserting the patient into Modality Worklist, if the patient is admitted or transferred to Radiology Department
  async function insertMWLMessage(messageData) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const status = "Pending"
      const sopID = "Null"
      const accessionNumber = "Null"
      const StudyInstanceUID = "Null"
      const [mwl] = await connection.query('INSERT INTO mwl (patientid, examType, preferredDate, preferredTime, accessionNumber,status, sopID, StudyInstanceUID) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [messageData.pid, messageData.examType, messageData.preferredDate, messageData.preferredTime, accessionNumber, status, sopID, StudyInstanceUID]);
  
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

//Getting the patient details from the database
async function getMWLPatientDetailsByPID(pid) {
  const query = `
    SELECT 
      p.patientid, 
      p.firstname, 
      p.lastname, 
      p.gender,
      p.bdate, 
      adt.doctor,
      adt.department,
      adt.admitreason,
      mwl.examType,
      mwl.preferredDate,
      mwl.preferredTime,
      mwl.accessionNumber
    FROM 
      patients p
    LEFT JOIN adtevents adt ON p.patientid = adt.patientid
    AND adt.eventdatetime = (
        SELECT MAX(eventdatetime) 
        FROM adtevents 
        WHERE patientid = p.patientid
    )
    LEFT JOIN mwl ON p.patientid = mwl.patientid
    WHERE 
      p.patientid = ?;
  `;

  try {
    const [rows] = await pool.query(query, [pid]);
    if (rows.length > 0) {
      return rows.map(row => ({
        patientid: row.patientid,
        firstname: row.firstname,
        lastname: row.lastname,
        gender: row.gender,
        bdate: row.bdate,
        doctor: row.doctor,
        department: row.department,
        admitreason: row.admitreason,
        examType: row.examType,
        preferredDate: row.preferredDate,
        preferredTime: row.preferredTime,
        accessionNumber: row.accessionNumber
      }));
    } else {
      return null; // No patient found with the given PID
    }
  } catch (error) {
    console.error('Error fetching patient details:', error);
    throw error;
  }
}

//Updating the Modality WorkList when the Radiology image is uploaded to Orthanc
async function updateMWL(updateToMWL) {
  const query = `
    UPDATE mwl
    SET 
      status = ?,
      sopID = ?,
      accessionNumber = ?,
      StudyInstanceUID = ?
    WHERE patientid = ? and status="Pending";
  `;

  try {
    const [result] = await pool.query(query, [
      updateToMWL.Status,
      updateToMWL.sopID,
      updateToMWL.accessionNumber,
      updateToMWL.StudyInstanceUID,
      updateToMWL.pid
    ]);

    return result; // Contains info about how many rows were affected
  } catch (error) {
    console.error('Error updating patient details by PID:', error);
    throw error;
  }
}

//Getting SOPID and StudyInstanceUID for Orthanc Preview and OHIF Viewer
async function getOrthancIDByPatientID(patientID) {
  const query = `SELECT sopID, StudyInstanceUID FROM mwl WHERE patientid = ? AND status = 'Success' ORDER BY preferredDate DESC`;
  try {
      const [rows] = await pool.query(query, [patientID]);
      return rows;  // Return an array of all sopIDs
  } catch (error) {
      console.error('Error fetching Orthanc IDs:', error);
      throw error;
  }
}

  // Export functions for external use in the application.
  module.exports = {
    insertMessage,
    getPatientDetailsByPID,
    updatePatientDetailsByPID,
    insertADTMessage,
    insertADTEvent,
    insertMWLMessage,
    getMWLPatientDetailsByPID,
    updateMWL,
    getOrthancIDByPatientID
  };