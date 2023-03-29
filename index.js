
const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const CLIENT_ID = 'CLIENT_ID';
const CLIENT_SECRET = 'CLIENT_SECRET';
const REDIRECT_URL = 'http://localhost:3000/oauth2callback';

const app = express();
const server = http.createServer(app);
const socketServer = http.createServer();
const io = socketIO(socketServer);

const oauth2Client = new OAuth2Client(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URL
);


app.use(express.static('public'));


// Your application code here

server.listen(3000, () => {
    console.log('App listening on port 3000');
});

socketServer.listen(3001, () => {
  console.log('Socket server listening on port 3001');
});



app.get('/auth', (req, res) => {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/drive',
            'https://www.googleapis.com/auth/drive.file',
            'https://www.googleapis.com/auth/drive.metadata.readonly'
        ]
    });

    res.redirect(authUrl);
});

app.get('/drive', async (req, res) => {
  const files = await listFiles(oauth2Client);
  res.json(files);
});

app.get('/oauth2callback', async (req, res) => {
  const { code } = req.query;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  // Start real-time updates after setting the credentials
  // startRealtimeUpdates();

  res.redirect('/drive');
});


app.get('/download/:fileId', async (req, res) => {
  const { fileId } = req.params;
  try {
    const fileStream = await downloadFile(oauth2Client, fileId);

    // Set proper headers to download the file
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename=${fileId}`); // Set file name to the file ID

    // Pipe the file stream to the response
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).send('Error downloading file');
  }
});

app.get('/delete/:fileId', async (req, res) => {
  const { fileId } = req.params;
  try {
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    await drive.files.delete({ fileId: fileId });
    res.status(200).send('File deleted successfully');
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).send('Error deleting file');
  }
});

app.get('/permissions/:fileId', async (req, res) => {
  const { fileId } = req.params;
  try {
    const permissions = await listFilePermissions(oauth2Client, fileId);
    res.json(permissions);
  } catch (error) {
    console.error('Error listing permissions:', error);
    res.status(500).send('Error listing permissions');
  }
});

async function listFiles(auth) {
     if (!auth.credentials) {
    console.warn("No valid credentials. Skipping listFiles.");
    return [];
  }
    const drive = google.drive({
        version: 'v3',
        auth
    });
    const res = await drive.files.list({
        pageSize: 100, // Increase as needed
        fields: 'nextPageToken, files(id, name)',
    });
    return res.data.files;
}

async function downloadFile(auth, fileId) {
    const drive = google.drive({
        version: 'v3',
        auth
    });
    const res = await drive.files.get({
        fileId,
        alt: 'media'
    }, {
        responseType: 'stream'
    });
    return res.data;
}

async function deleteFile(auth, fileId) {
  const drive = google.drive({ version: 'v3', auth });
  await drive.files.delete({ fileId });
}

async function listFilePermissions(auth, fileId) {
    const drive = google.drive({
        version: 'v3',
        auth
    });
    const res = await drive.permissions.list({
        fileId
    });
    return res.data.permissions;
}

async function listFilePermissions(auth, fileId) {
  const drive = google.drive({
    version: 'v3',
    auth
  });
  try {
    const res = await drive.permissions.list({
      fileId,
      fields: 'permissions(id, type, emailAddress, role, displayName)'
    });
    return res.data.permissions;
  } catch (error) {
    console.error('Error listing permissions:', error);
    throw error;
  }
}

io.on('connection', async (socket) => {
    console.log('Client connected');

    if (oauth2Client.credentials) {
        const files = await listFiles(oauth2Client);
        socket.emit("files", files);

        // Start real-time updates after listing the files
        startRealtimeUpdates(socket);
    } else {
        console.warn("No valid credentials. Skipping file listing and real-time updates setup.");
    }

    socket.on('download', async (fileId) => {
        const fileStream = await downloadFile(oauth2Client, fileId);
        // Handle the file download
    });

    socket.on('listPermissions', async (fileId) => {
        const permissions = await listFilePermissions(oauth2Client, fileId);
        socket.emit('permissions', permissions);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});


