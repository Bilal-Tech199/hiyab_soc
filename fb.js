const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { google } = require('googleapis');
const http=require('http')
const express = require('express');
const app = express();
const cors = require('cors');
const server = http.createServer(app);
const serviceAccount = require('./hiyab-afa75-firebase-adminsdk-u1d5s-4da9075c0b.json');
const registrationToken = 'fjw8vDGHSD-wGtc82epgR1:APA91bG7FNWNPu7ogMnORYvZ-s4vDWJqI0szycBU2cz2h6iIrdQSnqwbhsOmgAyIVBakuRVTHuzhHEqTklF1KWcaBA69TmAK6MmyO2QrlhntF_SUEKlAJo-sNdCorLjj2zykqKPFp_GA';

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://hiyab-afa75-default-rtdb.firebaseio.com"
  });

const message = {
  data: {
    key1: 'Firebase notification send ',
    key2: 'Send message'
  },
  notification: {
    title: 'Push notification test',
    body: 'Push notification working'
  },
  token: registrationToken
};


admin.messaging().send(message)
  .then((response) => {
    console.log('Successfully sent message:', response,"message:",message);
  })
  .catch((error) => {
    console.error('Error sending message:', error);
  });

const PORT = 3006;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

