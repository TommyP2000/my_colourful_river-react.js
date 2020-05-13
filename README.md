# my_colourful_river-react.js
 A social media web application built using React.JS, Express.JS, Redux and Material UI and is hosted through Google Firebase.

This is a work-in-progress React.JS web application that acts as a social media platform for users to make posts and share ideas with each other and to socially connect with each other. The initial idea behind this was to develop a social media platform that uses visual communication through the use of art, colours, photography, etc. In this case, the use of colour is used to show a user's personal mood, whether they are happy or sad, the post that they create will be highlighted in the colour that represents how they're currently feeling to other users. This application takes inspiration from the likes of Pinterest, Medium and Instagram, that combines the artistic and visual communication through Pinterest and the blogging structure of the online blog Medium.


This application is hosted through Google Firebase as a cloud-based server that stores user data in a secure NoSQL database. This helps act as the back-end of the application that manages the application's core features:

* User login and authentication

* Image uploading

* Notifications


Code example of creating a new social post (SparkPost):

```javascript

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
```

