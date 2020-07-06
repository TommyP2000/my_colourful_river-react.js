// Core modules for Firebase and Express functionality
const { request, response } = require('express');
const Firebase = require('firebase');
const FireConfig = require('../util/fireConfig');
const { FireAdmin, FireDB } = require('../util/fireAdmin');

const {
  validateRegisterData,
  validateLoginData,
} = require('../util/validation');

// Initalise Firebase functionality using config details from JS module
Firebase.initializeApp(FireConfig);

// Register route for user (Avatar) authentication using email and password

exports.registerAvatar = (request, response) => {
  const newAvatar = {
    avatarName: request.body.avatarName,
    avatarEmail: request.body.avatarEmail,
    avatarPassword: request.body.avatarPassword,
    confirmAvatarPassword: request.body.confirmAvatarPassword,
  };

  const { valid, errors } = validateRegisterData(newAvatar);

  if (!valid) return response.status(400).json(errors);

  // Once a new Avatar is registered, they start with a default profile image
  const defaultAvatarIMG = 'defaultAvatarIMG.png';

  // Authorise the Avatar registration, unless Avatar name and email are already taken
  let token, avatarID;
  FireDB.doc(`/avatars/${newAvatar.avatarName}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return response.status(400).json({
          avatarNameError:
            'This Avatar name is already taken, please try another name',
        });
      } else {
        return Firebase.auth().createUserWithEmailAndPassword(
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
      return response.status(201).json({ token });
    })
    .catch((err) => {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        return response
          .status(400)
          .json({ emailError: 'This email is already in use' });
      } else {
        return response.status(500).json({ error: err.code });
      }
    });
};

// Login route for user (Avatar) authentication using email and password

exports.loginAvatar = (request, response) => {
  const avatar = {
    avatarEmail: request.body.avatarEmail,
    avatarPassword: request.body.avatarPassword,
  };

  const { valid, errors } = validateLoginData(avatar);

  if (!valid) return response.status(400).json(errors);

  // Authorise Avatar login, unless password is incorrect

  Firebase.auth()
    .signInWithEmailAndPassword(avatar.avatarEmail, avatar.avatarPassword)
    .then((data) => {
      return data.user.getIdToken();
    })
    .then((token) => {
      return response.json({ token });
    })
    .catch((err) => {
      console.error(err);
      if (err.code === 'auth/wrong-password') {
        return response.status(403).json({
          passwordError: 'This password is incorrect, please try again',
        });
      } else return response.status(500).json({ loginError: err.code });
    });
};

exports.imageUpload = (request, response) => {
  // Busboy and file system functionality
  const BusBoy = require('busboy');
  const path = require('path');
  const os = require('os');
  const fs = require('fs');

  const busboy = new BusBoy({ headers: request.headers });

  let uploadedImage = {};

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    console.log(fieldname);
    console.log(filename);
    console.log(mimetype);
    // This string splits the file name with dots, to help separate the file name from the file extension
    const imageExtension = filename.split('.')[filename.split('.').length - 1];
    // The file name for each new image consists of random numbers as a placeholder name
    // E.g. 340234820823.png
    const imageFileName = `${Math.round(
      Math.random() * 10000000
    )}.${imageExtension}`;
    const filePath = path.join(os.tmpdir(), imageFileName);
    uploadedImage = { filepath: filePath, mimetype };
    file.pipe(fs.createWriteStream(filePath));
  });
  busboy.on('finish', () => {
    FireAdmin.storage()
      .bucket()
      .upload(uploadedImage.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: uploadedImage.mimetype,
          },
        },
      })
      .then(() => {
        const imageURL = `https://firebasestorage.googleapis.com/v0/b/${FireConfig.storageBucket}/o/${imageFileName}?alt=media`;
        return FireDB.doc(`/avatars/${request.avatar.avatarName}`)
          .update({
            imageURL,
          })
          .then(() => {
            return response
              .json({
                uploadMessage: 'Image has been uploaded successfully!',
              })
              .catch((err) => {
                console.error(err);
                return response.status(500).json({ uploadError: err.code });
              });
          });
      });
  });
};
