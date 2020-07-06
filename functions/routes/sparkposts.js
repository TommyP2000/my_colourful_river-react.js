// Core modules for Firestore DB functionality
const { FireDB } = require('../util/admin');

// Retrieve a collection of SparkPosts from Firestore DB and order by date creation

exports.getAllSparkPosts = (request, response) => {
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
          sparkpostMood: doc.data().sparkpostMood,
          avatarName: doc.data().avatarName,
          createdAt: doc.data().createdAt,
        });
      });
      return response.json(sparkposts);
    })
    .catch((err) => {
      console.error(err);
      response.status(500).json({ GETError: err.code });
    });
};

// Create a new SparkPost and post to Firestore DB with the necessary parameters

exports.createSparkPost = (request, response) => {
  if (request.body.sparkpostBody.trim() === '') {
    return response
      .status(400)
      .json({ body: 'Body of SparkPost must not be empty' });
  }

  // Details for a new SparkPost
  const newSparkPost = {
    sparkpostTitle: request.body.sparkpostTitle,
    sparkpostBody: request.body.sparkpostBody,
    sparkpostMood: request.body.sparkpostMood,
    avatarName: request.user.avatarName,
    adminAvatar: request.body.adminAvatar,
    createdAt: new Date().toISOString(),
  };

  // Add the new SparkPost to the Firestore DB and, if the Promise is successful, respond with the appropriate message
  FireDB.collection('sparkposts')
    .add(newSparkPost)
    .then((doc) => {
      response.json({
        sparkpostSuccessful: `SparkPost with ID - ${doc.id} has been created successfully!`,
      });
    })
    .catch((err) => {
      response.status(500).json({
        sparkpostFailed:
          'Something went wrong with creating this SparkPost, please try again',
      });
      console.error(err);
    });
};
