// This component is responsible for generating HL7 messages for different types of patient events such as admissions, transfers, and updates.

// Importing necessary modules for HL7 message generation, including utilities for formatting dates and handling encryption.
const moment = require('moment');
const cryptojs = require("crypto-js")
const{v4:uuidv4}=require("uuid")

// Formats the current datetime in the HL7 specified format (YYYYMMDDHHMMSS), which is required for various fields within the HL7 message structure.
const datetime=()=>{
    let now = moment();
    let formattedString = now.format('YYYYMMDDHHmmss');
    return formattedString
}

// Generates a unique message control ID for each HL7 message using a combination of UUID and hashing. This ensures that each message can be uniquely identified.
const generate_control_id=()=>{
    // Generate UUID
    const uuid = uuidv4();
    // Create SHA-256 hash
    const hash = cryptojs.SHA256(uuid);
    const message_control_id = hash.toString(cryptojs.enc.Hex).slice(0, 6);
    return message_control_id
}

// All the code below defines different functions to generate HL7 messages for various patient-related events. Each function prepares an HL7 message string according to the event type and provided patient details.

let gender='';
// Function to generate an HL7 ADT_A04 message for patient admissions. The ADT_A04 message is used to communicate information about a patient's admission to the healthcare facility but does not get admitted/outpatient.
module.exports.generateHL7_ADT_A04_Message = (patientdetails,PatientType) => {
    const MSH="MSH|^~\\&|QuantumCare|Quantum Care Hospital|Selene EHR|SeleneHospital|" +datetime()+ "||ADT^A04|"+generate_control_id()+"|P|2.8|\r"
    const EVN = "EVN||" + datetime() + "\r";
    //To set Gender according to HL7 format
    if(patientdetails.gender==="male"){
        gender='M'
    }else if(patientdetails.gender ==="female"){
        gender="F"
    }else{
        gender="O"
    }
    const PID = `PID|1||${patientdetails.pid}^^^^PI||${patientdetails.lname}^${patientdetails.fname}|||${gender}|||${patientdetails.addressLine1}`+"^^"+`${patientdetails.city}`+"^"+`${patientdetails.state}`+"^"+`${patientdetails.zipCode}`+"^"+"IND"+`|\r`;
    const PV1 = `PV1|${patientdetails.pv}|${PatientType}|${patientdetails.department}^^Quantum Care Hospital|||`+"null"+`|${patientdetails.doctor}|||${HospitalService}\r`;
    const PV2 = `PV2|||${patientdetails.admitreason}\r`;
    const hl7message = (MSH + "\n" + EVN + "\n" + PID + "\n" + PV1 + "\n" +PV2);
    console.log("\nADT_A04 Message: \n\n",hl7message);
    return hl7message
}

// Function to generate an HL7 ADT_A01 message for patient admissions. The ADT_A01 message is used to communicate information about a patient's admission to the healthcare facility but gets admitted/inpatient.
module.exports.generateHL7_ADT_A01_Message=(patientdetails,PatientType)=>{
    const MSH="MSH|^~\\&|QuantumCare|Quantum Care Hospital|Selene EHR|SeleneHospital|" +datetime()+ "||ADT^A01|"+generate_control_id()+"|P|2.8\r"
    const EVN = "EVN||" + datetime() + "\r";
    if(patientdetails.gender==="male"){
        gender='M'
    }else if(patientdetails.gender ==="female"){
        gender="F"
    }else{
        gender="O"
    }
    const PID = `PID|1||${patientdetails.pid}^^^^PI||${patientdetails.lname}^${patientdetails.fname}|||${gender}|||${patientdetails.addressLine1}`+"^^"+`${patientdetails.city}`+"^"+`${patientdetails.state}`+"^"+`${patientdetails.zipCode}`+"^"+"IND"+`|\r`;
    const PV1 = `PV1|${patientdetails.pv}|${PatientType}|${patientdetails.department}^^Quantum Care Hospital|||`+"null"+`|${patientdetails.doctor}|||${HospitalService}\r`;
    const PV2 = `PV2|||${patientdetails.admitreason}\r`;
    const hl7message = (MSH + "\n" + EVN + "\n" + PID + "\n" + PV1 + "\n" +PV2);
    console.log("\nADT_A01 Message: \n\n",hl7message);
    return hl7message
}

// Function to generate an HL7 ADT_A02 message for patient transfers. The ADT_A02 message is used to communicate information about a patient's transfer to or from different departments.
module.exports.generateHL7_ADT_A02_Message = (patientdetails) => {
    //Patient type and the Hospital Service need to be borrowed from previous ADT message.
    let HospitalService = '';
    const MSH = "MSH|^~\\&|QuantumCare|Quantum Care Hospital|Selene EHR|SeleneHospital|" + datetime() + "||ADT^A02|" + generate_control_id() + "|P|2.8\r";
    const EVN = "EVN||" + datetime() + "\r";
    if(patientdetails.gender==="male"){
        gender='M'
    }else if(patientdetails.gender ==="female"){
        gender="F"
    }else{
        gender="O"
    }
    const PID = `PID|1||${patientdetails.pid}^^^^PI||${patientdetails.lname}^${patientdetails.fname}|||${gender}|||${patientdetails.addressLine1}` + "^^" + `${patientdetails.city}` + "^" + `${patientdetails.state}` + "^" + `${patientdetails.zipCode}` + "^" + "IND" + `|\r`;
    const PV1 = `PV1|${patientdetails.pv}|${PatientType}|${patientdetails.department}^^Quantum Care Hospital|||${patientdetails.priorDepartment}|${patientdetails.doctor}|||${HospitalService}\r`;
    const PV2 = `PV2|||${patientdetails.admitreason}\r`;
    const hl7message = MSH + "\n" + EVN + "\n" + PID + "\n" + PV1 + "\n" + PV2;
    console.log("\nADT_A02 Message: \n\n", hl7message);
    return hl7message;
};

