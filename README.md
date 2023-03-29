## README

### Google Drive File Manager

#### Overview
This program is a simple Google Drive File Manager that allows users to connect to their Google Drive account, view a list of files, download files, delete files, and view file permissions. The program is implemented using Node.js, Express, Socket.IO, and Google Drive API.

#### Features
- View a list of files in your Google Drive.
- Download files from your Google Drive.
- Delete files from your Google Drive.
- View permissions of files in your Google Drive.

#### How to Execute

##### Prerequisites
- Node.js and npm installed on your machine.
- Google Cloud Platform project with the Drive API enabled.
- OAuth 2.0 client credentials (client ID and client secret) for the Google Cloud Platform project.

##### Steps
1. Clone the repository to your local machine.
2. Navigate to the project directory.
3. Open the program file and replace the `CLIENT_ID`, `CLIENT_SECRET`, and `REDIRECT_URL` variables with your OAuth 2.0 client credentials.
4. Install the required dependencies by running the following command:
    npm install
5. Start the server by running the following command:
    node index.js
6. Open your web browser and navigate to `http://localhost:3000`.
7. Click on the "Connect to Google Drive" link to authorize the application and grant access to your Google Drive.
8. After authorization, you will be redirected to the page displaying the list of files in your Google Drive.
9. Use the available options to download, delete, or view permissions for the files.

#### Disclaimer
Please use this program responsibly and ensure that you have the necessary permissions to access, download, and delete files in your Google Drive. The author is not responsible for any data loss or unauthorized access caused by the use of this program.
