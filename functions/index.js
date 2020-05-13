const firebase = require('firebase');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('express')();

const firebaseConfig = {
  apiKey: 'AIzaSyB53CHlmMzXEUxUag46K9uslSo5aAMlBhM',
  authDomain: 'my-colourful-river.firebaseapp.com',
  databaseURL: 'https://my-colourful-river.firebaseio.com',
  projectId: 'my-colourful-river',
  storageBucket: 'my-colourful-river.appspot.com',
  messagingSenderId: '696474519777',
  appId: '1:696474519777:web:c110ee01697e5823ae4fa0',
};

firebase.initializeApp(firebaseConfig);

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'https://my-colourful-river.firebaseio.com',
});

const FireDB = admin.firestore();

// Retrieve collection of SparkPosts from Firebase and order by date creation

app.get('/sparkposts', (request, response) => {
  FireDB.collection('sparkposts')
    .orderBy('createdAt', 'desc')
    .get()
    .then((data) => {
      let sparkposts = [];
      data.forEach((doc) => {
        sparkposts.push({
          sparkpostID: doc.id,
          sparkpostTitle: doc.data().sparkpostTitle,
          sparkpostBody: doc.data().sparkpostBody,
          avatarName: doc.data().avatarName,
          createdAt: doc.data().createdAt,
        });
      });
      return response.json(sparkposts);
    })
    .catch((err) => console.error(err));
});

// Create new SparkPost and post to Firebase with the following parameters

app.post('/sparkpost', (request, response) => {
  const newSparkPost = {
    sparkpostTitle: request.body.sparkpostTitle,
    sparkpostBody: request.body.sparkpostBody,
    sparkpostMood: request.body.sparkpostMood,
    avatarName: request.body.avatarName,
    adminAvatar: request.body.adminAvatar,
    createdAt: new Date().toISOString(),
  };

  FireDB.collection('sparkposts')
    .add(newSparkPost)
    .then((doc) => {
      response.json({
        message: `SparkPost with ID - ${doc.id} has been created successfully!`,
      });
    })
    .catch((err) => {
      response.status(500).json({
        error:
          'Something went wrong with creating this SparkPost, please try again!',
      });
      console.error(err);
    });
});

const isEmail = (avatarEmail) => {
  // eslint-disable-next-line no-useless-escape
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (avatarEmail.match(regEx)) return true;
  else return false;
};

const isEmpty = (string) => {
  if (string.trim() === '') return true;
  else return false;
};

// Register route for user (Avatar) authentication with email and password
app.post('/register', (req, res) => {
  const newAvatar = {
    avatarName: req.body.avatarName,
    avatarEmail: req.body.avatarEmail,
    avatarPassword: req.body.avatarPassword,
    confirmAvatarPassword: req.body.confirmAvatarPassword,
  };

  const validateErrors = {};
  if (isEmpty(newAvatar.avatarName))
    validateErrors.avatarName = 'Must not be empty!';
  if (isEmpty(newAvatar.avatarEmail)) {
    validateErrors.avatarEmail = 'Must not be empty!';
  } else if (!isEmail(newAvatar.avatarEmail)) {
    validateErrors.avatarEmail = 'Must be a valid email address!';
  }
  if (isEmpty(newAvatar.avatarPassword))
    validateErrors.avatarPassword = 'Must not be empty!';
  if (newAvatar.avatarPassword !== newAvatar.confirmAvatarPassword)
    validateErrors.confirmAvatarPassword = 'Passwords must match!';

  if (Object.keys(validateErrors).length > 0)
    return res.status(400).json(validateErrors);

  // TODO: Validate data
  let token, avatarID;
  FireDB.doc(`/avatars/${newAvatar.avatarName}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res.status(400).json({
          avatarName:
            'This Avatar name is already taken, please try another name!',
        });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(
            newAvatar.avatarEmail,
            newAvatar.avatarPassword
          );
      }
    })
    .then((data) => {
      avatarID = data.user.uid;
      return data.user.getIdToken();
    })
    .then((avatarToken) => {
      token = avatarToken;
      const avatarCredentials = {
        avatarName: newAvatar.avatarName,
        avatarEmail: newAvatar.avatarEmail,
        createdAt: new Date().toISOString(),
        avatarID,
      };
      return FireDB.doc(`/avatars/${newAvatar.avatarName}`).set(
        avatarCredentials
      );
    })
    .then(() => {
      return res.status(201).json({ token });
    })
    .catch((err) => {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        return res
          .status(400)
          .json({ emailError: 'This email is already in use!' });
      } else {
        return res.status(500).json({ error: err.code });
      }
    });
});

// Register the functions to this HTTP route with this European server

exports.api = functions.region('europe-west2').https.onRequest(app);