module.exports.generateHL7_ADT_A03_Message=(patientdetails)=>{
    const MSH="MSH|^~\\&|QuantumCare|Quantum Care Hospital|Selene EHR|SeleneHospital|" +datetime()+ "||ADT^A03|"+generate_control_id()+"|P|2.8\r"
    const EVN = "EVN||" + datetime() + "\r";
    if(patientdetails.gender==="male"){
        gender='M'
    }else if(patientdetails.gender ==="female"){
        gender="F"
    }else{
        gender="O"
    }
    const PID = `PID|1||${patientdetails.pid}^^^^PI||${patientdetails.lname}^${patientdetails.fname}|||${gender}|||${patientdetails.addressLine1}`+"^^"+`${patientdetails.city}`+"^"+`${patientdetails.state}`+"^"+`${patientdetails.zipcode}`+"^"+"IND"+`|\r`;
    const PV1 = `PV1|${patientdetails.pv}|${PatientType}|${patientdetails.department}^^Quantum Care Hospital|||`+"null"+`|${patientdetails.doctor}|||${HospitalService}\r`;
    const PV2 = `PV2|||${patientdetails.admitreason}\r`;
    const hl7message = (MSH + "\n" + EVN + "\n" + PID + "\n" + PV1 + "\n" +PV2);
    console.log("\nADT_A03 Message:\n\n",hl7message);
    return hl7message
}

// Function to generate an HL7 ADT_A08 message for updating patient information. The ADT_A08 message is used to communicate information about a patient's data that is edited/updated.
module.exports.generateHL7_ADT_A08_Message=(patientdetails)=>{
    const MSH="MSH|^~\\&|QuantumCare|Quantum Care Hospital|Selene EHR|SeleneHospital|" +datetime()+ "||ADT^A08|"+generate_control_id()+"|P|2.8\r"
    const EVN = "EVN||" + datetime() + "\r";
    if(patientdetails.gender==="male"){
        gender='M'
    }else if(patientdetails.gender==="female"){
        gender='F'
    }else if(patientdetails.gender==="other"){
        gender='O'
    }
    const PID = `PID|1||${patientdetails.pid}^^^^PI||${patientdetails.lname}^${patientdetails.fname}|||${gender}|||${patientdetails.addressLine1}`+"^"+`${patientdetails.city}`+"^"+`${patientdetails.state}`+"^"+`${patientdetails.zipCode}`+"^"+"IND"+`|\r`;
    const PV1 = `PV1|${patientdetails.pv}|${patientdetails.patientType}|${patientdetails.department}^^Quantum Care Hospital|||`+"null"+`|${patientdetails.doctor}|||${HospitalService}\r`;
    const PV2 = `PV2|||${patientdetails.admitreason}\r`;
    const hl7message = (MSH + "\n" + EVN + "\n" + PID + "\n" + PV1 + "\n" +PV2);
    console.log("\nADT_A08 Message: \n\n",hl7message);
    return hl7message
}

let PatientType = '';
let HospitalService = '';
module.exports.generate_hl7_message = (patientdetails,operationType) => {
// To set Patient Type according to HL7 format    
if (patientdetails.patientType === "Inpatient") {
        PatientType = 'I';
        HospitalService = 'MED';
    } else if (patientdetails.patientType === "Outpatient") {
        PatientType = 'O';
        HospitalService = 'MED';
    } else if (patientdetails.patientType === "Emergency") {
        PatientType = 'E';
        HospitalService = 'SUR';
    } else if (patientdetails.patientType === "Obstetrics") {
        PatientType = 'B';
        HospitalService = 'OB';
    } 

    // To decide which ADT message to be printed
    if (operationType==='A08'){
        return module.exports.generateHL7_ADT_A08_Message(patientdetails);       
    } else if(operationType==='A02'){
        return module.exports.generateHL7_ADT_A02_Message(patientdetails,PatientType);
    }else if(operationType==='A03'){
        return module.exports.generateHL7_ADT_A03_Message(patientdetails);
    }
        else if (PatientType === "O") {
       return  module.exports.generateHL7_ADT_A04_Message(patientdetails, PatientType);
    } else if (PatientType === "I") {
       return module.exports.generateHL7_ADT_A01_Message(patientdetails, PatientType);
    }
else if (PatientType === "E") {
    return module.exports.generateHL7_ADT_A01_Message(patientdetails, PatientType);
    }
    else if (PatientType === "B") {
    return module.exports.generateHL7_ADT_A01_Message(patientdetails, PatientType);
}
}
