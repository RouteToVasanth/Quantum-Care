// Import mongoose library to create schemas and interact with MongoDB
const mongoose = require("mongoose");

// Schema definition for user details
const userDetailSchema = new mongoose.Schema({
    email:{type:String,unique:true},
    password:String
},
{
    collection:"UserInfo",    // Specify the collection name in MongoDB
});

// Schema definition for new patient registration
const patientSchema1 = new mongoose.Schema({
    pid: String,
    pv: Number,
    fname: String,
    lname: String,
    bdate: String,
    gender: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    phoneNumber: String,
    patientType:String,
    admitreason:String,
    email: String,
    department: String,
    doctor: String,
    examType: String, 
    preferredDate:String,
    preferredTime:String
},
{
    collection:"NewPatientRegistration",
});

// Schema definition for existing patient registration
const patientSchema2 = new mongoose.Schema({
    pid: String,
    patientType:String,
    admitreason:String,
    hl7message:String
},
{
    collection:"ExistingPatientRegistration",
});

// Schema definition for keeping track of the sequence of modality codes
const sequenceSchema = new mongoose.Schema({
    modalityCode: String,
    lastSequenceNumber: Number,
  },{
    collation:"SequenceSchema",
  });

// Export the models based on the schemas defined above
module.exports = {
    UserInfo: mongoose.model("UserInfo", userDetailSchema),
    NewPatientRegistration: mongoose.model('NewPatientRegistration', patientSchema1),
    ExistingPatientRegistration: mongoose.model('ExistingPatientRegistration', patientSchema2),
    SequenceSchema:mongoose.model('SequenceSchema',sequenceSchema),
};