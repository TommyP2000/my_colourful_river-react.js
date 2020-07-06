// Core modules for Firebase Admin functionality
const FireAdmin = require('firebase-admin');
const serviceAccount = require('C:\\Users\\Wendy\\Documents\\AppDev\\FirebaseCredentials\\my-colourful-river-firebase-adminsdk-bna4p-d0f1096dae.json');
const FireDB = FireAdmin.firestore();

// Initialise the Admin SDK functionality by using own service credentials

FireAdmin.initializeApp({
  credential: FireAdmin.credential.cert(serviceAccount),
  databaseURL: 'https://my-colourful-river.firebaseio.com',
});

module.exports = { FireAdmin, FireDB };
