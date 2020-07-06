// Core modules for Firebase and Express functionality
const app = require('express')();
const functions = require('firebase-functions');

// Project modules for route functions and admin functionality

const { FireAuth } = require('./util/fireAuth');
const { getAllSparkPosts, createSparkPost } = require('./routes/sparkposts');
const { registerAvatar, loginAvatar, uploadImage } = require('./routes/avatar');

// Once Firebase has initialised, initialise route functionality

// Get all SparkPosts from Firestore DB
app.get('/sparkposts', getAllSparkPosts);

// Create and post new SparkPost to Firestore DB
app.post('/sparkpost', FireAuth, createSparkPost);

// Register new Avatar and post details to Firestore DB
app.post('/register', registerAvatar);

// Login existing Avatar with matching details in Firestore DB
app.post('/login', loginAvatar);

// Upload image file to Firestore DB
app.post('/avatar/image', FireAuth, uploadImage);

// Register the functions to this HTTP route with this European server

exports.api = functions.region('europe-west2').https.onRequest(app);
