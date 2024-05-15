<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/RouteToVasanth/Quantum-Care">
    <img src="Screenshots/Logo.png" alt="Logo" width="80" height="80">
  </a>
<h3 align="center">Quantum Care - A Comprehensive Patient Management System</h3>
  <p>
Quantum Care Aims To Simulate a Typical Imaging Workflow As Seen In The Radiology Department of a Hospital
  </p>
</div>

![StaffLogin](https://github.com/RouteToVasanth/Quantum-Care/assets/160739091/7a75f330-89fc-4e7c-9e86-2f0b3849b831)

![NewPatient](https://github.com/RouteToVasanth/Quantum-Care/assets/160739091/0a7fd887-470e-4f54-ae3d-1e5d11d596b3)

![Physician Display](https://github.com/RouteToVasanth/Quantum-Care/assets/160739091/de552025-0af5-44d6-8da9-60e487185df2)

![OHIF Viewer](https://github.com/RouteToVasanth/Quantum-Care/assets/160739091/cfdae700-71cb-4c5e-b8b7-25bbec37e96a)

![PatientReport](https://github.com/RouteToVasanth/Quantum-Care/assets/160739091/53829c04-632e-4851-a68b-0db0d372de67)


<!-- ABOUT THE PROJECT -->
## About The Project

Quantum Care is a comprehensive healthcare management system designed to streamline various healthcare operations in a cost-effective manner. Our goal is to provide a robust solution that enhances patient management through efficient workflows and seamless data handling.

### Key Features:

**Open Standards:** By adhering to open standards, Quantum Care promotes compatibility and extensibility. This allows healthcare providers to easily integrate the system into their current infrastructure, ensuring long-term usability and support.

**Cost Effective:** Designed to minimize costs while maximizing efficiency, Quantum Care leverages modern technologies to provide a high-quality patient management system without the financial burden typically associated with similar solutions.

**Interoperability:** Built with interoperability in mind, Quantum Care uses open standards such as HL7 and DICOM to ensure seamless integration with existing healthcare systems. This facilitates smooth data exchange and communication across different platforms and services.

## Installation

## Setting Up MySQL Community Server

### Step 1: Download MySQL Community Server
1. **Visit the MySQL Community Downloads Page**:
   - [MySQL Community Downloads](https://dev.mysql.com/downloads/mysql/)
2. **Download MySQL Community Server**:
   - Download MySQL Community Server using MSI installer according to your operating system.
   - If prompted, you can skip the login/signup by clicking on "No thanks, just start my download".

### Step 2: Install MySQL Community Server
1. **Run the Installer**:
   - Once the download is complete, run the installer file.
2. **Choose Setup Type**:
   - In the MySQL Installer window, select the **Developer Default** setup type.
   - Click **Next** and proceed with the complete installation. The installer will download and install the selected MySQL products.

### Step 3: Configuration
1. **Server Configuration**:
   - After the installation, the MySQL Installer will prompt you to configure the server.
   - Select **Standalone MySQL Server**. Click **Next**.
   - Choose the default port (3306) and ensure that it is open and available. Click **Next**.

### Step 4: Authentication Method
1. **Set Authentication**:
   - Use the default authentication method (recommended). Click **Next**.
   - Set the root password for your MySQL server. Remember this password as you will need it to connect.
   - Optionally, add additional MySQL user accounts. Click **Next**.

### Step 5: Apply Configuration
1. **Apply Settings**:
   - Review the configuration settings and click **Execute** to apply them.
   - Once the configuration is complete, click **Finish**.

## Setting Up MySQL Workbench

### Step 1: Download Workbench
1. **Visit the MySQL Workbench Download Page**:
   - [MySQL Workbench Downloads](https://dev.mysql.com/downloads/workbench/)
2. **Download MySQL Workbench**:
   - Download MySQL Workbench using MSI installer according to your operating system.
   - Click the **Download** button and follow the prompts to download the installer.
   - If prompted, you can skip the login/signup by clicking on "No thanks, just start my download".

### Step 2: Install MySQL Workbench
1. **Run the Installer**:
   - Run the downloaded installer.
   - Follow the installation prompts to complete the installation.

### Step 3: Connect to MySQL Server using MySQL Workbench
1. **Launch MySQL Workbench**:
   - Create a New Connection by clicking on the **+** button next to **MySQL Connections**.

### Step 4: In the Setup New Connection Dialog
1. **Connection Settings**:
   - **Connection Name**: Enter a name for the connection (in this case "localhost").
   - **Connection Method**: Standard (TCP/IP).
   - **Port**: 3306 (or the port you configured during installation).
   - **Username**: root.
   - Click **OK**.

### Step 5: Launching the Connection
1. **Connect to Server**:
   - Click on the new connection, enter the root password of your MySQL Server, and click **OK**.
   - If there is any Connection Warning, just click **Continue Anyway**.
   - Ensure MySQL server status is Running by navigating to Services app on your system.

## Creating Database and Tables

### Step 1: Create a New SQL Tab for Executing Queries
1. **Open SQL Tab**:
   - Click on **File** > **New Query Tab**.

### Step 2: Create the Schema
1. **Enter and Execute Query**:
   - Enter the following query to create the database:
     ```sql
     CREATE DATABASE Quantum_Care;
     ```
   - Press **Ctrl+Enter** to execute it.

### Step 3: Select the New Schema
1. **Select Schema**:
   - Double click on the new schema "quantum_care" which is visible on the Navigator section (left-hand side).

### Step 4: Create Patients Table
1. **Enter and Execute Query**:
   - Enter the following query to create the patients table:
     ```sql
     CREATE TABLE `patients` (
         `patientid` varchar(45) NOT NULL,
         `firstname` varchar(45) NOT NULL,
         `lastname` varchar(45) NOT NULL,
         `gender` varchar(8) NOT NULL,
         `address` varchar(150) NOT NULL,
         `bdate` varchar(45) NOT NULL,
         PRIMARY KEY (`patientid`)
     ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
     ```

### Step 5: Create ADT Events Table
1. **Enter and Execute Query**:
   - Enter the following query to create the ADT Events table:
     ```sql
     CREATE TABLE `adtevents` (
         `patientid` varchar(45) NOT NULL,
         `messageid` varchar(45) NOT NULL,
         `eventtype` varchar(45) NOT NULL,
         `eventdatetime` datetime NOT NULL,
         `patienttype` varchar(15) NOT NULL,
         `admitreason` varchar(45) NOT NULL,
         `department` varchar(45) NOT NULL,
         `doctor` varchar(45) NOT NULL,
         `hospitalservice` varchar(10) NOT NULL,
         `priorlocation` varchar(45) NOT NULL,
         PRIMARY KEY (`messageid`),
         KEY `patientid_idx` (`patientid`),
         CONSTRAINT `patientid` FOREIGN KEY (`patientid`) REFERENCES `patients` (`patientid`) ON DELETE RESTRICT ON UPDATE RESTRICT
     ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
     ```

### Step 6: Create ADT Messages Table
1. **Enter and Execute Query**:
   - Enter the following query to create the ADT Messages table:
     ```sql
     CREATE TABLE `adtmessages` (
         `patientid` varchar(255) NOT NULL,
         `messageType` varchar(10) NOT NULL,
         `hl7Message` text NOT NULL,
         `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
     ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
     ```

### Step 7: Create Modality WorkList Table
1. **Enter and Execute Query**:
   - Enter the following query to create the Modality WorkList table:
     ```sql
     CREATE TABLE `mwl` (
         `patientid` varchar(45) NOT NULL,
         `examType` varchar(45) NOT NULL,
         `preferredDate` varchar(45) NOT NULL,
         `preferredTime` varchar(45) NOT NULL,
         `status` varchar(45) NOT NULL,
         `sopID` varchar(45) NOT NULL,
         `accessionNumber` varchar(45) NOT NULL,
         `StudyInstanceUID` varchar(200) DEFAULT NULL
     ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
     ```
Thank you for pointing that out. I'll update the instructions to accurately reflect the process within the same modal for adding a new user and setting the privileges. Here’s the revised README:

## Setting Up MongoDB Atlas

Step 1: **Log In to MongoDB Atlas**:
   - Visit the [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) website and log in.

Step 2: **Create a New Cluster** (if necessary):
   - If you already have a cluster, you can use it. Otherwise, create a new cluster.

### Configure Network Access and Database User

Step 1: **Whitelist IP Address**:(This might be done automatically)
   - Go to **Network Access** under the **Security** tab.
   - Ensure your IP address is whitelisted. If not, add it manually.

Step 2: **Create a Database User**:
   - Go to **Database Access** under the **Security** tab.
   - Click on **+ Add New Database User** to create a new user or **Edit** next to an existing user to update permissions.
   - Enter a username (e.g., `Quantum-Care`) and a strong password.
   - Select the " Add Built in Role " button under Database User Privileges
   - Set the user's roles by selecting **Atlas Admin** from the **Built-in Role** dropdown menu.
   - Click **Add User**.

## Install NodeJS
   - Download and Install [Node JS](https://nodejs.org/en/download) on your system.

## Connecting to MongoDB Atlas

**Get the Connection String**:
   - Select Overview in your MongoDB Atlas dashboard, navigate to your cluster and click on the **Connect** button.
   - Select **Drivers** under **Connect Your Application**.
   - Select **Node.js** as your driver with recommended versiom.
   - Copy the connection string provided. It will look something like this:
     ```plaintext
     mongodb+srv://<username>:<password>@quantum-care.j3vrjih.mongodb.net/Quantum-Care?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with your actual database username and password.

### Install Mongoose

**Open your terminal**:
   - Navigate to your project Server directory.
   - Run the following command to install Mongoose:
     ```sh
     npm install mongoose
     ```
     
## Project-Specific Integrations

### Updating `app.js` located in the Server folder.

Step 1: **Open `app.js` and Replace the Placeholder with the Actual Connection String**:
   ```javascript
   const mongooseurl = "mongodb+srv://<username>:<password>@quantum-care.j3vrjih.mongodb.net/Quantum-Care?retryWrites=true&w=majority";
   ```

Step 2: **Connect to MongoDB Using Mongoose**:
   - Ensure the connection setup in `app.js` looks like this:
   ```javascript
   const mongoose = require("mongoose");

   const mongooseurl = "mongodb+srv://<username>:<password>@quantum-care.j3vrjih.mongodb.net/Quantum-Care?retryWrites=true&w=majority";

   mongoose.connect(mongooseurl, {
       useNewUrlParser: true,
       useUnifiedTopology: true,
   }).then(() => {
       console.log("Connected to the Database");
   }).catch(e => console.log(e));
   ```

### Install mysql2

**Open your terminal**:
   - Navigate to your project Server directory.
   - Run the following command to install Mongoose:
     ```sh
     npm install mysql2

### Updating `database.js` located in the Server folder

**Configure the SQL Server connection**:
   - Open the `database.js` file and ensure the connection details are correct:
   ```javascript
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
```

## System Paths

**Update System Paths in `app.js`**:
   - Update the following paths in `app.js` to match your system's configuration:

   - Set the path for department images:
     ```plaintext
     Update `app.use('/department-images', logImageAccess, express.static(path.join('C:\\Users\\win10\\Desktop\\Quantum-Care\\Frontend\\src\\Department-Images')));`
     ```

   - Set the path for the PDF directory:
     ```plaintext
     Update `const pdfDirectory = 'C:\\Users\\win10\\Desktop\\Quantum-Care\\Server\\Patient-Pdfs';`
     ```

   - Set the path for the image directory:
     ```plaintext
     Update `const imageDirectory = 'C:\\Users\\win10\\Desktop\\Quantum-Care\\Server\\Annotated-Images';`
     ```

   - Set the path for the logo image used in PDF generation:
     ```plaintext
     Update `doc.image('C:\\Users\\win10\\Desktop\\Quantum-Care\\Server\\ICO.png', 50, 20, { width: 100 });`
     ```

   - Add logging middleware for image access attempts:
     ```plaintext
     Update `app.use('/images', (req, res, next) => { console.log('Access attempt for image:', req.url); next(); }, express.static('C:\\Users\\win10\\Desktop\\Quantum-Care\\Server\\Annotated-Images'));`
     ```
## Install Dependencies
Step 1: **Navigate to Server folder of the Project file on the command prompt**:
         Run the following command
   ```plaintext
   npm install
   ```

Step 2: **Check package.json**:
   - After running npm install, verify that react-scripts is listed in your package.json under the dependencies section. If it's missing, you can add it manually by running:
   ```plaintext
npm install react-scripts --save
   ```

## Setting Up Docker

Step 1: **Download and Install Docker Desktop**:
   - Visit the [Docker Desktop](https://www.docker.com/products/docker-desktop/) website to download the application.
   - Run the application and follow the installation guidelines.(May request for restaring your computer)

Step 2: **Open Docker Desktop**:
   - Open Docker Desktop using recommended settings

Step 3: **Run command prompt as administator on your system**:
   - Run the following command (Make sure your internet connection is stable and working)
   ```plaintext
   wsl --update
   ```
   - Now, start the docker engine on your docker desktop.
   
## Preparing to Launch Orthanc and OHIF Viewer

### Install DCMTK

Follow these steps in Windows PowerShell (run as Administrator) to install DCMTK:

Step 1: **Set the Execution Policy**
- This step ensures that you can run scripts on your system.
   ```powershell
   Set-ExecutionPolicy Bypass -Scope Process -Force
   ```

Step 2: **Install Chocolatey**
- Install Chocolatey, which you will use to install DCMTK. The following command sets the security protocol for the current session and installs Chocolatey from its official website.
   ```powershell
   [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
   iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
   ```

Step 3: **Install DCMTK Using Chocolatey**
- Once Chocolatey is installed, you can install DCMTK using the following command:
   ```powershell
   choco install dcmtk
   ```

## Setting Up ORTHANC and OHIF Viewer

**Run ORTHANC and OHIF Viewer**:

Step 1: Navigate to the "ohif-orthanc" directory in your command prompt.

Step 2: Execute the following command to start the services using Docker Compose. This command will build the containers if they aren't already built and then run them in detached mode.
   ```plaintext
   docker-compose up -d --build
   ```

## Verifying Orthanc and OHIF Viewer Setup

### Verify Running Services

1. **Orthanc**:
   - Open a web browser and navigate to `http://localhost:8042`. This is the default port for Orthanc.
   - You should see the Orthanc interface asking for a username and password.

2. **OHIF Viewer**:
   - In a separate tab, navigate to `http://localhost:3001`. This is the default port for the OHIF Viewer.
   - The OHIF Viewer should load, indicating it is properly communicating with Orthanc.

### Default Credentials

- **Username**: Quantum-Care
- **Password**: Quantum-care
  
### Changing Credentials
If you need to change the username and password, you can do so by modifying the Orthanc configuration:

Step 1: **Locate the Configuration File**:
   - Navigate to the `orthanc_db` directory inside the `ohif-viewer` folder.

Step 2: **Modify Credentials**:
   - Open the `orthanc.json` file.
   - Find the `RegisteredUsers` section:
     ```json
     "RegisteredUsers": {
       "Quantum-Care": "Quantum-care"
     }
     ```
   - Change `"Quantum-Care"` and `"Quantum-care"` to your desired username and password.

Step 3: **Restart Orthanc**:
   - To apply these changes, you may need to restart the Orthanc service. This can typically be done by running the following command in the directory containing your `docker-compose.yml`:
     ```plaintext
     docker-compose down
     docker-compose up -d
     ```
## Running the Quantum Care Application

### Start the Frontend

Step 1: **Open a New Terminal**:
   - Access a new terminal window to start the frontend part of the application.

Step 2: **Navigate to the Frontend Directory**:
   - Change to the Frontend directory located inside the Quantum-Care folder.
     
     ```plaintext
     cd path/to/Quantum-Care/Frontend
     ```

Step 3:  **Start the Frontend Server**:
   - Execute the following command:
     ```plaintext
     npm start
     ```
   - This will start the frontend of your project, and it should now be accessible via `http://localhost:3000` in your web browser.

### Start the Server

Step 1: **Open Another New Terminal**:
   - You'll need a separate terminal to start the server component.

Step 2: **Navigate to the Server Directory**:
   - Change to the Server directory located inside the Quantum-Care folder.
     
     ```plaintext
     cd path/to/Quantum-Care/Server
     ```

Step 3: **Launch the Server**:
   - Execute the following command:
     ```plaintext
     npm run dev
     ```
   - This command runs the server, connecting it to MongoDB and MySQL servers, and prepares it to handle requests from the frontend.

### Interact with the Project

With both the frontend and server running, you are now ready to interact with the Quantum Care system through your browser. Navigate to `http://localhost:3000` to start exploring the functionalities implemented in the project.
