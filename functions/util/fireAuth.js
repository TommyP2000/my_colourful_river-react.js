// Core modules for Firebase Admin and Firestore functionality
const { FireAdmin, FireDB } = require('./admin');

// This function provides middleware authentication for each route created by using the token

module.exports = (request, response, next) => {
  let idToken;
  if (
    request.headers.authorization &&
    request.headers.authorization.startsWith('Bearer ')
  ) {
    idToken = request.headers.authorization.split('Bearer ')[1];
  } else {
    console.error('No token found');
    return response.status(403).json({
      tokenError: 'Unauthorised access. You must be logged in to continue.',
    });
  }

  FireAdmin.auth()
    .verifyIdToken(idToken)
    .then((decodedIDToken) => {
      request.avatar = decodedIDToken;
      console.log(decodedIDToken);
      return FireDB.collection('avatars')
        .where('avatarID', '==', request.user.uid)
        .limit(1)
        .get();
    })
    .then((data) => {
      request.avatar.avatarName = data.docs[0].data().avatarName;
      return next();
    })
    .catch((err) => {
      console.error('Error while verifying token', err);
      return response.status(403).json(err);
    });
};
